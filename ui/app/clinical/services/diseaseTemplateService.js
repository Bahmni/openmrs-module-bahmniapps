'use strict';

angular.module('bahmni.clinical')
    .service('diseaseTemplateService', ['$http', function ($http) {
        this.getDiseaseTemplates = function (patientUuid) {
            var url = Bahmni.Common.Constants.diseaseTemplateUrl;
            return $http.get(url, {
                params: {patientUuid: patientUuid}
            });
        };

        this.getAllDiseaseTemplateObs = function(patientUuid, diseaseName) {
            var url = Bahmni.Common.Constants.AllDiseaseTemplateUrl;
            return $http.get(url, {
                params:{patientUuid:patientUuid, diseaseName: diseaseName}
            });
        }
    }]);