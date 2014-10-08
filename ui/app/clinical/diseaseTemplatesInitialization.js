'use strict';

angular.module('bahmni.clinical').factory('diseaseTemplatesInitialization',
    ['diseaseTemplateService', '$q', function (diseaseTemplateService, $q) {

        return function (patientUuid) {
            var diseaseTemplateDeferrable = $q.defer();
            diseaseTemplateService.getDiseaseTemplates(patientUuid).success(function (data) {
                var diseaseTemplates = [];
                data.forEach(function (diseaseTemplate) {
                    if (diseaseTemplate.observationTemplates && diseaseTemplate.observationTemplates.length > 0) {
                        diseaseTemplates.push(Bahmni.Clinical.DiseaseTemplate(diseaseTemplate));
                    }
                });
                diseaseTemplateDeferrable.resolve(diseaseTemplates);
            });
            return diseaseTemplateDeferrable.promise;
        }
    }]);