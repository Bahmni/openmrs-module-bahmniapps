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
        var doseAndUnits = blankIfFalsy(uniformDosingType.dose) + " " + blankIfFalsy(uniformDosingType.doseUnits);
        return addDelimiter(blankIfFalsy(doseAndUnits), ", ") +
            addDelimiter(blankIfFalsy(uniformDosingType.frequency), ", ");
    };
    var numberBasedDoseAndFrequency = function () {
        var variableDosingType = self.variableDosingType;
        var variableDosingString = addDelimiter((variableDosingType.morningDose || 0) + "-" + (variableDosingType.afternoonDose || 0) + "-" + (variableDosingType.eveningDose || 0), " ");
        return addDelimiter((variableDosingString + blankIfFalsy(variableDosingType.doseUnits)).trim(), ", ")
    };
    var asNeeded = function (asNeeded) {
        return asNeeded ? "SOS" : '';
    };
    var blankIfFalsy = function (value) {
        return value ? value.toString().trim() : "";
    };

    var getDoseAndFrequency = function () {
        return self.frequencyType === "uniform" ? simpleDoseAndFrequency() : numberBasedDoseAndFrequency();
    };

    var addDelimiter = function (item, delimiter) {
        return item && item.length > 0 ? item + delimiter : item;
    };

    this.getDescription = function () {
        return addDelimiter(blankIfFalsy(getDoseAndFrequency()), " ") +
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
