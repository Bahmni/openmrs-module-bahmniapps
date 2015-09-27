'use strict';

angular.module('bahmni.clinical').controller('ClinicalController',
    ['$scope', 'retrospectiveEntryService', '$rootScope',
        function ($scope, retrospectiveEntryService, $rootScope) {

            $scope.retrospectiveClass = function () {
                return !_.isEmpty(retrospectiveEntryService.getRetrospectiveEntry());
            };

            $rootScope.toggleControlPanel = function () {
                $rootScope.showControlPanel = !$rootScope.showControlPanel;
            };

            $rootScope.collapseControlPanel = function () {
                $rootScope.showControlPanel = false;
            };

        }]);
