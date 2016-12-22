'use strict';

angular.module('bahmni.ipd')
    .controller('BedManagementController', [
        '$scope', '$rootScope', '$stateParams', '$state', 'spinner', 'WardService', 'backlinkService', 'patientService', 'configurations', '$translate',
        function ($scope, $rootScope, $stateParams, $state, spinner, wardService, backlinkService, patientService, configurations, $translate) {
            $scope.wards = null;
            $scope.patientUuid = $stateParams.patientUuid;
            $scope.visitUuid = $stateParams.visitUuid;
            $scope.state = $state.current.name;

            var init = function () {
                if ($scope.state == "bedManagement") {
                    $scope.patient = undefined;
                } else if ($scope.patientUuid) {
                    assignPatientDetails();
                }
                loadAllWards().then(function () {
                    if ($rootScope.bedDetails) {
                        $scope.onSelectDepartment({
                            uuid: $rootScope.bedDetails.wardUuid,
                            name: $rootScope.bedDetails.wardName
                        });
                    }
                });
            };

            var loadAllWards = function () {
                return spinner.forPromise(wardService.getWardsList().success(function (wardsList) {
                    $scope.wards = wardsList.results;
                }));
            };

            var assignPatientDetails = function () {
                var patientMapper = new Bahmni.PatientMapper(configurations.patientConfig(), $rootScope, $translate);
                return patientService.getPatient($scope.patientUuid).then(function (response) {
                    var openMrsPatient = response.data;
                    $scope.patient = patientMapper.map(openMrsPatient);
                });
            };

            var mapRoomInfo = function (roomsInfo) {
                var mappedRooms = [];
                _.forIn(roomsInfo, function (value, key) {
                    var bedsGroupedByBedStatus = _.groupBy(value, 'status');
                    var availableBeds = bedsGroupedByBedStatus["AVAILABLE"] ? bedsGroupedByBedStatus["AVAILABLE"].length : 0;
                    mappedRooms.push({name: key, beds: value, totalBeds: value.length, availableBeds: availableBeds});
                });
                return mappedRooms;
            };

            $scope.onSelectDepartment = function (department) {
                spinner.forPromise(wardService.bedsForWard(department.uuid).success(function (response) {
                    var wardDetails = _.filter($scope.wards, function (entry) {
                        return entry.ward.uuid == department.uuid;
                    });

                    var rooms = mapRoomInfo(_.groupBy(response.bedLayouts, 'location'));
                    $scope.ward = {
                        rooms: rooms,
                        uuid: department.uuid,
                        name: department.name,
                        totalBeds: wardDetails[0].totalBeds,
                        occupiedBeds: wardDetails[0].occupiedBeds
                    };
                    $scope.departmentSelected = true;
                    $scope.$broadcast("event:departmentChanged");
                    $scope.roomName = undefined;
                }));
            };

            $scope.isDepartmentSelected = function () {
                return $scope.departmentSelected;
            };

            $scope.$on("event:bedSelected", function (event, bed) {
                $scope.bed = bed;
            });

            $scope.$on("event:roomSelected", function (event, roomName) {
                $scope.roomName = roomName;
            });

            init();
        }]);
