'use strict';

Bahmni.Clinical.DrugOrderOptions = (function () {
    var itemsForInputConfig = function (listOfObjects, filterStrings, filterKey) {
        filterKey = filterKey || 'name';
        if (!filterStrings) {
            return listOfObjects;
        }

        return _.filter(listOfObjects, function (object) {
            return _.includes(filterStrings, object[filterKey]);
        });
    };

    return function (_inputConfig, masterConfig) {
        var inputConfig = _inputConfig || {};

        this.doseUnits = itemsForInputConfig(masterConfig.doseUnits, inputConfig.doseUnits);
        this.routes = itemsForInputConfig(masterConfig.routes, inputConfig.routes);
        this.frequencies = itemsForInputConfig(masterConfig.frequencies, inputConfig.frequencies);
        this.durationUnits = itemsForInputConfig(masterConfig.durationUnits, inputConfig.durationUnits);
        this.dosingInstructions = itemsForInputConfig(masterConfig.dosingInstructions, inputConfig.dosingInstructions);
        this.dispensingUnits = itemsForInputConfig(masterConfig.dispensingUnits, inputConfig.dispensingUnits);
        this.dosePlaceHolder = inputConfig.dosePlaceHolder;
        this.hiddenFields = inputConfig.hiddenFields || [];
        this.isDropDown = inputConfig.isDropDown;
        this.drugConceptSet = inputConfig.drugConceptSet;
        this.labels = inputConfig.labels || {};
        this.doseFractions = itemsForInputConfig(masterConfig.doseFractions, inputConfig.doseFractions, 'label');
        this.allowNonCodedDrugs = !inputConfig.allowOnlyCodedDrugs;
        this.asNeededToBeACheckbox = inputConfig.asNeededToBeACheckbox || false;
        this.autopopulateDurationsBasedOnFrequency = inputConfig.autopopulateDurationsBasedOnFrequency || [];
    };
})();
