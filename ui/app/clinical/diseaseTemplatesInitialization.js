'use strict';

angular.module('bahmni.clinical').factory('diseaseTemplatesInitialization',
    ['diseaseTemplateService', '$q', 'clinicalConfigService', 'initialization', 'spinner',
        function (diseaseTemplateService, $q, clinicalConfigService, initialization, spinner) {
            var diseaseTemplateDeferrable = $q.defer();
            var initDiseaseTemplates = function (response) {
                var allConceptsConfig = clinicalConfigService.getAllConceptsConfig();
                var diseaseTemplates = [];
                response.data.forEach(function (diseaseTemplate) {
                    diseaseTemplates.push(new Bahmni.Clinical.DiseaseTemplateMapper(diseaseTemplate, allConceptsConfig))
                });
                diseaseTemplateDeferrable.resolve(diseaseTemplates);
                return diseaseTemplateDeferrable.promise;
            };

            return function (patientUuid) {
                return spinner.forPromise(initialization.then(function () {
                    return diseaseTemplateService.getDiseaseTemplates(patientUuid);
                }).then(function (response) {
                        return initDiseaseTemplates(response);
                    }));
            };
        }
    ]);