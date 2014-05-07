'use strict';

angular.module('bahmni.clinical')
    .controller('VisitController', ['$scope', 'encounterService', 'visitService', 'spinner', '$stateParams', '$rootScope', 'appService',
        function ($scope, encounterService, visitService, spinner, $stateParams, $rootScope, appService) {

            var obsIgnoreList = appService.getAppDescriptor().getConfig("obsIgnoreList").value || [];
            $scope.visit = $rootScope.visit;
            $scope.patientUuid = $stateParams.patientUuid;
            $scope.showTrends = true;

            $scope.isNumeric = function (value) {
                return $.isNumeric(value);
            };

            $scope.shouldShowObservation = function(observation) {
                return obsIgnoreList.indexOf(observation.concept.name) === -1;
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
