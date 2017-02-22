'use strict';

angular.module('bahmni.ipd')
    .controller('RoomController', ['$scope', '$rootScope', '$state', 'appService',
        function ($scope, $rootScope, $state, appService) {
            var init = function () {
                var appDescriptor = appService.getAppDescriptor();
                var tagsColorConfig = appDescriptor.getConfigValue("colorForTags");
                $rootScope.bedTagsColorConfig = tagsColorConfig;
                $scope.currentView = "Grid";

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
            };

            $scope.toggleWardView = function () {
                $scope.currentView = ($scope.currentView == "Grid") ? "List" : "Grid";
            };

            init();
        }]);
