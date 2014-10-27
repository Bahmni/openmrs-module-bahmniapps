angular.module('bahmni.clinical')
    .controller('PatientDashboardAllDiseaseTemplateController', ['$scope', '$stateParams', 'diseaseTemplateService', 'spinner', 
        function ($scope, $stateParams, diseaseTemplateService, spinner) {
        var init = function () {
            $scope.diseaseName = $scope.ngDialogData;

            return diseaseTemplateService.getAllDiseaseTemplateObs($stateParams.patientUuid, $scope.diseaseName).then(function (diseaseTemplate) {
                $scope.diseaseTemplate = diseaseTemplate;
            });
        };
        spinner.forPromise(init());
    }]);
