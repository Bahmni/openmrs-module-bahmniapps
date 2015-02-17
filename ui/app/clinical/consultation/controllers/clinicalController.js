'use strict';

angular.module('bahmni.clinical').controller('ClinicalController',
    ['$scope', 'retrospectiveEntryService', '$rootScope',
        function ($scope, retrospectiveEntryService, $rootScope) {

            $scope.retrospectiveClass = function () {
                
                return (retrospectiveEntryService.getRetrospectiveEntry() && retrospectiveEntryService.getRetrospectiveEntry().encounterDate &&
                    Bahmni.Common.Util.DateUtil.getDateWithoutTime(retrospectiveEntryService.getRetrospectiveEntry().encounterDate) 
                    < Bahmni.Common.Util.DateUtil.getDateWithoutTime(Bahmni.Common.Util.DateUtil.now()));
                
            };

            $rootScope.toggleControlPanel = function () {
                $rootScope.showControlPanel = !$rootScope.showControlPanel;
            };

            $rootScope.collapseControlPanel = function () {
                $rootScope.showControlPanel = false;
            };

        }]);
