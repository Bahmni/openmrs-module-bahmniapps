'use strict';

angular.module('bahmni.ipd')
    .controller('RoomController', ['$scope',
        function ($scope) {
            $scope.isBedOccupied = function (bed) {
                return bed.status == "OCCUPIED";
            };

            $scope.onSelectAvailableBed = function(bed) {
                $scope.$emit("event:bedSelected", bed);
            };

            $scope.onSelectOccupiedBed = function(bed) {
                $scope.$emit("event:bedSelected", bed);
            };
        }]);
