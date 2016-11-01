'use strict';

angular.module('bahmni.clinical')
    .service('visitFormService', ['$http', function ($http) {
        var formData = function (patientUuid, numberOfVisits, formGroup, patientProgramUuid) {
            var params = {
                s: "byPatientUuid",
                patient: patientUuid,
                numberOfVisits: numberOfVisits,
                v: "visitFormDetails",
                conceptNames: formGroup || null,
                patientProgramUuid: patientProgramUuid
            };
            return $http.get(Bahmni.Common.Constants.formDataUrl, {params: params});
        };

        return {
            formData: formData
        };
    }]);
