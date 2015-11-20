'use strict';

angular.module('bahmni.clinical').factory('treatmentConfig',['TreatmentService', 'spinner', 'configurationService', function (treatmentService, spinner, configurationService) {


            var stoppedOrderReasonConfig = {};
            configurationService.getConfigurations(['stoppedOrderReasonConfig']).then(function (configurations) {
                stoppedOrderReasonConfig = configurations.stoppedOrderReasonConfig.results[0];
            });


        function findIndexOfFrequency(frequencies, value) {
            var index;
            for (index = 0; index < frequencies.length; index++) {
                if (frequencies[index].name == value)
                    break;
            }
            return index;
        }

        function bubbleValueToTop(frequencies, value) {
            var index = findIndexOfFrequency(frequencies, value);
            if (index == frequencies.length)
                return;
            var frequencyToBeBubbled = frequencies[index];
            for (; index; index--) {
                frequencies[index] = frequencies[index - 1];
            }
            frequencies[index] = frequencyToBeBubbled;
        }

        return treatmentService.getConfig().then(function(result) {
            var config = result.data;
            var frequencies = config.frequencies;
            bubbleValueToTop(frequencies, "Immediately");
            bubbleValueToTop(frequencies, "SOS")
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

            config.stoppedOrderReasonConcepts = stoppedOrderReasonConfig.answers;
            return config;
        });
    }]
);
