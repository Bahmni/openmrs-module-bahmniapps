'use strict';

angular.module('bahmni.clinical')
    .controller('VisitController', ['$scope', 'encounterService', 'visitService', 'spinner', '$stateParams', 'appService', '$rootScope',
        function ($scope, encounterService, visitService, spinner, $stateParams, appService, $rootScope) {
            var visitUuid = $stateParams.visitUuid;
            $scope.visit = $rootScope.visit;
            $scope.patientUuid = $stateParams.patientUuid;
            $scope.showTrends = true;

            $scope.obsIgnoreList = appService.getAppDescriptor().getConfig("obsIgnoreList").value || {};

            $scope.isNumeric = function (value) {
                return $.isNumeric(value);
            };

            $scope.toggle = function (item) {
                item.show = !item.show
            };

            $scope.testResultClass = function (line) {
                var style = {};
                if ($scope.pendingResults(line)) {
                    style["pending-result"] = true;
                }
                if (line.isSummary) {
                    style["header"] = true;
                }
                return style;
            };
            $scope.pendingResults = function (line) {
                return line.isSummary && !line.hasResults && line.name !== "";
            }
        }]);
