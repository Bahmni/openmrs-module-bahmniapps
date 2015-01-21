'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardAllDiseaseTemplateController', ['$scope', 'diseaseTemplateService', 'spinner', 
        function ($scope, diseaseTemplateService, spinner) {
        var init = function () {
            $scope.diseaseName = $scope.ngDialogData.diseaseTemplateName;
            $scope.patient= $scope.ngDialogData.patient;
            $scope.showDate = true;
            
            return diseaseTemplateService.getAllDiseaseTemplateObs($scope.patient.uuid, $scope.diseaseName).then(function (diseaseTemplate) {
                $scope.diseaseTemplate = diseaseTemplate;
            });
        };

        spinner.forPromise(init());
    }]);
