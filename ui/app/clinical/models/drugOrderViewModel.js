(function () {
    var self;
    Bahmni.Clinical.DrugOrderViewModel = function (extensionParams, routes, durationUnits) {
        self = this;
        this.prn = false;
        this.route = getDefaultValue(extensionParams && extensionParams.defaultRoute, routes);
        this.durationUnit = getDefaultValue(extensionParams && extensionParams.defaultDurationUnit, durationUnits);
        this.scheduledDate = new Date();
        this.frequencyType = "uniform";
        this.uniformDosingType = {};
        this.variableDosingType = {};
    };

    var getDefaultValue = function (defaultValue, valueSet) {
        var selectedValue = defaultValue && _.find(valueSet, function (value) {
            return value.name === defaultValue;
        });
        return selectedValue && selectedValue.name;
    };

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
        return asNeeded ? "as needed" : "";
    };
    var blankIfFalsy = function (value) {
        return value ? value : "";
    };
    var getDescription = function () {
        return blankIfFalsy(getDoseAndFrequency()) + ", " +
            blankIfFalsy(self.instructions) + ", " +
            blankIfFalsy(asNeeded(self.asNeeded)) + ", " +
            blankIfFalsy(self.route) + " - " +
            blankIfFalsy(self.duration) + " " +
            blankIfFalsy(self.durationUnit) + " (" +
            blankIfFalsy(self.quantity) + " " +
            blankIfFalsy(self.quantityUnit) + ")";
    };
    var getDoseAndFrequency = function () {
        return self.frequencyType === "uniform" ? simpleDoseAndFrequency() : numberBasedDoseAndFrequency();
    };

    var setFrequencyType = function(type){
        self.frequencyType = type;
        if (self.frequencyType === "uniform"){
            self.variableDosingType = {};
        }
        else
            self.uniformDosingType = {};
    };
    
    Bahmni.Clinical.DrugOrderViewModel.prototype = {
        getDescription: getDescription,
        setFrequencyType: setFrequencyType
    };
}());