'use strict';

angular.module('bahmni.common.uiHelper')
    .filter('dosageString', function () {
        return function (stage, drugOrder) {
            if (!stage) { return ''; }
            return Bahmni.Clinical.FhirDosingUtils.buildDosageString(stage, drugOrder ? drugOrder.route : '');
        };
    })
    .filter('stageQuantity', ['treatmentService', function (treatmentService) {
        var frequenciesCache = {};

        treatmentService.getConfig().then(function (config) {
            var frequencies = config.data.frequencies || config.frequencies || [];
            frequencies.forEach(function (f) {
                frequenciesCache[f.name] = f.frequencyPerDay || 1;
            });
        }).catch(function () {
            // Use defaults on error
        });

        return function (stage) {
            if (!stage || !stage.dose) {
                return '';
            }

            var dose = parseFloat(stage.dose) || 0;
            if (dose === 0) {
                return '';
            }

            var unit = stage.unit || '';

            if (stage.isLoadingDose) {
                return dose + ' ' + unit;
            }

            var frequencyPerDay = stage.frequencyPerDay || 1;
            if (!frequencyPerDay || frequencyPerDay === 1) {
                if (stage.frequency) {
                    var frequencyStr = Bahmni.Clinical.FhirDosingUtils.extractSelectValue(stage.frequency);
                    if (frequencyStr && frequenciesCache[frequencyStr]) {
                        frequencyPerDay = frequenciesCache[frequencyStr];
                    }
                }
            }

            var durationInDays = stage.durationDays || 0;
            var stageQuantity = dose * frequencyPerDay * durationInDays;

            return stageQuantity + ' ' + unit;
        };
    }]);
