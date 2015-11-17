'use strict';

angular.module('bahmni.clinical').factory('treatmentConfig',['TreatmentService', 'spinner', function (treatmentService, spinner) {
        return treatmentService.getConfig().then(function(result) {
            var config = result.data;
            config.durationUnits = [
                {name: "Day(s)", factor: 1},
                {name: "Week(s)", factor: 7},
                {name: "Month(s)", factor: 30}
            ];
            spinner.forPromise(treatmentService.getNonCodedDrugConcept().then(function (data) {
                config.nonCodedDrugconcept = {
                    uuid : data
                };
            }));

            return config;
        });
    }]
);
