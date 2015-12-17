'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardAllDiseaseTemplateController', ['$scope', 'diseaseTemplateService', 'spinner', 'appService', '$stateParams',
        function ($scope, diseaseTemplateService, spinner, appService, $stateParams) {
        var init = function () {
            $scope.diseaseName = $scope.ngDialogData.diseaseTemplateName;
            $scope.patient= $scope.ngDialogData.patient;
            $scope.section= $scope.ngDialogData.section;
            $scope.showDateTimeForIntake = true;
            $scope.showTimeForProgress = true;

            var programConfig = appService.getAppDescriptor().getConfigValue('program');
            var startDate = null,endDate = null;
            if(programConfig.showDashBoardWithinDateRange){
                startDate = $stateParams.dateEnrolled;
                endDate = $stateParams.dateCompleted;
            }

            return diseaseTemplateService.getAllDiseaseTemplateObs($scope.patient.uuid, $scope.diseaseName, startDate, endDate).then(function (diseaseTemplate) {
                $scope.diseaseTemplate = diseaseTemplate;
            });
        };

        spinner.forPromise(init());
    }]);
