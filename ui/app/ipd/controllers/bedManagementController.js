'use strict';

angular.module('bahmni.ipd')
    .controller('BedManagementController', ['$scope', '$rootScope', '$stateParams', '$state', 'spinner', 'WardService', 'BedManagementService',
        function ($scope, $rootScope, $stateParams, $state, spinner, wardService, bedManagementService) {
            $scope.wards = null;

            var init = function () {
                loadAllWards().then(function () {
                    if ($rootScope.bedDetails) {
                        expandAdmissionMasterForDepartment({
                            uuid: $rootScope.bedDetails.wardUuid,
                            name: $rootScope.bedDetails.wardName
                        });
                    } else if ($stateParams.context && $stateParams.context.department) {
                        expandAdmissionMasterForDepartment($stateParams.context.department);
                    }
                });
            };

            var loadAllWards = function () {
                return spinner.forPromise(wardService.getWardsList().success(function (wardsList) {
                    $scope.wards = wardsList.results;
                }));
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

            var getRoomsForWard = function (bedLayouts) {
                var rooms = mapRoomInfo(_.groupBy(bedLayouts, 'location'));
                _.each(rooms, function (room) {
                    room.beds = bedManagementService.createLayoutGrid(room.beds);
                });
                return rooms;
            };

            var getWardDetails = function (department) {
                return _.filter($scope.wards, function (entry) {
                    return entry.ward.uuid == department.uuid;
                });
            };

            var loadBedsInfoForWard = function (department) {
                return wardService.bedsForWard(department.uuid).then(function (response) {
                    var wardDetails = getWardDetails(department);
                    var rooms = getRoomsForWard(response.data.bedLayouts);
                    $scope.ward = {
                        rooms: rooms,
                        uuid: department.uuid,
                        name: department.name,
                        totalBeds: wardDetails[0].totalBeds,
                        occupiedBeds: wardDetails[0].occupiedBeds
                    };
                    $scope.departmentSelected = true;
                    $scope.$broadcast("event:departmentChanged");
                });
            };

            var expandAdmissionMasterForDepartment = function (department) {
                spinner.forPromise(loadBedsInfoForWard(department));
            };

            $scope.onSelectDepartment = function (department) {
                spinner.forPromise(loadBedsInfoForWard(department).then(function () {
                    resetPatientAndBedInfo();
                }));
            };

            var resetPatientAndBedInfo = function () {
                $scope.roomName = undefined;
                $scope.bed = undefined;
                goToBedManagement();
            };

            $scope.$on("event:patientAssignedToBed", function (event, bed) {
                $scope.ward.occupiedBeds = $scope.ward.occupiedBeds + 1;
                _.map($scope.ward.rooms, function (room) {
                    if (room.name === $scope.roomName) {
                        room.availableBeds = room.availableBeds - 1;
                    }
                });
            });

            $scope.$on("event:bedSelected", function (event, bed) {
                $scope.bed = bed;
            });

            $scope.$on("event:roomSelected", function (event, roomName) {
                $scope.roomName = roomName;
                $scope.bed = undefined;
                goToBedManagement();
            });

            $scope.$on("event:roomSelectedAuto", function (event, roomName) {
                $scope.roomName = roomName;
                $scope.bed = undefined;
            });

            var goToBedManagement = function () {
                if ($state.current.name == "bedManagement.bed") {
                    var options = {};
                    options['context'] = {
                        department: {
                            uuid: $scope.ward.uuid,
                            name: $scope.ward.name
                        },
                        roomName: $scope.roomName
                    };
                    options['dashboardCachebuster'] = Math.random();
                    $state.go("bedManagement", options);
                }
            };

            init();
        }]);
