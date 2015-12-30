'use strict';

Bahmni.Clinical.DrugOrderOptionsSet = (function(){
    var self, _proto;

    var DrugOrderOptionsSet = function(arrayOfDrugOrderOptions, masterConfig) {
        function findDefaultOptions() {
            return _.filter(self.arrayOfDrugOrderOptions, function (drugOrderOption) {
                return drugOrderOption.isDefaultDrugOrderOption();
            });
        }

        function moveToEndOfArray(option) {
            arrayOfDrugOrderOptions.splice(arrayOfDrugOrderOptions.indexOf(option), 1);
            arrayOfDrugOrderOptions.push(option);
        }

        self = this;
        self.arrayOfDrugOrderOptions = arrayOfDrugOrderOptions || [];

        self.masterConfig = masterConfig;

        var defaultOptions = findDefaultOptions();

        defaultOptions.forEach(function(option) {
            moveToEndOfArray(option);
        });
    };
    _proto = DrugOrderOptionsSet.prototype;

    var retrieveFromOptionsArray = function(getterFunction, fieldName) {
        return function (drug) {
            var result;
            self.arrayOfDrugOrderOptions.forEach(function (drugOrderOptions) {
                result = result || drugOrderOptions[getterFunction].call(drugOrderOptions, drug);
            });

            return result || self.masterConfig[fieldName];
        }
    };

    _proto.getDoseUnits = retrieveFromOptionsArray('getDoseUnits', 'doseUnits');
    _proto.getRoutes = retrieveFromOptionsArray('getRoutes', 'routes');
    _proto.getDurationUnits = retrieveFromOptionsArray('getDurationUnits', 'durationUnits');
    _proto.getDosingInstructions = retrieveFromOptionsArray('getDosingInstructions', 'dosingInstructions');
    _proto.getDispensingUnits = retrieveFromOptionsArray('getDispensingUnits', 'dispensingUnits');
    _proto.getFrequencies = retrieveFromOptionsArray('getFrequencies', 'frequencies');

    return DrugOrderOptionsSet;
})();