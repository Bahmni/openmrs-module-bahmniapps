'use strict';

angular.module('bahmni.common.displaycontrol.custom', [])
    .directive('custom', ['observationsService', 'appService', function (observationsService, appService) {

        var controller = function ($scope) {
            $scope.getObs = function (conceptNames) {
                return observationsService.fetch($scope.patient.uuid, conceptNames, "latest", undefined, $scope.visitUuid, undefined);
            };

            var init = function () {
                $scope.contentUrl = appService.configBaseUrl() + appService.getAppDescriptor().contextPath + "/" + $scope.templateUrl;
            };
            init();
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
                templateUrl: "@"
            }
        }
    }]);