'use strict';

angular.module('bahmni.clinical')
    .service('diseaseTemplateService', ['$q', function ($q) {
        this.getLatestDiseaseTemplates = function (patientUuid, diseaseTemplates, startDate, endDate) {
            return $q.when({"data": {}});
        };

        this.getAllDiseaseTemplateObs = function (patientUuid, diseaseName, startDate, endDate) {
            return $q.when({"data": {}});
        };

        var mapDiseaseTemplates = function (diseaseTemplates, allConceptsConfig) {
            var mappedDiseaseTemplates = [];
            diseaseTemplates.forEach(function (diseaseTemplate) {
                mappedDiseaseTemplates.push(new Bahmni.Clinical.DiseaseTemplateMapper(diseaseTemplate, allConceptsConfig));
            });
            return mappedDiseaseTemplates;
        };
    }]);
