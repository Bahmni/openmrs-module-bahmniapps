'use strict';

angular.module('bahmni.common.obs')
    .directive('showObservation', ['ngDialog', function (ngDialog) {
        var controller = function ($scope, $rootScope, $filter) {
            $scope.toggle = function (observation) {
                observation.showDetails = !observation.showDetails;
            };

            $scope.print = $rootScope.isBeingPrinted || false;

            $scope.dateString = function (observation) {
                var filterName;
                if ($scope.showDate && $scope.showTime) {
                    filterName = 'bahmniDateTime';
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
            $scope.displayLabel = function (observation) {
                if ($scope.displayNameType === 'FSN') {
                    return observation.concept.name;
                } else {
                    return (observation.concept.shortName.charAt(0).toUpperCase() + observation.concept.shortName.slice(1)) || observation.concept.name;
                }
            };
        };
        return {
            restrict: 'E',
            scope: {
                observation: "=?",
                patient: "=",
                showDate: "=?",
                showTime: "=?",
                showDetailsButton: "=?",
                configIsObservationForImages: "=?",
                displayNameType: "=?"
            },
            controller: controller,
            template: function (element, attrs) {
                if (attrs.templateURL) {
                    return '<ng-include src="' + attrs.templateURL + '" />';
                } else {
                    return '<ng-include src="\'../common/obs/views/showObservation.html\'" />';
                }
            }
        };
    }]);
