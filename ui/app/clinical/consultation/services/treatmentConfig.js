'use strict';

angular.module('bahmni.clinical').factory('treatmentConfig',
    ['TreatmentService', 'spinner', 'configurationService', 'appService', '$q', '$translate',
        function (treatmentService, spinner, configurationService, appService, $q, $translate) {

            var getConfigFromServer = function (baseTreatmentConfig) {
                return treatmentService.getConfig().then(function (result) {
                    var config = angular.extend(baseTreatmentConfig, result.data);
                    config.durationUnits = [
                        {name: "Day(s)", factor: 1},
                        {name: "Week(s)", factor: 7},
                        {name: "Month(s)", factor: 30}
                    ];
                    config.frequencies = _(config.frequencies)
                        .sortBy({'name':'Immediately'})
                        .sortBy({'name':'SOS'})
                        .reverse()
                        .value();
                    return config;
                });
            };

            var setNonCodedDrugConcept = function (config) {
                return treatmentService.getNonCodedDrugConcept().then(function (data) {
                    config.nonCodedDrugconcept = {
                        uuid: data
                    };
                    return config;
                });
            };

            var setStoppedOrderReasonConcepts = function (config) {
                return configurationService.getConfigurations(['stoppedOrderReasonConfig']).then(function (response) {
                    var stoppedOrderReasonConfig = response.stoppedOrderReasonConfig.results[0] || {};
                    config.stoppedOrderReasonConcepts = stoppedOrderReasonConfig.answers;
                    return config;
                });
            };

            return function (tabConfigName) {
                var drugOrderOptions;
                var baseTreatmentConfig = {
                    allowNonCodedDrugs: function () {
                        return drugOrderOptions.allowNonCodedDrugs;
                    },
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
                        return _.includes(drugOrderOptions.hiddenFields, fieldName)
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
                    showAdditionalInformation: function () {
                        var additionalInformationFields = ["sos", "additionalInstructions", "dosingInstructions"];
                        var hiddenAdditionalInformationFields = _.intersection(additionalInformationFields, drugOrderOptions.hiddenFields);
                        return hiddenAdditionalInformationFields.length < additionalInformationFields.length;
                    },
                    translate: function (field, defaultKey) {
                        var labelKey = drugOrderOptions.labels[field];
                        var labelValue = $translate.instant(labelKey);
                        if (labelValue === labelKey) {
                            labelValue = $translate.instant(defaultKey)
                        }
                        return labelValue;
                    },
                    showBulkChangeDuration: function () {
                        return !this.hideBulkChangeDurationButton;
                    }
                };

                var setDrugOrderOptions = function (medicationTabConfig, tabConfigName) {
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
                    return medicationTabConfig;
                };

                return getConfigFromServer(baseTreatmentConfig)
                    .then(function (config) {
                        return setDrugOrderOptions(config, tabConfigName);
                    })
                    .then(setStoppedOrderReasonConcepts)
                    .then(setNonCodedDrugConcept);
            };
        }]);
