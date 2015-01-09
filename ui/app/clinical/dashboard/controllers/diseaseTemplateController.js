'use strict';
angular.module('bahmni.clinical')
    .controller('DiseaseTemplateController', ['$scope',
        function ($scope) {
            var diseaseTemplateName = $scope.section.data.diseaseTemplateName;
            var patient = $scope.patient;
            $scope.dialogData = {
                "diseaseTemplateName": diseaseTemplateName,
                "patient": patient
            };
        }]);