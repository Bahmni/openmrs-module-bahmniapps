Bahmni.Clinical.DrugOrderViewModel = function (extensionParams, config) {
    var getDefaultValue = function (defaultValue, valueSet) {
        var selectedValue = defaultValue && _.find(valueSet, function (value) {
            return value.name === defaultValue;
        });
        return selectedValue;
    };

    var self = this;
    var config = config || {};
    var durationUnits = config.durationUnits || [];
    this.asNeeded = false;
    this.route = getDefaultValue(extensionParams && extensionParams.defaultRoute, config.routes || []);
    this.durationUnit = getDefaultValue(extensionParams && extensionParams.defaultDurationUnit, durationUnits);
    this.instructions = getDefaultValue(extensionParams && extensionParams.defaultInstructions, config.dosingInstructions || []);
    this.scheduledDate = new Date();
    this.frequencyType = "uniform";
    this.uniformDosingType = {};
    this.variableDosingType = {};
    this.durationInDays = 0;

    var simpleDoseAndFrequency = function () {
        var uniformDosingType = self.uniformDosingType;
        var doseAndUnits = blankIfFalsy(uniformDosingType.dose) + " " + blankIfFalsy(uniformDosingType.doseUnits);
        return addDelimiter(blankIfFalsy(doseAndUnits), ", ") +
            addDelimiter(blankIfFalsy(uniformDosingType.frequency && uniformDosingType.frequency.name), ", ");
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
            addDelimiter(blankIfFalsy(self.instructions && self.instructions.name), ", ") +
            addDelimiter(blankIfFalsy(asNeeded(self.asNeeded)), ', ') +
            addDelimiter(blankIfFalsy(self.route && self.route.name), " - ") +
            addDelimiter(blankIfFalsy(self.duration), " ") +
            addDelimiter(blankIfFalsy(self.durationUnit && self.durationUnit.name), " (") +
            addDelimiter(blankIfFalsy(self.quantity), " ") +
            addDelimiter(blankIfFalsy(self.quantityUnit), ")");
    };

    this.calculateDurationUnit = function () {
        if (this.frequencyType === "uniform") {
            var frequency = this.uniformDosingType.frequency;
            if (frequency.frequencyPerDay > 4) {
                this.durationUnit = _.find(durationUnits, {name: "Hours"});
            } else if (frequency.frequencyPerDay >= 0.5) {
                this.durationUnit = _.find(durationUnits, {name: "Days"});
            } else {
                this.durationUnit = _.find(durationUnits, {name: "Weeks"});
            }
        }
    };

    this.setFrequencyType = function (type) {
        self.frequencyType = type;
        if (self.frequencyType === "uniform") {
            self.variableDosingType = {};
        }
        else
            self.uniformDosingType = {};
    };

    this.isCurrentDosingTypeEmpty = function () {
        var dosingType = this.isUniformDosingType() ? this.uniformDosingType : this.variableDosingType;
        return _.every(dosingType, function (element) {
            return element == null;
        });
    };

    this.isVariableDosingType = function () {
        return this.isFrequencyType("variable");
    };

    this.isUniformDosingType = function () {
        return this.isFrequencyType("uniform");
    };

    this.isFrequencyType = function (type) {
        return this.frequencyType === type;
    };

    this.setQuantityEnteredManually = function () {
        this.quantityEnteredManually = true;
    };

    this.calculateDurationInDays = function () {
        this.durationInDays = this.duration * (this.durationUnit && this.durationUnit.factor || 1);
    };

    this.calculateQuantity = function () {
        this.calculateDurationInDays();
        if (!this.quantityEnteredManually) {
            if (this.frequencyType == "uniform") {
                this.quantity = this.uniformDosingType.dose * (this.uniformDosingType.frequency ? this.uniformDosingType.frequency.frequencyPerDay : 0) * this.durationInDays;
                this.quantityUnit = this.uniformDosingType.doseUnits;
            }
            else {
                var dose = this.variableDosingType;
                this.quantity = (dose.morningDose + dose.afternoonDose + dose.eveningDose) * this.durationInDays;
                this.quantityUnit = this.variableDosingType.doseUnits;
            }
        }
    };

    this.isActive = function(){
        return this.effectiveStartDate >= Bahmni.Common.Util.DateUtil.today();
    }
};

Bahmni.Clinical.DrugOrderViewModel.createFromContract = function (drugOrder) {
    var administrationInstructions = JSON.parse(drugOrder.dosingInstructions.administrationInstructions) || {};

    var viewModel = new Bahmni.Clinical.DrugOrderViewModel(null, [], []);
    viewModel.asNeeded = drugOrder.dosingInstructions.asNeeded;
    viewModel.route = drugOrder.dosingInstructions.route;
    viewModel.duration = drugOrder.duration;
    viewModel.durationUnit = {name: drugOrder.durationUnits};
    viewModel.scheduledDate = drugOrder.effectiveStartDate;
    if (drugOrder.dosingInstructions.frequency) {
        viewModel.frequencyType = "uniform";
        viewModel.uniformDosingType = {};
        viewModel.uniformDosingType = {
            dose: drugOrder.dosingInstructions.dose,
            doseUnits: drugOrder.dosingInstructions.doseUnits,
            frequency: {name: drugOrder.dosingInstructions.frequency}
        }
    } else if(administrationInstructions.morningDose || administrationInstructions.afternoonDose || administrationInstructions.eveningDose){
        viewModel.frequencyType = "variable";
        viewModel.variableDosingType = {};
        viewModel.variableDosingType = {
            morningDose: administrationInstructions.morningDose,
            afternoonDose: administrationInstructions.afternoonDose,
            eveningDose: administrationInstructions.eveningDose
        }
    }
    viewModel.instructions = administrationInstructions.instructions;
    viewModel.additionalInstructions = administrationInstructions.additionalInstructions;
    viewModel.quantity = drugOrder.dosingInstructions.quantity;
    viewModel.quantityUnit = drugOrder.dosingInstructions.quantityUnits;
    viewModel.drugName = drugOrder.drug.name;
    viewModel.effectiveStartDate = drugOrder.effectiveStartDate;
    viewModel.effectiveStopDate = drugOrder.effectiveStopDate;
    viewModel.provider = drugOrder.provider.name;
    return viewModel;
};
