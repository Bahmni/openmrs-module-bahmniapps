'use strict';

Bahmni.Clinical.DrugOrderOptions = (function() {
    var self, _proto;

    var itemsForInputConfig = function(listOfObjects, filterStrings) {
        if (!filterStrings) return listOfObjects;

        return _.filter(listOfObjects, function(object) {
            return _.contains(filterStrings, object.name);
        });
    };
    var drugMatches = function(drug) {
        return self.listOfDrugs.length == 0 || drug && _.contains(self.listOfDrugs, drug.name);
    };

    var DrugOrderOptions = function (inputConfig, listOfDrugs, masterConfig) {
        self = this;
        this.listOfDrugs = _.map(listOfDrugs, function(drug) {
            return drug.name;
        });
        inputConfig = inputConfig || {};

        this.doseUnits = itemsForInputConfig(masterConfig.doseUnits, inputConfig.doseUnits);
        this.routes =  itemsForInputConfig(masterConfig.routes, inputConfig.routes);
        this.frequencies = itemsForInputConfig(masterConfig.frequencies, inputConfig.frequencies);
        this.durationUnits = itemsForInputConfig(masterConfig.durationUnits, inputConfig.durationUnits);
        this.dosingInstructions = itemsForInputConfig(masterConfig.dosingInstructions, inputConfig.dosingInstructions);
        this.dispensingUnits = itemsForInputConfig(masterConfig.dispensingUnits, inputConfig.dispensingUnits);
    };
    _proto = DrugOrderOptions.prototype;

    _proto.getDoseUnits = function(drug) {
        return drugMatches(drug)? this.doseUnits: null;
    };

    _proto.getRoutes = function (drug){
        return drugMatches(drug)? this.routes: null;
    };

    _proto.getFrequencies = function (drug){
        return drugMatches(drug)? this.frequencies: null;
    };
    _proto.getDurationUnits = function (drug){
        return drugMatches(drug)? this.durationUnits: null;
    };
    _proto.getDosingInstructions = function (drug){
        return drugMatches(drug)? this.dosingInstructions: null;
    };
    _proto.getDispensingUnits = function (drug){
        return drugMatches(drug)? this.dispensingUnits: null;
    };
    _proto.isDefaultDrugOrderOption = function() {
        return this.listOfDrugs.length == 0;
    };

    return DrugOrderOptions;
})();