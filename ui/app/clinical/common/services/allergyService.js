'use strict';

angular.module('bahmni.clinical')
    .factory('allergyService', ['$http', 'appService', function ($http, appService) {
        var getAllergyForPatient = function (patientUuid) {
            var patientAllergyURL = appService.getAppDescriptor().formatUrl(Bahmni.Common.Constants.patientAllergiesURL, {'patientUuid': patientUuid});
            return $http.get(patientAllergyURL, {
                method: "GET",
                withCredentials: true,
                cache: false
            });
        };
        var fetchAndProcessAllergies = function (patientUuid) {
            var allergies = getAllergyForPatient(patientUuid);
            var allergiesList = [];
            if (allergies.status === 200 && allergies.data.entry.length > 0) {
                allergies.data.entry.forEach(function (allergy) {
                    if (allergy.resource.code.coding) {
                        allergiesList.push(allergy.resource.code.coding[0].display);
                    }
                });
            }
            return allergiesList.join(", ");
        };

        return {
            getAllergyForPatient: getAllergyForPatient,
            fetchAndProcessAllergies: fetchAndProcessAllergies
        };
    }]);
