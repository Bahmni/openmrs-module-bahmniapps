'use strict';

angular.module('bahmni.clinical').factory('treatmentConfig',['TreatmentService', function (treatmentService) {
        return treatmentService.getConfig().then(function(result) {
            return result.data;
        });
    }]
);
