angular.module('bahmni.clinical')
    .controller('PatientDashboardLabSummaryController', ['$scope', '$rootScope', 'encounterService', 'LabOrderResultService', '$q', 'spinner',
        function ($scope, $rootScope, encounterService, labOrderResultService, $q, spinner) {
            $scope.showInvestigationChart = false;
            $scope.toggleInvestigationChart = function() {
                $scope.showInvestigationChart = !$scope.showInvestigationChart;
            }

            spinner.forPromise(labOrderResultService.getAllForPatient($rootScope.patient.uuid).then(function(results) {
                var sortedConceptSet = new Bahmni.Clinical.SortedConceptSet($rootScope.allTestsAndPanelsConcept);
                $scope.labAccessions = results.accessions.map(sortedConceptSet.sortTestResults);
                $scope.tabular = results.tabularResult;
                $scope.tabular.tabularResult.orders = sortedConceptSet.sortTestResults($scope.tabular.tabularResult.orders);
            }));
        }]);