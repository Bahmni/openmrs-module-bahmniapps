'use strict';

angular.module('bahmni.common.obs')
    .directive('showObservation', ['appService', function (appService) {
        var controller = function ($scope, $rootScope, $filter) {
            $scope.displayNepaliDates = appService.getAppDescriptor().getConfigValue('displayNepaliDates');
            $scope.toggle = function (observation) {
                observation.showDetails = !observation.showDetails;
            };

            $scope.print = $rootScope.isBeingPrinted || false;

            $scope.dateString = function (observation) {
                var filterName;
                if ($scope.showDate && $scope.showTime && !$scope.displayNepaliDates) {
                    filterName = 'bahmniDateTime';
                } else if ($scope.showDate && $scope.showTime && $scope.displayNepaliDates) {
                    filterName = 'npDateTime';
                } else if (!$scope.showDate && ($scope.showTime || $scope.showTime === undefined)) {
                    filterName = 'bahmniTime';
                } else {
                    return null;
                }
                return $filter(filterName)(observation.observationDateTime);
            };
        };
        return {
            restrict: 'E',
            scope: {
                observation: "=?",
                patient: "=",
                showDate: "=?",
                showTime: "=?",
                showDetailsButton: "=?"
            },
            controller: controller,
            template: '<ng-include src="\'../common/obs/views/showObservation.html\'" />'
        };
    }]);
