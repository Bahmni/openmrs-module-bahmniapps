'use strict';

Bahmni.Clinical.DrugOrderOptionsSet = (function(){
    var self, _proto;

    var DrugOrderOptionsSet = function(arrayOfDrugOrderOptions, masterConfig) {
        self = this;
        self.arrayOfDrugOrderOptions = arrayOfDrugOrderOptions || [];
        self.masterConfig = masterConfig;
    };
    _proto = DrugOrderOptionsSet.prototype;

    var retrieveFromOptionsArray = function(getterFunction, fieldName) {
        return function () {
            var result = null;
            var args = arguments;
            self.arrayOfDrugOrderOptions.forEach(function (drugOrderOptions) {
                var responseFromOption = drugOrderOptions[getterFunction].apply(drugOrderOptions, args);
                result = responseFromOption !== null ? responseFromOption : result;
            });
            return result !== null ? result: self.masterConfig[fieldName];
        }
    };

    _proto.getDoseUnits = retrieveFromOptionsArray('getDoseUnits', 'doseUnits');
    _proto.getRoutes = retrieveFromOptionsArray('getRoutes', 'routes');
    _proto.getDurationUnits = retrieveFromOptionsArray('getDurationUnits', 'durationUnits');
    _proto.getDosingInstructions = retrieveFromOptionsArray('getDosingInstructions', 'dosingInstructions');
    _proto.getDispensingUnits = retrieveFromOptionsArray('getDispensingUnits', 'dispensingUnits');
    _proto.getFrequencies = retrieveFromOptionsArray('getFrequencies', 'frequencies');
    var resultFromConfig = retrieveFromOptionsArray('showField', 'hideFields');
    _proto.showField = function(drug, fieldName) {
        var shouldShowField = resultFromConfig(drug, fieldName);
        return shouldShowField !== null && shouldShowField !== undefined ? shouldShowField: true;
    };

    return DrugOrderOptionsSet;
})();