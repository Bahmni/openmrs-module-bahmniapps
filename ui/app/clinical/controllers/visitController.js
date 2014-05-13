'use strict';

angular.module('bahmni.clinical')
    .controller('VisitController', ['$scope', 'encounterService', 'visitService', 'spinner', '$stateParams', '$rootScope',
        function ($scope, encounterService, visitService, spinner, $stateParams, $rootScope) {
            var visitUuid = $stateParams.visitUuid;
            $scope.patientUuid = $stateParams.patientUuid;
            $scope.showTrends = true;
            $scope.visit = $rootScope.visit;

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
            };

            $scope.getVisitDate = function(){
                return $rootScope.visits.filter(function (visit) {
                    return visit.uuid === $rootScope.visit.uuid;
                })[0].startDatetime;
            };
        }]);
