'use strict';

angular.module('bahmni.clinical')
    .service('diseaseTemplateService', ['$http', '$q', 'clinicalConfigService', function ($http, $q, clinicalConfigService) {

        this.getLatestDiseaseTemplates = function (patientUuid) {
            var url = Bahmni.Common.Constants.diseaseTemplateUrl;
            var deferred = $q.defer();
            $http.get(url, {
                params: {patientUuid: patientUuid}
            }).then(function (response) {
                    var diseaseTemplates = mapDiseaseTemplates(response);
                    deferred.resolve(diseaseTemplates);
                });
            return deferred.promise;
        };

        this.getAllDiseaseTemplateObs = function (patientUuid, diseaseName) {
            var url = Bahmni.Common.Constants.AllDiseaseTemplateUrl;
            return $http.get(url, {
                params: {patientUuid: patientUuid, diseaseName: diseaseName}
            });
        };

        var mapDiseaseTemplates = function (response) {
            var allConceptsConfig = clinicalConfigService.getAllConceptsConfig();
            var diseaseTemplates = [];
            response.data.forEach(function (diseaseTemplate) {
                diseaseTemplates.push(new Bahmni.Clinical.DiseaseTemplateMapper(diseaseTemplate, allConceptsConfig))
            });
            return diseaseTemplates;
        };
    }]);