Bahmni.Clinical.DrugOrderViewModel = function (extensionParams, routes, durationUnits) {
    var getDefaultValue = function (defaultValue, valueSet) {
        var selectedValue = defaultValue && _.find(valueSet, function (value) {
            return value.name === defaultValue;
        });
        return selectedValue && selectedValue.name;
    };

    var self = this;
    this.asNeeded = false;
    this.route = getDefaultValue(extensionParams && extensionParams.defaultRoute, routes);
    this.durationUnit = getDefaultValue(extensionParams && extensionParams.defaultDurationUnit, durationUnits);
    this.scheduledDate = new Date();
    this.frequencyType = "uniform";
    this.uniformDosingType = {};
    this.variableDosingType = {};


    var simpleDoseAndFrequency = function () {
        var uniformDosingType = self.uniformDosingType;
        return uniformDosingType.dose + " " +
            blankIfFalsy(uniformDosingType.doseUnits) + ", " +
            blankIfFalsy(uniformDosingType.frequency);
    };
    var numberBasedDoseAndFrequency = function () {
        var variableDosingType = self.variableDosingType;
        return variableDosingType.morningDose + "-" + variableDosingType.afternoonDose + "-" + variableDosingType.eveningDose;
    };
    var asNeeded = function (asNeeded) {
        return asNeeded ? "as needed" : '';
    };
    var blankIfFalsy = function (value) {
        return value ? value : "";
    };

    var getDoseAndFrequency = function () {
        return self.frequencyType === "uniform" ? simpleDoseAndFrequency() : numberBasedDoseAndFrequency();
    };

    var addDelimiter = function (item, delimiter) {
        return item && item.length > 0 ? item + delimiter : item;
    };

    this.getDescription = function () {
        return addDelimiter(blankIfFalsy(getDoseAndFrequency()), ', ') +
            addDelimiter(blankIfFalsy(self.instructions), ", ") +
            addDelimiter(blankIfFalsy(asNeeded(self.asNeeded)), ', ') +
            addDelimiter(blankIfFalsy(self.route), " - ") +
            addDelimiter(blankIfFalsy(self.duration), " ") +
            addDelimiter(blankIfFalsy(self.durationUnit), " (") +
            addDelimiter(blankIfFalsy(self.quantity), " ") +
            addDelimiter(blankIfFalsy(self.quantityUnit), ")");
    };

    this.setFrequencyType = function (type) {
        self.frequencyType = type;
        if (self.frequencyType === "uniform") {
            self.variableDosingType = {};
        }
        else
            self.uniformDosingType = {};
    };
};
