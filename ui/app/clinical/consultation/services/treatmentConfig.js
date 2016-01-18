'use strict';

angular.module('bahmni.clinical').factory('treatmentConfig', ['TreatmentService', 'spinner', 'configurationService', 'appService', 'DrugService', '$q', function (treatmentService, spinner, configurationService, appService, drugService, $q) {

        var drugOrderOptions;
        var stoppedOrderReasonConfig = {};
        var medicationTabConfig = {
            getDoseUnits: function () {
                return drugOrderOptions.doseUnits
            },
            getRoutes: function () {
                return drugOrderOptions.routes
            },
            getDurationUnits: function () {
                return drugOrderOptions.durationUnits
            },
            getDosingInstructions: function () {
                return drugOrderOptions.dosingInstructions
            },
            getDispensingUnits: function () {
                return drugOrderOptions.dispensingUnits
            },
            getFrequencies: function () {
                return drugOrderOptions.frequencies
            },
            getDosePlaceHolder: function () {
                return drugOrderOptions.dosePlaceHolder
            },
            disableField: function (fieldName) {
                return _.contains(drugOrderOptions.disableFields, fieldName)
            },
            isDropDown: function () {
                return drugOrderOptions.isDropDown;
            },
            isAutoComplete: function () {
                return !drugOrderOptions.isDropDown;
            },
            getDrugConceptSet: function () {
                return drugOrderOptions.drugConceptSet;
            }
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

        var configFromServer = function () {
            return treatmentService.getConfig().then(function (result) {
                medicationTabConfig = angular.extend(medicationTabConfig, result.data);
                medicationTabConfig.durationUnits = [
                    {name: "Day(s)", factor: 1},
                    {name: "Week(s)", factor: 7},
                    {name: "Month(s)", factor: 30}
                ];
                var frequencies = medicationTabConfig.frequencies;
                bubbleValueToTop(frequencies, "Immediately");
                bubbleValueToTop(frequencies, "SOS")

                medicationTabConfig.stoppedOrderReasonConcepts = stoppedOrderReasonConfig.answers;
                return medicationTabConfig;
            });
        };

        var initializeInputConfig = function () {
            angular.extend(medicationTabConfig, appService.getAppDescriptor().getConfigForPage('medication'));
            drugOrderOptions = new Bahmni.Clinical.DrugOrderOptions(medicationTabConfig.inputOptionsConfig, medicationTabConfig);
        };

        var nonCodedDrugConcept = function () {
            return treatmentService.getNonCodedDrugConcept().then(function (data) {
                medicationTabConfig.nonCodedDrugconcept = {
                    uuid: data
                };
                return medicationTabConfig;
            })
        };

        var configurations = function () {
            return configFromServer().then(initializeInputConfig);
        };

        var configurationWithNonCodedDrugConcept = function () {
            return $q.all([nonCodedDrugConcept(), configurations()]).then(function () {
                return medicationTabConfig;
            });
        };

        return configurationWithNonCodedDrugConcept();
    }]
);
