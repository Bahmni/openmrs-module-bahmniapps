'use strict';

angular.module('bahmni.clinical')
    .service('adhocTeleconsultationService', ['$http', function ($http) {
        this.generateAdhocTeleconsultationLink = function (params) {
            return $http.get(Bahmni.Common.Constants.adhocTeleconsultationLinkServiceUrl,
                {
                    params: params
                }
            );
        };
    }]);
