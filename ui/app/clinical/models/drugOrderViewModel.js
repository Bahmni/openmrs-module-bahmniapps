Bahmni.Clinical.DrugOrderViewModel = function (extensionParams, config) {
    var getDefaultValue = function (defaultValue, valueSet) {
        return defaultValue && _.find(valueSet, function (value) {
            return value.name === defaultValue;
        });
    };

    var self = this;
    var config = config || {};
    var durationUnits = config.durationUnits || [];
    var defaultDoseUnit = getDefaultValue(extensionParams && extensionParams.defaultDoseUnit, config.doseUnits || []);
    var defaultInstructions = getDefaultValue(extensionParams && extensionParams.defaultInstructions, config.dosingInstructions || []);
    this.asNeeded = false;
    this.route = getDefaultValue(extensionParams && extensionParams.defaultRoute, config.routes || []);
    this.durationUnit = getDefaultValue(extensionParams && extensionParams.defaultDurationUnit, durationUnits);
    this.instructions = defaultInstructions && defaultInstructions.name;
    this.scheduledDate = Bahmni.Common.Util.DateUtil.now();
    this.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
    this.uniformDosingType = {doseUnits: defaultDoseUnit && defaultDoseUnit.name};
    this.variableDosingType = {doseUnits: defaultDoseUnit && defaultDoseUnit.name};
    this.noFrequencyDosingType = {};
    this.durationInDays = 0;
    this.isDiscontinuedAllowed = true;
    this.isEditAllowed = true;
    this.quantityEnteredViaEdit = false;
    this.isBeingEdited = false;

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
        return self.frequencyType === Bahmni.Clinical.Constants.dosingTypes.uniform ? simpleDoseAndFrequency() : numberBasedDoseAndFrequency();
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

    //Ugly code to handle the two contracts for drugOrder
    var getRouteName = function() {
        if(!self.route) return '';
        return self.route.name || self.route;
    }

    var getOtherDescription = function(){
        return addDelimiter(blankIfFalsy(getInstructions()), ", ") +
        addDelimiter(blankIfFalsy(asNeeded(self.asNeeded)), ', ') +
        addDelimiter(blankIfFalsy(getRouteName()), " - ") +
        addDelimiter(blankIfFalsy(self.duration), " ") +
        blankIfFalsy(self.durationUnit && self.durationUnit.name);
    };

    var getFlexibleDosingDescription = function() {
        return addDelimiter(blankIfFalsy(getDoseAndFrequency()), " ") +
            getOtherDescription();
    };

    var getNoFrequencyDosingDescription = function () {
        return addDelimiter(blankIfFalsy(noFrequencyDose()), ",") +
            getOtherDescription();
    };

    var constructDrugNameDisplay = function (drug, drugForm) {
        return {
            label: drug.name + " (" + drugForm + ")",
            value: drug.name + " (" + drugForm + ")",
            drug: drug
        };
    };

    this.getDescription = function () {
        self = this;
        return this.frequencyType === Bahmni.Clinical.Constants.dosingTypes.noFrequency ? getNoFrequencyDosingDescription() : getFlexibleDosingDescription();
    };

    this.getDescriptionWithQuantity = function(){
        return addDelimiter(blankIfFalsy(this.getDescription()), "(") +
            addDelimiter(blankIfFalsy(this.quantity), " ") +
            addDelimiter(blankIfFalsy(this.quantityUnit), ")");
    };

    this.calculateDurationUnit = function (durationUnits) {
        if (this.frequencyType === Bahmni.Clinical.Constants.dosingTypes.uniform) {
            var frequency = this.uniformDosingType.frequency;
            if (frequency.frequencyPerDay > 4) {
                this.durationUnit = _.find(durationUnits, function(durationUnit){
                    return durationUnit.name === "Hour(s)";
                });
            } else if (frequency.frequencyPerDay >= 0.5) {
                this.durationUnit = _.find(durationUnits, function(durationUnit){
                    return durationUnit.name === "Day(s)";
                });
            } else {
                this.durationUnit = _.find(durationUnits, function(durationUnit){
                    return durationUnit.name === "Week(s)";
                });
            }
        }
    };

    this.setFrequencyType = function (type) {
        this.frequencyType = type;
        if (this.frequencyType === Bahmni.Clinical.Constants.dosingTypes.uniform) {
            this.variableDosingType = {};
            this.noFrequencyDosingType = {};
        } else if(this.frequencyType === Bahmni.Clinical.Constants.dosingTypes.variable){
            this.uniformDosingType = {};
            this.noFrequencyDosingType = {};
        } else {
            this.variableDosingType = {};
            this.uniformDosingType = {};
        }
    };

    this.isCurrentDosingTypeEmpty = function () {
        var dosingType = this.isUniformDosingType() ? this.uniformDosingType : this.variableDosingType;
        return _.every(dosingType, function (element) {
            return element == null;
        });
    };

    this.isVariableDosingType = function () {
        return this.isFrequencyType(Bahmni.Clinical.Constants.dosingTypes.variable);
    };

    this.isUniformDosingType = function () {
        return this.isFrequencyType(Bahmni.Clinical.Constants.dosingTypes.uniform);
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

    this.calculateQuantityAndUnit = function () {
        this.calculateDurationInDays();
        if (!this.quantityEnteredManually && !this.quantityEnteredViaEdit) {
            if (this.frequencyType == Bahmni.Clinical.Constants.dosingTypes.uniform) {
                this.quantity = this.uniformDosingType.dose * (this.uniformDosingType.frequency ? this.uniformDosingType.frequency.frequencyPerDay : 0) * this.durationInDays;
                this.quantityUnit = this.uniformDosingType.doseUnits;
            } else if (this.frequencyType == Bahmni.Clinical.Constants.dosingTypes.variable) {
                var dose = this.variableDosingType;
                this.quantity = (dose.morningDose + dose.afternoonDose + dose.eveningDose) * this.durationInDays;
                this.quantityUnit = this.variableDosingType.doseUnits;
            }
        }
        if(this.quantity % 1 != 0){
            this.quantity = this.quantity - ( this.quantity % 1 ) + 1;
        }
        this.quantityEnteredViaEdit = false;
    };

    this.isStopped = function () {
        return this.dateStopped;
    };

    this.isActive = function(){
        return !this.isStopped() && (this.effectiveStopDate == null || this.effectiveStopDate >= Bahmni.Common.Util.DateUtil.today());
    };

    this.discontinued = function(){
        return this.action === Bahmni.Clinical.Constants.orderActions.discontinue;
    };

    this.revise = function(treatmentConfig){
        var revisableDrugOrder = new Bahmni.Clinical.DrugOrderViewModel(null, [], []);
        angular.copy(this, revisableDrugOrder);

        revisableDrugOrder.previousOrderUuid = this.uuid;
        revisableDrugOrder.action = Bahmni.Clinical.Constants.orderActions.revise;
        revisableDrugOrder.uuid = undefined;
        revisableDrugOrder.dateActivated = undefined;

        revisableDrugOrder.uniformDosingType.frequency = this.isUniformDosingType() && _.find(treatmentConfig.frequencies, function(frequency){
            return frequency.name === self.uniformDosingType.frequency.name;
        });

        revisableDrugOrder.durationUnit = _.find(treatmentConfig.durationUnits, function(durationUnit){
            return durationUnit.name === self.durationUnit.name;
        });

        revisableDrugOrder.route = _.find(treatmentConfig.routes, function(route){
            return route.name === self.route;
        });

        revisableDrugOrder.drugNameDisplay = constructDrugNameDisplay(this.drug, this.drug.form).value;
        revisableDrugOrder.quantityEnteredViaEdit = true;

        return revisableDrugOrder;
    };

    this.cloneForEdit = function(index, treatmentConfig){
        var editableDrugOrder = new Bahmni.Clinical.DrugOrderViewModel(null, [], []);
        angular.copy(this, editableDrugOrder);

        editableDrugOrder.uniformDosingType.frequency = this.isUniformDosingType() && _.find(treatmentConfig.frequencies, function(frequency){
            return frequency.name === self.uniformDosingType.frequency.name;
        });

        editableDrugOrder.durationUnit = _.find(treatmentConfig.durationUnits, function(durationUnit){
            return durationUnit.name === self.durationUnit.name;
        });

        editableDrugOrder.route = _.find(treatmentConfig.routes, function(route){
            return route.name === self.route;
        });

        editableDrugOrder.currentIndex = index;
        editableDrugOrder.isBeingEdited = true;
        return editableDrugOrder;
    };
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
        viewModel.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
        viewModel.uniformDosingType = {};
        viewModel.uniformDosingType = {
            dose: drugOrderResponse.dosingInstructions.dose,
            doseUnits: drugOrderResponse.dosingInstructions.doseUnits,
            frequency: {name: drugOrderResponse.dosingInstructions.frequency}
        }
    } else if(administrationInstructions.morningDose || administrationInstructions.afternoonDose || administrationInstructions.eveningDose){
        viewModel.frequencyType = Bahmni.Clinical.Constants.dosingTypes.variable;
        viewModel.variableDosingType = {};
        viewModel.variableDosingType = {
            morningDose: administrationInstructions.morningDose,
            afternoonDose: administrationInstructions.afternoonDose,
            eveningDose: administrationInstructions.eveningDose,
            doseUnits: drugOrderResponse.dosingInstructions.doseUnits
        }
    } else {
        viewModel.frequencyType = Bahmni.Clinical.Constants.dosingTypes.noFrequency;
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
    viewModel.drug = drugOrderResponse.drug;
    viewModel.drugName = drugOrderResponse.drug.name;
    viewModel.provider = drugOrderResponse.provider;
    viewModel.action = drugOrderResponse.action;
    viewModel.dateStopped = drugOrderResponse.dateStopped;
    viewModel.uuid = drugOrderResponse.uuid;
    return viewModel;
};
