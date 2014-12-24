'use strict';

angular.module('bahmni.clinical')
    .service('diseaseTemplateService', ['$http', '$q', 'clinicalAppConfigService', function ($http, $q, clinicalAppConfigService) {

        this.getLatestDiseaseTemplates = function (patientUuid) {
            var diseaseTemplateConfig = clinicalAppConfigService.getDiseaseTemplateConfig();
            var url = Bahmni.Common.Constants.diseaseTemplateUrl;
            var deferred = $q.defer();
            $http.post(url, {"patientUuid": patientUuid, "diseaseTemplateConfigList": diseaseTemplateConfig},  {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            }).then(function (response) {
                    var diseaseTemplates = mapDiseaseTemplates(response.data, clinicalAppConfigService.getAllConceptsConfig());
                    deferred.resolve(diseaseTemplates);
                });
            return deferred.promise;
        };

        this.getAllDiseaseTemplateObs = function (patientUuid, diseaseName) {
            var url = Bahmni.Common.Constants.AllDiseaseTemplateUrl;

            var deferred = $q.defer();
            $http.get(url, {
                params: {patientUuid: patientUuid, diseaseName: diseaseName}
            }).then(function (diseaseTemplateResponse) {
                    var diseaseTemplates = mapDiseaseTemplates([diseaseTemplateResponse.data], clinicalAppConfigService.getAllConceptsConfig());
                    deferred.resolve(diseaseTemplates[0]);
                });
            return deferred.promise;
        };

        var mapDiseaseTemplates = function (diseaseTemplates, allConceptsConfig) {
            var mappedDiseaseTemplates = [];
            diseaseTemplates.forEach(function (diseaseTemplate) {
                mappedDiseaseTemplates.push(new Bahmni.Clinical.DiseaseTemplateMapper(diseaseTemplate, allConceptsConfig))
            });
            return mappedDiseaseTemplates;
        };
    }]);