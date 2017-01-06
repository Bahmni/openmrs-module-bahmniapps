'use strict';

angular.module('bahmni.ipd')
    .controller('RoomController', ['$scope', '$rootScope', '$state', 'messagingService',
        function ($scope, $rootScope, $state, messagingService) {
            var init = function () {
                if ($rootScope.bedDetails) {
                    $scope.oldBedNumber = $rootScope.bedDetails.bedNumber;
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
                    if ($state.current.name != "bedManagement.patient") {
                        $scope.oldBedNumber = undefined;
                    }
                }
            };

            $scope.onSelectBed = function (bed) {
                if ($state.current.name == "bedManagement.bed" || $state.current.name == "bedManagement") {
                    if (bed.status == "AVAILABLE") {
                        $rootScope.patient = undefined;
                    }
                    $scope.selectedBed = bed;
                    var options = {bedId: bed.bedId};
                    $state.go("bedManagement.bed", options);
                }
                else if ($state.current.name == "bedManagement.patient") {
                    if (bed.status == "OCCUPIED") {
                        $scope.selectedBed = undefined;
                        $scope.$emit("event:bedSelected", undefined);
                        messagingService.showMessage("error", "Please select an available bed");
                    } else {
                        $scope.selectedBed = bed;
                        $scope.$emit("event:bedSelected", bed);
                    }
                }
            };

            init();
        }]);
