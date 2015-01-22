'use strict';
angular.module('bahmni.clinical')
    .controller('DiseaseTemplateController', ['$scope',
        function ($scope) {
            var patient = $scope.patient;
            $scope.showDate = false;
            $scope.dialogData = {
                "diseaseTemplateName": $scope.section.templateName,
                "patient": patient,
                "section": $scope.section
            };
            $scope.getDiseaseTemplateSection = function (diseaseName) {
                return _.find($scope.diseaseTemplates, function (diseaseTemplate) {
                    return diseaseTemplate.name === diseaseName;
                });
            };
        }]);