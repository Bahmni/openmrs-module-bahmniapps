'use strict';

angular.module('bahmni.ipd')
    .controller('WardController', ['$scope', '$rootScope', 'BedManagementService',
        function ($scope, $rootScope, bedManagementService) {
            var init = function () {
                if ($rootScope.bedDetails) {
                    $scope.onSelectRoom($rootScope.bedDetails.physicalLocationName);
                }
            };

            $scope.onSelectRoom = function (roomName) {
                var admissionRoom = _.filter($scope.ward.rooms, function (room) {
                    return room.name == roomName;
                });
                $scope.room = admissionRoom[0];
                var layoutGridBeds = bedManagementService.createLayoutGrid($scope.room.beds);
                $scope.room.beds = layoutGridBeds;
                $scope.$emit("event:roomSelected", roomName);
                $scope.roomSelected = true;
            };

            $scope.$on("event:departmentChanged", function (event) {
                $scope.roomSelected = false;
            });

            $scope.isRoomSelected = function () {
                return $scope.roomSelected;
            };
            init();
        }]);
