angular.module('bahmni.clinical')
    .controller('PatientDashboardDiagnosisController', ['$scope', 'clinicalAppConfigService',
        function ($scope, clinicalAppConfigService) {

            $scope.diagnosisDashboardConfig = clinicalAppConfigService.getPatientDashBoardSectionByName("diagnosis");
        }]);
