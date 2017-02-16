'use strict';

angular.module('bahmni.ipd')
    .controller('RoomController', ['$scope', '$rootScope', '$state', 'messagingService', 'appService',
        function ($scope, $rootScope, $state, messagingService, appService) {
            var init = function () {
                var appDescriptor = appService.getAppDescriptor();
                var tagsColorConfig = appDescriptor.getConfigValue("colorForTags");
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
                    $rootScope.selectedBedInfo.bed = $scope.selectedBed;
                    if ($state.current.name != "bedManagement.patient") {
                        $scope.oldBedNumber = undefined;
                    }
                }
                $scope.bedTagConfig = tagsColorConfig;
            };

            $scope.onSelectBed = function (bed) {
                if ($state.current.name == "bedManagement.bed" || $state.current.name == "bedManagement") {
                    if (bed.status == "AVAILABLE") {
                        $rootScope.patient = undefined;
                    }
                    $rootScope.selectedBedInfo.bed = bed;
                    var options = {bedId: bed.bedId};
                    $state.go("bedManagement.bed", options);
                }
                else if ($state.current.name == "bedManagement.patient") {
                    if (bed.status == "OCCUPIED") {
                        $rootScope.selectedBedInfo.bed = undefined;
                        messagingService.showMessage("error", "Please select an available bed");
                    } else {
                        $rootScope.selectedBedInfo.bed = bed;
                    }
                }
            };

            init();
        }]);
