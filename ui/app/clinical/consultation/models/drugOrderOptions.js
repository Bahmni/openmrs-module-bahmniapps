'use strict';

Bahmni.Clinical.DrugOrderOptions = (function() {

    var itemsForInputConfig = function(listOfObjects, filterStrings) {
        if (!filterStrings) return listOfObjects;

        return _.filter(listOfObjects, function(object) {
            return _.contains(filterStrings, object.name);
        });
    };

    return function (_inputConfig, masterConfig) {
        var inputConfig = _inputConfig || {};

        this.doseUnits = itemsForInputConfig(masterConfig.doseUnits, inputConfig.doseUnits);
        this.routes =  itemsForInputConfig(masterConfig.routes, inputConfig.routes);
        this.frequencies = itemsForInputConfig(masterConfig.frequencies, inputConfig.frequencies);
        this.durationUnits = itemsForInputConfig(masterConfig.durationUnits, inputConfig.durationUnits);
        this.dosingInstructions = itemsForInputConfig(masterConfig.dosingInstructions, inputConfig.dosingInstructions);
        this.dispensingUnits = itemsForInputConfig(masterConfig.dispensingUnits, inputConfig.dispensingUnits);
        this.dosePlaceHolder = inputConfig.dosePlaceHolder;
        this.hiddenFields = inputConfig.hiddenFields || [];
        this.isDropDown = inputConfig.isDropDown;
        this.drugConceptSet = inputConfig.drugConceptSet;
        this.dosingUnitsFractions = inputConfig.dosingUnitsFractions;
    };
})();