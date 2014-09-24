Bahmni.Clinical.DrugOrderViewModel = function (extensionParams, config) {
    var getDefaultValue = function (defaultValue, valueSet) {
        return defaultValue && _.find(valueSet, function (value) {
            return value.name === defaultValue;
        });
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
    this.noFrequencyDosingType = {};
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

    var noFrequencyDose = function () {
        var noFrequencyDosingType = self.noFrequencyDosingType;
        var doseAndUnits = blankIfFalsy(noFrequencyDosingType.dose) + " " + blankIfFalsy(noFrequencyDosingType.doseUnits);
        return addDelimiter(blankIfFalsy(doseAndUnits), " ");
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

    var getInstructions = function () {
        if (self.instructions !== Bahmni.Clinical.Constants.asDirectedInstruction) {
            return self.instructions;
        }
        return undefined;
    };

    var getFlexibleDosingDescription = function() {
        return addDelimiter(blankIfFalsy(getDoseAndFrequency()), " ") +
            addDelimiter(blankIfFalsy(getInstructions()), ", ") +
            addDelimiter(blankIfFalsy(asNeeded(self.asNeeded)), ', ') +
            addDelimiter(blankIfFalsy(self.route && self.route.name), " - ") +
            addDelimiter(blankIfFalsy(self.duration), " ") +
            blankIfFalsy(self.durationUnit && self.durationUnit.name);
    };

    var getNoFrequencyDosingDescription = function () {
        return addDelimiter(blankIfFalsy(noFrequencyDose()), ",") +
            addDelimiter(blankIfFalsy(self.duration), " ") +
            addDelimiter(blankIfFalsy(self.durationUnit && self.durationUnit.name), "");
    };

    this.getDescription = function () {
        return this.frequencyType === "noFrequency" ? getNoFrequencyDosingDescription() : getFlexibleDosingDescription();
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

    this.isStopped = function () {
        return this.dateStopped;
    };

    this.isActive = function(){
        return !this.isStopped() && (this.effectiveStopDate == null || this.effectiveStopDate >= Bahmni.Common.Util.DateUtil.today());
    };

    this.discontinued = function(){
        return this.action === Bahmni.Clinical.Constants.discontinueAction;
    }
};

Bahmni.Clinical.DrugOrderViewModel.createFromContract = function (drugOrderResponse) {
    var administrationInstructions = JSON.parse(drugOrderResponse.dosingInstructions.administrationInstructions) || {};
    var viewModel = new Bahmni.Clinical.DrugOrderViewModel(null, [], []);
    viewModel.asNeeded = drugOrderResponse.dosingInstructions.asNeeded;
    viewModel.route = drugOrderResponse.dosingInstructions.route;
    viewModel.effectiveStartDate = drugOrderResponse.effectiveStartDate;
    viewModel.effectiveStopDate = drugOrderResponse.effectiveStopDate;
    viewModel.durationUnit = {name: drugOrderResponse.durationUnits};
    viewModel.scheduledDate = drugOrderResponse.effectiveStartDate;
    viewModel.duration = drugOrderResponse.duration;
    if (drugOrderResponse.dosingInstructions.frequency) {
        viewModel.frequencyType = "uniform";
        viewModel.uniformDosingType = {};
        viewModel.uniformDosingType = {
            dose: drugOrderResponse.dosingInstructions.dose,
            doseUnits: drugOrderResponse.dosingInstructions.doseUnits,
            frequency: {name: drugOrderResponse.dosingInstructions.frequency}
        }
    } else if(administrationInstructions.morningDose || administrationInstructions.afternoonDose || administrationInstructions.eveningDose){
        viewModel.frequencyType = "variable";
        viewModel.variableDosingType = {};
        viewModel.variableDosingType = {
            morningDose: administrationInstructions.morningDose,
            afternoonDose: administrationInstructions.afternoonDose,
            eveningDose: administrationInstructions.eveningDose
        }
    } else if(administrationInstructions.dose || administrationInstructions.doseUnits) {
        viewModel.frequencyType = "noFrequency";
        viewModel.noFrequencyDosingType = {};
        viewModel.noFrequencyDosingType = {
            dose: administrationInstructions.dose,
            doseUnits: administrationInstructions.doseUnits
        };
    }
    viewModel.instructions = administrationInstructions.instructions;
    viewModel.additionalInstructions = administrationInstructions.additionalInstructions;
    viewModel.quantity = drugOrderResponse.dosingInstructions.quantity;
    viewModel.quantityUnit = drugOrderResponse.dosingInstructions.quantityUnits;
    viewModel.drugName = drugOrderResponse.drug.name;
    viewModel.provider = drugOrderResponse.provider.name;
    viewModel.action = drugOrderResponse.action;
    viewModel.dateStopped = drugOrderResponse.dateStopped;
    viewModel.uuid = drugOrderResponse.uuid;
    return viewModel;
};
