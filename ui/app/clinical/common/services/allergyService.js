'use strict';

angular.module('bahmni.clinical')
    .factory('allergyService', ['$http', '$timeout', 'spinner', 'appService', function ($http, $timeout, spinner, appService) {
        var getAllergyForPatient = function (patientUuid) {
            var patientAllergyURL = appService.getAppDescriptor().formatUrl(Bahmni.Common.Constants.patientAllergiesURL, {'patientUuid': patientUuid});
            return $http.get(patientAllergyURL, {
                method: "GET",
                withCredentials: true,
                cache: false
            });
        };
        return {
            getAllergyForPatient: getAllergyForPatient
        };
    }]);
