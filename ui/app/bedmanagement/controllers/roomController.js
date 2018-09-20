'use strict';

angular.module('bahmni.ipd')
    .controller('RoomController', ['$scope', '$rootScope', '$state', '$translate', 'appService',
        function ($scope, $rootScope, $state, $translate, appService) {
            var init = function () {
                $scope.defaultTags = ['AVAILABLE', 'OCCUPIED'];
                var appDescriptor = appService.getAppDescriptor();
                $rootScope.bedTagsColorConfig = appDescriptor.getConfigValue("colorForTags") || [];
                $rootScope.currentView = $rootScope.currentView || "Grid";
                $scope.currentView = $rootScope.currentView;

                if ($rootScope.bedDetails) {
                    $scope.oldBedNumber = $rootScope.bedDetails.bedNumber;
                    _.some($scope.room.beds, function (row) {
                        var selectedBed = _.filter(row, function (bed) {
                            return bed.bed.bedId === $rootScope.bedDetails.bedId;
                        });
                        if (selectedBed.length) {
                            $scope.selectedBed = selectedBed[0].bed;
                            return true;
                        }
                    });
                    $rootScope.selectedBedInfo.bed = $scope.selectedBed;
                    if ($state.current.name !== "bedManagement.patient") {
                        $scope.oldBedNumber = undefined;
                    }
                }
            };

            $scope.toggleWardView = function () {
                $rootScope.currentView = ($rootScope.currentView === "Grid") ? "List" : "Grid";
                $scope.currentView = $rootScope.currentView;
            };

            $scope.getTagName = function (tag) {
                if (tag === 'AVAILABLE') {
                    return $translate.instant("KEY_AVAILABLE");
                }
                else if (tag === 'OCCUPIED') {
                    return $translate.instant("KEY_OCCUPIED");
                }
            };

            init();
        }]);
