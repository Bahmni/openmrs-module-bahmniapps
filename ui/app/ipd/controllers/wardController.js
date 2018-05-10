'use strict';

angular.module('bahmni.ipd')
    .controller('WardController', ['$scope', '$rootScope', '$stateParams', '$state',
        function ($scope, $rootScope, $stateParams, $state) {
            var init = function () {
                if ($stateParams.context && $stateParams.context.roomName) {
                    expandAdmissionMasterForRoom($stateParams.context.roomName);
                } else if ($rootScope.bedDetails) {
                    expandAdmissionMasterForRoom($rootScope.bedDetails.physicalLocationName);
                }
            };

            var getSelectedRoom = function (roomName) {
                var admissionRoom = _.filter($scope.ward.rooms, function (room) {
                    return room.name === roomName;
                });
                $scope.room = admissionRoom[0];
                $scope.activeRoom = $scope.room.name;
                $scope.roomSelected = true;
            };

            $scope.$on("event:deselectWards", function (event, ward) {
                $scope.activeRoom = null;
            });

            var updateSelectedBedInfo = function (roomName) {
                $rootScope.selectedBedInfo.roomName = roomName;
                $rootScope.selectedBedInfo.bed = undefined;
            };

            $scope.onSelectRoom = function (roomName) {
                updateSelectedBedInfo(roomName);
                getSelectedRoom(roomName);
                $scope.$emit("event:roomSelected", roomName);
                $scope.$broadcast("event:changeBedList", roomName);
                $scope.activeRoom = roomName;
                goToBedManagement();
                if (window.scrollY > 0) {
                    window.scrollTo(0, 0);
                }
            };

            var expandAdmissionMasterForRoom = function (roomName) {
                updateSelectedBedInfo(roomName);
                getSelectedRoom(roomName);
            };

            $scope.$on("event:departmentChanged", function (event) {
                $scope.roomSelected = false;
            });

            var goToBedManagement = function () {
                if ($state.current.name === "bedManagement.bed") {
                    var options = {};
                    options['context'] = {
                        department: {
                            uuid: $scope.ward.uuid,
                            name: $scope.ward.name
                        },
                        roomName: $rootScope.selectedBedInfo.roomName
                    };
                    options['dashboardCachebuster'] = Math.random();
                    $state.go("bedManagement", options);
                }
            };

            init();
        }]);
