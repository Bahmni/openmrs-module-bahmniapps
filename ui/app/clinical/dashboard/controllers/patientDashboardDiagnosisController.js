angular.module('bahmni.clinical')
    .controller('PatientDashboardDiagnosisController', ['$q', '$scope', '$stateParams', 'TreatmentService', 'spinner', 'diagnosisService',
        function ($q, $scope, $stateParams, treatmentService, spinner, diagnosisService) {

            var getAllDiagnosis = function () {
                return diagnosisService.getPastDiagnoses($scope.patientUuid).success(function (response) {
                    var diagnosisMapper = new Bahmni.DiagnosisMapper();
                    $scope.allDiagnoses = diagnosisMapper.mapDiagnoses(response);
                });
            };
            var getPromises = function () {
                return [getAllDiagnosis()];
            };

            spinner.forPromise($q.all(getPromises()));
        }]);
