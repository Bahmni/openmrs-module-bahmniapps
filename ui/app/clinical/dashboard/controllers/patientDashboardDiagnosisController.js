angular.module('bahmni.clinical')
    .controller('PatientDashboardDiagnosisController', ['$scope',
        function ($scope) {
            $scope.diagnosisDashboardConfig = $scope.dashboard.getSectionByName("diagnosis");
        }]);
