'use strict';

angular.module('bahmni.clinical').factory('treatmentConfig',
    ['TreatmentService', 'spinner', 'configurationService', 'appService', 'DrugService', '$q', '$translate',
        function (treatmentService, spinner, configurationService, appService, drugService, $q, $translate) {

        return function (tabConfigName) {
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
                getDoseFractions: function () {
                    return drugOrderOptions.doseFractions;
                },
                isHiddenField: function (fieldName) {
                    return _.contains(drugOrderOptions.hiddenFields, fieldName)
                },
                isDropDown: function () {
                    return drugOrderOptions.isDropDown && drugOrderOptions.drugConceptSet;
                },
                isAutoComplete: function () {
                    return !this.isDropDown();
                },
                getDrugConceptSet: function () {
                    return drugOrderOptions.drugConceptSet;
                },
                isDropDownForGivenConceptSet: function () {
                    return this.isDropDown() && this.getDrugConceptSet();
                },
                isAutoCompleteForGivenConceptSet: function () {
                    return this.isAutoComplete() && this.getDrugConceptSet();
                },
                isAutoCompleteForAllConcepts: function () {
                    return !(this.getDrugConceptSet());
                },
                showAdditionalInformation: function() {
                    var additionalInformationFields = ["sos", "additionalInstructions", "dosingInstructions"];
                    var hiddenAdditionalInformationFields = _.intersection(additionalInformationFields, drugOrderOptions.hiddenFields)
                    return hiddenAdditionalInformationFields.length < additionalInformationFields.length;
                },
                translate: function (field, defaultKey) {
                    var labelKey = drugOrderOptions.labels[field];
                    var labelValue = $translate.instant(labelKey);
                    if (labelValue === labelKey){
                        labelValue = $translate.instant(defaultKey)
                    }
                    return labelValue;
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
                    bubbleValueToTop(frequencies, "SOS");

                    medicationTabConfig.stoppedOrderReasonConcepts = stoppedOrderReasonConfig.answers;
                    return medicationTabConfig;
                });
            };

        var initializeInputConfig = function (tabConfigName) {
            var medicationJson = appService.getAppDescriptor().getConfigForPage('medication') || {};
            var commonConfig = medicationJson.commonConfig || {};
            var allTabConfigs = medicationJson.tabConfig || {};
            var tabConfig = allTabConfigs[tabConfigName] || {};
            tabConfig.inputOptionsConfig = tabConfig.inputOptionsConfig || {};
            var showDoseFractions = tabConfig.inputOptionsConfig.showDoseFractions;
            tabConfig.inputOptionsConfig.showDoseFractions = showDoseFractions ? showDoseFractions : false;
            tabConfig.drugOrderHistoryConfig = tabConfig.drugOrderHistoryConfig || {};
            angular.extend(medicationTabConfig, commonConfig, tabConfig);
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

            var configurations = function (tabConfigName) {
                return configFromServer().then(function () {
                    initializeInputConfig(tabConfigName);
                })
            };

            return $q.all([nonCodedDrugConcept(), configurations(tabConfigName)]).then(function () {
                return medicationTabConfig;
            });
        };
    }]
);
