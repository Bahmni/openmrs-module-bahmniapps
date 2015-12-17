'use strict';

angular.module('bahmni.clinical')
    .service('diseaseTemplateService', ['$http', '$q', 'clinicalAppConfigService', function ($http, $q, clinicalAppConfigService) {

        this.getLatestDiseaseTemplates = function (patientUuid, diseaseTemplates, startDate, endDate) {
            var url = Bahmni.Common.Constants.diseaseTemplateUrl;
            var params = {"patientUuid": patientUuid, "diseaseTemplateConfigList": diseaseTemplates};
            params.startDate = startDate && moment(startDate).format();
            params.endDate = endDate && moment(endDate).format();
            var deferred = $q.defer();
            $http.post(url, params,  {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            }).then(function (response) {
                    var diseaseTemplates = mapDiseaseTemplates(response.data, clinicalAppConfigService.getAllConceptsConfig());
                    deferred.resolve(diseaseTemplates);
                });
            return deferred.promise;
        };

        this.getAllDiseaseTemplateObs = function (patientUuid, diseaseName, startDate, endDate) {
            var url = Bahmni.Common.Constants.AllDiseaseTemplateUrl;
            var params = {patientUuid: patientUuid, diseaseTemplateConfigList: [{"templateName":diseaseName}]};
            params.startDate = startDate && moment(startDate).format();
            params.endDate = endDate && moment(endDate).format();
            var deferred = $q.defer();
            $http.post(url,
                params, {
                withCredentials: true,
                    headers: {"Accept": "application/json", "Content-Type": "application/json"}
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