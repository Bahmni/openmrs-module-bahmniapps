'use strict';

angular.module('bahmni.clinical').factory('treatmentConfig',['TreatmentService', 'spinner', 'configurationService', 'appService', 'DrugService', '$q', function (treatmentService, spinner, configurationService, appService, drugService, $q) {

        var stoppedOrderReasonConfig = {};
        var finalConfig = {
            getDoseUnits: function(drug) {return this.drugOrderOptionsSet.getDoseUnits(drug)},
            getRoutes: function(drug) {return this.drugOrderOptionsSet.getRoutes(drug)},
            getDurationUnits: function(drug) {return this.drugOrderOptionsSet.getDurationUnits(drug)},
            getDosingInstructions: function(drug) {return this.drugOrderOptionsSet.getDosingInstructions(drug)},
            getDispensingUnits: function(drug) {return this.drugOrderOptionsSet.getDispensingUnits(drug)},
            getFrequencies: function(drug) {return this.drugOrderOptionsSet.getFrequencies(drug)},
            showField: function(drug, fieldName) {return this.drugOrderOptionsSet.showField(drug,fieldName) }

        };

        configurationService.getConfigurations(['stoppedOrderReasonConfig']).then(function (configurations) {
            stoppedOrderReasonConfig = configurations.stoppedOrderReasonConfig.results[0];
        });

        var findIndexOfFrequency = function (frequencies, value) {
            var index;
            for (index = 0; index < frequencies.length; index++) {
                if (frequencies[index].name == value)
                    break;
            }
            return index;
        };

        var bubbleValueToTop = function (frequencies, value) {
            var index = findIndexOfFrequency(frequencies, value);
            if (index == frequencies.length)
                return;
            var frequencyToBeBubbled = frequencies[index];
            for (; index; index--) {
                frequencies[index] = frequencies[index - 1];
            }
            frequencies[index] = frequencyToBeBubbled;
        };

        var configFromServer = function() {
            return treatmentService.getConfig().then(function(result) {
                finalConfig = angular.extend(finalConfig, result.data);
                finalConfig.durationUnits = [
                    {name: "Day(s)", factor: 1},
                    {name: "Week(s)", factor: 7},
                    {name: "Month(s)", factor: 30}
                ];
                var frequencies = finalConfig.frequencies;
                bubbleValueToTop(frequencies, "Immediately");
                bubbleValueToTop(frequencies, "SOS")

                finalConfig.stoppedOrderReasonConcepts = stoppedOrderReasonConfig.answers;
                return finalConfig;
            });
        };

        var drugOrderOptions = function (conceptName, masterConfig, inputConfig) {
            return drugService.getSetMembersOfConcept(conceptName)
                .then(function (listOfDrugs) {
                    return new Bahmni.Clinical.DrugOrderOptions(inputConfig, listOfDrugs, masterConfig);
            });
        };

        var drugOrderOptionsSet = function() {
            angular.extend(finalConfig, appService.getAppDescriptor().getConfigForPage('medication'));
            var inputOptionsConfig = finalConfig.inputOptionsConfig,
                conceptNames = _.keys(inputOptionsConfig),
                options = [],
                drugOrderOptionsPromises = [];
            conceptNames.forEach(function(conceptName) {
                drugOrderOptionsPromises.push(
                    drugOrderOptions(conceptName, finalConfig, inputOptionsConfig[conceptName])
                        .then(function(option) {
                            options.push(option);
                        }));
            });
            return $q.all(drugOrderOptionsPromises).then(function() {
               finalConfig.drugOrderOptionsSet = new Bahmni.Clinical.DrugOrderOptionsSet(options, finalConfig);
            });
        };

        var nonCodedDrugConcept = function(){
            return treatmentService.getNonCodedDrugConcept().then(function (data) {
                finalConfig.nonCodedDrugconcept = {
                    uuid : data
                };
                return finalConfig;
            })
        };

        var configurations = function() {
            return configFromServer().then(drugOrderOptionsSet);
        };

        var configurationWithNonCodedDrugConcept = function() {
            return $q.all([nonCodedDrugConcept(), configurations()]).then(function() {
                return finalConfig;
            });
        };

        return configurationWithNonCodedDrugConcept();
    }]
);
