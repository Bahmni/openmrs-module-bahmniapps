'use strict';

angular.module('bahmni.clinical')
    .service('diseaseTemplateService', ['$http', function ($http) {
        this.getDiseaseTemplates = function(patientUuid) {
            var url = Bahmni.Common.Constants.diseaseTemplateUrl;
            return $http.get(url, {
                params:{patientUuid:patientUuid}
            });
        }
    }]);