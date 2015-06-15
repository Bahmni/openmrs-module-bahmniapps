'use strict';

angular.module('bahmni.clinical').factory('treatmentConfig',['TreatmentService', function (treatmentService) {
        return treatmentService.getConfig().then(function(result) {
            var config = result.data;
            config.durationUnits = [
                {name: "Day(s)", factor: 1},
                {name: "Week(s)", factor: 7},
                {name: "Month(s)", factor: 30}
            ];
            return  config;
        });
    }]
);
