'use strict';

angular.module('bahmni.common.obs')
    .directive('showObservation', ['appService', 'ngDialog', function (appService, ngDialog) {
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
            $scope.openVideoInPopup = function (observation) {
                ngDialog.open({
                    template: "../common/obs/views/showVideo.html",
                    closeByDocument: false,
                    className: 'ngdialog-theme-default',
                    showClose: true,
                    data: {
                        observation: observation
                    }
                });
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
