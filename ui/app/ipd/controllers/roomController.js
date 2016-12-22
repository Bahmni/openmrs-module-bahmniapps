'use strict';

angular.module('bahmni.ipd')
    .controller('RoomController', ['$scope', '$rootScope', 'BedManagementService',
        function ($scope, $rootScope, bedManagementService) {
            var init = function () {
                if ($rootScope.bedDetails) {
                    _.some($scope.room.beds, function (row) {
                        var selectedBed = _.filter(row, function (bed) {
                            return bed.bed.bedNumber == $rootScope.bedDetails.bedNumber;
                        });
                        if (selectedBed.length) {
                            $scope.selectedBed = selectedBed[0].bed;
                            return true;
                        }
                    });
                    $scope.$emit("event:bedSelected", $scope.selectedBed);
                }
            };

            $scope.isBedOccupied = function (bed) {
                return bed.status == "OCCUPIED";
            };

            $scope.onSelectAvailableBed = function (bed) {
                $scope.$emit("event:bedSelected", bed);
            };

            $scope.onSelectOccupiedBed = function (bed) {
                $scope.$emit("event:bedSelected", bed);
            };

            init();
        }]);
