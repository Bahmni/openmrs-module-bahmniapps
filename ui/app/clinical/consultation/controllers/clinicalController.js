'use strict';

angular.module('bahmni.clinical').controller('ClinicalController',
    ['$scope', 'retrospectiveEntryService', '$rootScope',
        function ($scope, retrospectiveEntryService, $rootScope) {

            $scope.retrospectiveClass = function () {
                if (retrospectiveEntryService.getRetrospectiveEntry() && retrospectiveEntryService.getRetrospectiveEntry().encounterDate &&
                    retrospectiveEntryService.getRetrospectiveEntry().encounterDate < Bahmni.Common.Util.DateUtil.getDateWithoutTime(Bahmni.Common.Util.DateUtil.now())) {
                    return "retro-mode";
                }
            };

            $rootScope.toggleControlPanel = function () {
                $rootScope.showControlPanel = !$rootScope.showControlPanel;
            };

            $rootScope.collapseControlPanel = function () {
                $rootScope.showControlPanel = false;
            };

        }]);
