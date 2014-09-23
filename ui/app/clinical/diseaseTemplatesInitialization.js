'use strict';

angular.module('bahmni.clinical').factory('diseaseTemplatesInitialization',
    ['diseaseTemplateService', '$q', function (diseaseTemplateService,$q) {
        var diseaseTemplateDeferrable = $q.defer();

        return function(patientUuid){
            diseaseTemplateService.getDiseaseTemplates(patientUuid).success(function(data){
                var diseaseTemplates = data.map(function(diseaseTemplate){
                    return Bahmni.Clinical.DiseaseTemplate(diseaseTemplate);
                })
                diseaseTemplateDeferrable.resolve(diseaseTemplates);
            });
            return diseaseTemplateDeferrable.promise;
        }
    }]);