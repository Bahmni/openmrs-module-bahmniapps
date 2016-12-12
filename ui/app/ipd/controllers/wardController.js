'use strict';

angular.module('bahmni.ipd')
    .controller('WardController', ['$scope',
        function ($scope) {
            $scope.onSelectRoom = function (roomName) {
                var admissionRoom = _.filter($scope.ward.rooms, function(room) {
                    return room.name == roomName;
                });
                $scope.room = admissionRoom[0];
                $scope.$emit("event:roomSelected", roomName);
                $scope.roomSelected = true;
            };

            $scope.$on("event:departmentChanged", function (event) {
                $scope.roomSelected = false;
            });

            $scope.isRoomSelected = function () {
                return $scope.roomSelected;
            };
        }]);


