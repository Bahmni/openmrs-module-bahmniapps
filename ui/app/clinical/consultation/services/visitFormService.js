'use strict';

angular.module('bahmni.clinical')
    .service('visitFormService', ['$http', function ($http) {
        var formData = function (patientUuid, numberOfVisits) {
            return $http.get(Bahmni.Common.Constants.formDataUrl,
                {
                    params: {
                        s: "byPatientUuid",
                        patient: patientUuid,
                        numberOfVisits: numberOfVisits,
                        v: "visitFormDetails"
                    }
                }
            );
        };

        return {
            formData: formData
        }
    }]);
