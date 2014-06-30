angular.module('bahmni.clinical')
    .controller('PatientDashboardLabSummaryController', ['$scope', '$rootScope', 'encounterService', 'LabOrderResultService', '$q', 'spinner',
        function ($scope, $rootScope, encounterService, labOrderResultService, $q, spinner) {
            $scope.showInvestigationChart = false;
            $scope.toggleInvestigationChart = function() {
                $scope.showInvestigationChart = !$scope.showInvestigationChart;
            }

            spinner.forPromise(labOrderResultService.getAllForPatient($rootScope.patient.uuid).then(function(results) {
                $scope.labAccessions = results.accessions;
                $scope.tabular = results.tabularResult;
            }));
        }]);