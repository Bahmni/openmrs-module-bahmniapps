'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardAllDiseaseTemplateController', ['$scope', '$stateParams', 'diseaseTemplateService', 'spinner', 
        function ($scope, $stateParams, diseaseTemplateService, spinner) {
        var init = function () {
            $scope.diseaseName = $scope.ngDialogData;
            $scope.patientUuid = $stateParams.patientUuid;

            return diseaseTemplateService.getAllDiseaseTemplateObs($scope.patientUuid, $scope.diseaseName).then(function (diseaseTemplate) {
                $scope.diseaseTemplate = diseaseTemplate;
            });
        };
        spinner.forPromise(init());
    }]);
