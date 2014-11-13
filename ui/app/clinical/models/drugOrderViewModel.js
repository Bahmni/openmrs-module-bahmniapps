Bahmni.Clinical.DrugOrderViewModel = function (appConfig, config, proto) {
    angular.copy(proto, this);

    var allowedQuantityUnits = ["Tablet(s)","Capsule(s)"];
    var DateUtil = Bahmni.Common.Util.DateUtil;
    var self = this;
    var config = config || {};
    var appConfig = appConfig || {};
    var drugFormDefaults = appConfig.drugFormDefaults || {};
    var durationUnits = config.durationUnits || [];

    Object.defineProperty(this, 'effectiveStartDate', {
        get: function () {
            return self._effectiveStartDate;
        },
        set : function(value){
            self._effectiveStartDate = value;
            if(DateUtil.parse(value) >= DateUtil.addDays(DateUtil.today(), 1)){
                self.scheduledDate = self._effectiveStartDate;
            } else {
                self.scheduledDate = null;
            }
        },
        enumerable: true
    });

    Object.defineProperty(this, 'uiStartDate', {
        get: function () {
            return moment(self.effectiveStartDate).format('YYYY-MM-DD');
        },
        set : function(value){
            self.effectiveStartDate = value;
            if(self.effectiveStopDate && DateUtil.isSameDate(self.effectiveStartDate, self.effectiveStopDate)){
                var oldEffectiveStopDate = new Date(self.effectiveStopDate);
                self.effectiveStartDate = oldEffectiveStopDate >= DateUtil.today() ? DateUtil.addSeconds(oldEffectiveStopDate, 1) : DateUtil.today();
            }
        }
    });

    Object.defineProperty(this, 'uniformDosingDoseUnits', {
        get: function() {
            return this.isUniformDosingType() ? this.doseUnits : null;
        },
        set: function(value) {
            this.doseUnits = value;
        }
    });

    Object.defineProperty(this, 'variableDosingDoseUnits', {
        get: function() {
            return this.isVariableDosingType() ? this.doseUnits : null;
        },
        set: function(value) {
            this.doseUnits = value;
        }
    });

    var getDosingType = function() {
        return self.isUniformDosingType() ? self.uniformDosingType : self.variableDosingType;
    };

    this.asNeeded = this.asNeeded || false;
    this.route = this.route || undefined;
    this.durationUnit = this.durationUnit || appConfig.defaultDurationUnit;
    this.instructions = this.instructions || appConfig.defaultInstructions;
    this.effectiveStartDate = this.effectiveStartDate || DateUtil.now();
    this.frequencyType = this.frequencyType || Bahmni.Clinical.Constants.dosingTypes.uniform;
    this.doseUnits = this.doseUnits || undefined;
    this.uniformDosingType = this.uniformDosingType || {};
    this.variableDosingType = this.variableDosingType || {};
    this.durationInDays = this.durationInDays || 0;
    this.isDiscontinuedAllowed = this.isDiscontinuedAllowed || true;
    this.isEditAllowed = this.isEditAllowed || true;
    this.quantityEnteredViaEdit = this.quantityEnteredViaEdit || false;
    this.isBeingEdited = this.isBeingEdited || false;

    var simpleDoseAndFrequency = function () {
        var uniformDosingType = self.uniformDosingType;
        var doseAndUnits = blankIfFalsy(uniformDosingType.dose) + " " + blankIfFalsy(self.doseUnits);
        return addDelimiter(blankIfFalsy(doseAndUnits), ", ") +
            addDelimiter(blankIfFalsy(uniformDosingType.frequency), ", ");
    };

    var numberBasedDoseAndFrequency = function () {
        var variableDosingType = self.variableDosingType;
        var variableDosingString = addDelimiter((variableDosingType.morningDose || 0) + "-" + (variableDosingType.afternoonDose || 0) + "-" + (variableDosingType.eveningDose || 0), " ");
        return addDelimiter((variableDosingString + blankIfFalsy(self.doseUnits)).trim(), ", ")
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

    var getOtherDescription = function(){
        return addDelimiter(blankIfFalsy(getInstructions()), ", ") +
        addDelimiter(blankIfFalsy(asNeeded(self.asNeeded)), ', ') +
        addDelimiter(blankIfFalsy(self.route), " - ") +
        addDelimiter(blankIfFalsy(self.duration), " ") +
        blankIfFalsy(self.durationUnit);
    };

    var constructDrugNameDisplay = function (drug, drugForm) {
        return {
            label: drug.name + " (" + drugForm + ")",
            value: drug.name + " (" + drugForm + ")",
            drug: drug
        };
    };

    this.getDisplayName = function(){
        return constructDrugNameDisplay(this.drug, this.drug.form).label;
    };

    this.getDescription = function () {
        return addDelimiter(blankIfFalsy(getDoseAndFrequency()), " ") +
            getOtherDescription();
    };

    this.getDescriptionWithQuantity = function(){
        return addDelimiter(blankIfFalsy(self.getDescription()), "(") +
            addDelimiter(blankIfFalsy(self.quantity), " ") +
            addDelimiter(blankIfFalsy(self.quantityUnit), ")");
    };

    var getFrequencyPerDay = function(){
        var frequency = self.isUniformDosingType() && _.find(config.frequencies, function(frequency){
            return self.uniformDosingType.frequency && (frequency.name === self.uniformDosingType.frequency);
        });

        return frequency && frequency.frequencyPerDay;
    };

    this.changeDrug = function(drug) {
        this.drug = drug;
        if(!drug) return;
        var defaults = drugFormDefaults[this.drug.form];
        if(defaults) {
            this.doseUnits = defaults.doseUnits;
            this.route = defaults.route;
        }
    };

    this.calculateDurationUnit = function () {
        if (self.frequencyType === Bahmni.Clinical.Constants.dosingTypes.uniform) {
            var frequency = self.uniformDosingType.frequency;
            if (frequency && (getFrequencyPerDay() > 4)) {
                self.durationUnit = "Hour(s)";
            } else if (frequency && (getFrequencyPerDay() >= 0.5)) {
                self.durationUnit = "Day(s)";
            } else {
                self.durationUnit = "Week(s)";
            }
        }
    };

    this.setFrequencyType = function (type) {
        self.frequencyType = type;
        if (self.frequencyType === Bahmni.Clinical.Constants.dosingTypes.variable) {
            self.uniformDosingType = {};
        } else {
            self.variableDosingType = {};
        }
    };

    this.isCurrentDosingTypeEmpty = function () {
        var dosingType = getDosingType();
        return _.every(dosingType, function (element) { return element == null; });
    };

    this.isVariableDosingType = function () {
        return self.isFrequencyType(Bahmni.Clinical.Constants.dosingTypes.variable);
    };

    this.isUniformDosingType = function () {
        return self.isFrequencyType(Bahmni.Clinical.Constants.dosingTypes.uniform);
    };

    this.isFrequencyType = function (type) {
        return self.frequencyType === type;
    };

    this.setQuantityEnteredManually = function () {
        self.quantityEnteredManually = true;
    };

    this.calculateDurationInDays = function () {
        var durationUnitFromConfig = _.find(durationUnits, function(unit) {
            return unit.name === self.durationUnit;
        });
        self.durationInDays = self.duration * (durationUnitFromConfig && durationUnitFromConfig.factor || 1);
    };

    var inAllowedQuantityUnits = function(doseUnit){
        return allowedQuantityUnits.indexOf(doseUnit) != -1;
    };

    var quantityUnitsFrom = function(doseUnit){
        return inAllowedQuantityUnits(doseUnit) ? doseUnit: "Unit(s)";
    };

    var modifyForReverseSyncIfRequired = function(drugOrder) {
        if (drugOrder.reverseSynced) {
            drugOrder.uniformDosingType = {};
            drugOrder.quantity = undefined;
            drugOrder.quantityUnit = undefined;
            drugOrder.doseUnits = undefined;
        }
    };

    this.calculateQuantityAndUnit = function () {
        self.calculateDurationInDays();
        if (!self.quantityEnteredManually && !self.quantityEnteredViaEdit) {
            if (self.frequencyType == Bahmni.Clinical.Constants.dosingTypes.uniform) {
                self.quantity = self.uniformDosingType.dose * (self.uniformDosingType.frequency ? getFrequencyPerDay() : 0) * self.durationInDays;
            } else if (self.frequencyType == Bahmni.Clinical.Constants.dosingTypes.variable) {
                var dose = self.variableDosingType;
                self.quantity = (dose.morningDose + dose.afternoonDose + dose.eveningDose) * self.durationInDays;
            }
        }
        if(self.quantity % 1 != 0){
            self.quantity = self.quantity - ( self.quantity % 1 ) + 1;
        }
        self.quantityEnteredViaEdit = false;
        self.quantityUnit = quantityUnitsFrom(self.doseUnits);
    };

    this.isStopped = function () {
        return !!self.dateStopped;
    };

    this.isScheduled = function(){
        return self.scheduledDate && self.scheduledDate > DateUtil.now();
    };

    this.isActive = function(){
        return !self.isDiscontinuedOrStopped() && (self.effectiveStopDate == null || self.effectiveStopDate >= Bahmni.Common.Util.DateUtil.today());
    };

    this.discontinued = function(){
        return self.action === Bahmni.Clinical.Constants.orderActions.discontinue;
    };

    this.isDiscontinuedOrStopped = function(){
        return self.isStopped() || self.discontinued();
    };

    var defaultQuantityUnit = function(drugOrder) {
        if (!drugOrder.quantityUnit) {
            drugOrder.quantityUnit = "Unit(s)";
        }
    };

    this.refill = function () {
        var newDrugOrder = new Bahmni.Clinical.DrugOrderViewModel(appConfig, config, this);
        newDrugOrder.previousOrderUuid = undefined;
        newDrugOrder.action = Bahmni.Clinical.Constants.orderActions.new;
        newDrugOrder.uuid = undefined;
        newDrugOrder.dateActivated = undefined;
        var oldEffectiveStopDate = new Date(self.effectiveStopDate);
        newDrugOrder.effectiveStartDate = oldEffectiveStopDate >= DateUtil.today() ? DateUtil.addSeconds(oldEffectiveStopDate, 1) : DateUtil.today();

        modifyForReverseSyncIfRequired(newDrugOrder);
        defaultQuantityUnit(newDrugOrder);
        newDrugOrder.drugNameDisplay = constructDrugNameDisplay(this.drug, this.drug.form).value;

        return newDrugOrder;
    };

    this.revise = function () {
        var newDrugOrder = new Bahmni.Clinical.DrugOrderViewModel(appConfig, config, this);

        newDrugOrder.previousOrderUuid = self.uuid;
        newDrugOrder.action = Bahmni.Clinical.Constants.orderActions.revise;
        newDrugOrder.uuid = undefined;
        newDrugOrder.dateActivated = undefined;
        newDrugOrder.drugNameDisplay = constructDrugNameDisplay(self.drug, self.drug.form).value;
        newDrugOrder.quantityEnteredViaEdit = true;

        modifyForReverseSyncIfRequired(newDrugOrder);
        defaultQuantityUnit(newDrugOrder);

        return newDrugOrder;
    };

    this.cloneForEdit = function (index, appConfig, config) {
        var editableDrugOrder = new Bahmni.Clinical.DrugOrderViewModel(appConfig, config, this);
        editableDrugOrder.currentIndex = index;
        editableDrugOrder.isBeingEdited = true;
        defaultQuantityUnit(editableDrugOrder);
        return editableDrugOrder;
    };

    var validateUniformDosingType = function () {
        if (self.uniformDosingType.frequency) {
            if (self.uniformDosingType.dose && self.doseUnits && self.uniformDosingType.dose > 0) {
                return true;
            } else if (self.uniformDosingType.dose == undefined && !self.doseUnits) {
                return true;
            }
            return false
        }
        return false;
    };

    var validateVariableDosingType = function(){
        return !(self.variableDosingType.morningDose == undefined ||
            self.variableDosingType.afternoonDose == undefined ||
            self.variableDosingType.eveningDose == undefined ||
            self.doseUnits == undefined);
    };

    this.validate = function(){
        if(self.isUniformDosingType()){
            return validateUniformDosingType();
        }else if(self.isVariableDosingType()){
            return validateVariableDosingType();
        }
        return false;
    }
};

Bahmni.Clinical.DrugOrderViewModel.createFromContract = function (drugOrderResponse, appConfig, config) {
    var administrationInstructions = JSON.parse(drugOrderResponse.dosingInstructions.administrationInstructions) || {};
    var viewModel = new Bahmni.Clinical.DrugOrderViewModel(appConfig, config);
    viewModel.asNeeded = drugOrderResponse.dosingInstructions.asNeeded;
    viewModel.route = drugOrderResponse.dosingInstructions.route;
    viewModel.effectiveStartDate = drugOrderResponse.effectiveStartDate;
    viewModel.effectiveStopDate = drugOrderResponse.effectiveStopDate;
    viewModel.durationUnit = drugOrderResponse.durationUnits;
    viewModel.scheduledDate = drugOrderResponse.effectiveStartDate;
    viewModel.duration = drugOrderResponse.duration;
    if (drugOrderResponse.dosingInstructions.frequency || drugOrderResponse.dosingInstructions.dose) {
        viewModel.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
        viewModel.doseUnits = drugOrderResponse.dosingInstructions.doseUnits;
        viewModel.uniformDosingType = {
            dose: drugOrderResponse.dosingInstructions.dose,
            frequency: drugOrderResponse.dosingInstructions.frequency
        }
    } else if(administrationInstructions.morningDose || administrationInstructions.afternoonDose || administrationInstructions.eveningDose){
        viewModel.frequencyType = Bahmni.Clinical.Constants.dosingTypes.variable;
        viewModel.doseUnits = drugOrderResponse.dosingInstructions.doseUnits;
        viewModel.variableDosingType = {
            morningDose: administrationInstructions.morningDose,
            afternoonDose: administrationInstructions.afternoonDose,
            eveningDose: administrationInstructions.eveningDose
        }
    } else {
        viewModel.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
        viewModel.reverseSynced = true;
        viewModel.doseUnits = administrationInstructions.doseUnits;
        viewModel.uniformDosingType = {
            dose: parseFloat(administrationInstructions.dose)
        }
    }
    viewModel.instructions = administrationInstructions.instructions;
    viewModel.additionalInstructions = administrationInstructions.additionalInstructions;
    viewModel.quantity = drugOrderResponse.dosingInstructions.quantity;
    viewModel.quantityUnit = drugOrderResponse.dosingInstructions.quantityUnits;
    viewModel.drug = drugOrderResponse.drug;
    viewModel.provider = drugOrderResponse.provider;
    viewModel.action = drugOrderResponse.action;
    viewModel.dateStopped = drugOrderResponse.dateStopped;
    viewModel.uuid = drugOrderResponse.uuid;
    viewModel.previousOrderUuid = drugOrderResponse.previousOrderUuid;
    viewModel.dateActivated = drugOrderResponse.dateActivated;
    viewModel.encounterUuid = drugOrderResponse.encounterUuid;
    return viewModel;
};
