'use strict';

angular.module('bahmni.common.displaycontrol.custom', [])
    .directive('custom', ['observationsService', '$compile', '$http', 'spinner', function (observationsService, $compile, $http, spinner) {

        var controller = function ($scope) {

            $scope.getValue = function (conceptName) {
                var matchingObs = _.find($scope.birthCertificateObs, function (obs) {
                        return obs.concept.name == conceptName;
                    });
                return matchingObs && matchingObs.valueAsString;
            };

            var init = function () {
                return observationsService.fetch($scope.patient.uuid, $scope.config.conceptNames, "latest", undefined, $scope.visitUuid, undefined).then(function (response) {
                    $scope.birthCertificateObs = response.data;
                    $scope.contentUrl = $scope.templateurl;
                })
            };

            spinner.forPromise(init());
        };

        return {
            restrict: 'E',
            controller: controller,
            template: '<ng-include src="contentUrl"/>',
            scope: {
                patient: "=",
                visitUuid: "@",
                section: "=",
                config: "=",
                templateurl: "@"
            }
        }
    }]);