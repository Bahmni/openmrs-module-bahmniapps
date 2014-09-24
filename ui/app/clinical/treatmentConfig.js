'use strict';

angular.module('bahmni.clinical').factory('treatmentConfig',['TreatmentService', function (treatmentService) {
        return treatmentService.getConfig().then(function(result) {
            var config =  result.data;
            config.dosingInstructions = _.map(config.dosingInstructions, 'name');
            return config;
        });
    }]
);
