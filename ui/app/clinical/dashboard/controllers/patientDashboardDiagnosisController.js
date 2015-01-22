angular.module('bahmni.clinical')
    .controller('PatientDashboardDiagnosisController', ['$scope',
        function ($scope) {
            $scope.diagnosisDashboardConfig = $scope.dashboardConfig.getSectionByName("diagnosis");
        }]);
