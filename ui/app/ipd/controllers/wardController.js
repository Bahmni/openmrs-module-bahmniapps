'use strict';

angular.module('bahmni.ipd')
    .controller('WardController', ['$scope', '$rootScope', '$stateParams',
        function ($scope, $rootScope, $stateParams) {
            var init = function () {
                if ($rootScope.bedDetails) {
                    expandAdmissionMasterForRoom($rootScope.bedDetails.physicalLocationName);
                } else if ($stateParams.context && $stateParams.context.roomName) {
                    expandAdmissionMasterForRoom($stateParams.context.roomName);
                }
            };

            var getSelectedRoom = function (roomName) {
                var admissionRoom = _.filter($scope.ward.rooms, function (room) {
                    return room.name == roomName;
                });
                $scope.room = admissionRoom[0];
                $scope.roomSelected = true;
            };

            $scope.onSelectRoom = function (roomName) {
                getSelectedRoom(roomName);
                $scope.$emit("event:roomSelected", roomName);
            };

            var expandAdmissionMasterForRoom = function (roomName) {
                getSelectedRoom(roomName);
                $scope.$emit("event:roomSelectedAuto", roomName);
            };

            $scope.$on("event:departmentChanged", function (event) {
                $scope.roomSelected = false;
            });

            init();
        }]);
