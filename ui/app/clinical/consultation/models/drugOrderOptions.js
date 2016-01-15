'use strict';

Bahmni.Clinical.DrugOrderOptions = (function() {
    var _proto;

    var itemsForInputConfig = function(listOfObjects, filterStrings) {
        if (!filterStrings) return listOfObjects;

        return _.filter(listOfObjects, function(object) {
            return _.contains(filterStrings, object.name);
        });
    };

    var DrugOrderOptions = function (inputConfig, masterConfig) {
        inputConfig = inputConfig || {};

        this.doseUnits = itemsForInputConfig(masterConfig.doseUnits, inputConfig.doseUnits);
        this.routes =  itemsForInputConfig(masterConfig.routes, inputConfig.routes);
        this.frequencies = itemsForInputConfig(masterConfig.frequencies, inputConfig.frequencies);
        this.durationUnits = itemsForInputConfig(masterConfig.durationUnits, inputConfig.durationUnits);
        this.dosingInstructions = itemsForInputConfig(masterConfig.dosingInstructions, inputConfig.dosingInstructions);
        this.dispensingUnits = itemsForInputConfig(masterConfig.dispensingUnits, inputConfig.dispensingUnits);
        this.dosePlaceHolder = inputConfig.dosePlaceHolder;
        this.disableFields = inputConfig.disableFields || [];

    };
    _proto = DrugOrderOptions.prototype;

    _proto.getDoseUnits = function() {
        return this.doseUnits;
    };
    _proto.getRoutes = function (){
        return this.routes;
    };
    _proto.getFrequencies = function (){
        return this.frequencies;
    };
    _proto.getDurationUnits = function (){
        return this.durationUnits;
    };
    _proto.getDosingInstructions = function (){
        return this.dosingInstructions;
    };
    _proto.getDispensingUnits = function (){
        return this.dispensingUnits;
    };
    _proto.getDisabledFields = function() {
        return this.disableFields;
    };
    _proto.getDosePlaceHolder = function() {
        return this.dosePlaceHolder;
    };
    return DrugOrderOptions;
})();