'use strict';

angular.module('bahmni.ipd')
    .controller('RoomGridController', ['$scope', '$rootScope', '$state', 'appService', 'messagingService',
        function ($scope, $rootScope, $state, appService, messagingService) {
            $scope.getColorForTheTag = function (tag) {
                _.forEach($rootScope.bedTagsColorConfig, function (tagConfig) {
                    if (tag.bedTagMaps.length >= 2) {
                        if (tagConfig.name === "MultiTag") {
                            tag.bedTagMaps[0].bedTag.color = tagConfig.color;
                        }
                    } else if (tag.bedTagMaps[0] !== undefined && tagConfig.name === tag.bedTagMaps[0].bedTag.name) {
                        tag.bedTagMaps[0].bedTag.color = tagConfig.color;
                    }
                });
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
                    $rootScope.selectedBedInfo.bed = bed;
                    if (bed.patient) {
                        $scope.$emit("event:updateSelectedBedInfoForCurrentPatientVisit", bed.patient.uuid);
                    }
                }
            };
        }]);
