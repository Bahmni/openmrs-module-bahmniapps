Bahmni.Clinical.DrugOrderViewModel = function (appConfig, config, proto, encounterDate) {
    angular.copy(proto, this);

    var allowedQuantityUnits = ["Tablet(s)","Capsule(s)"];
    var DateUtil = Bahmni.Common.Util.DateUtil;
    var self = this;
    var config = config || {};
    var appConfig = appConfig || {};
    var drugFormDefaults = appConfig.drugFormDefaults || {};
    var durationUnits = config.durationUnits || [];
    var now = DateUtil.now();

    var today = function() {
        return DateUtil.parse(self.encounterDate);
    };

    Object.defineProperty(this, 'effectiveStartDate', {
        get: function () {
            return self._effectiveStartDate;
        },
        set : function(value){
            self._effectiveStartDate = value;

            if(DateUtil.parse(value) > today()) {
                self.scheduledDate = self._effectiveStartDate;
            } else {
                self.scheduledDate = null;
            }
        },
        enumerable: true
    });

    Object.defineProperty(this, 'doseUnits', {
        enumerable: true,
        get: function() {
            if(this.isUniformDosingType()) {
                return this.uniformDosingType.doseUnits;
            } else if(this.isVariableDosingType()) {
                return this.variableDosingType.doseUnits;
            }
            return null;
        },
        set: function(value) {
            if(this.isUniformDosingType()) {
                this.uniformDosingType.doseUnits = value;
            } else if(this.isVariableDosingType()) {
                this.variableDosingType.doseUnits = value;
            }
        }
    });

    var getDosingType = function() {
        return self.isUniformDosingType() ? self.uniformDosingType : self.variableDosingType;
    };

    this.encounterDate = encounterDate ? encounterDate : now;
    this.asNeeded = this.asNeeded || false;
    this.route = this.route || undefined;
    this.durationUnit = this.durationUnit || appConfig.defaultDurationUnit;
    this.simpleDrugForm = this.simpleDrugForm || appConfig.simpleDrugForm || false;
    this.instructions = this.instructions || appConfig.defaultInstructions;
    this.effectiveStartDate = this.effectiveStartDate || this.encounterDate;
    this.autoExpireDate = this.autoExpireDate || undefined;
    this.frequencyType = this.frequencyType || Bahmni.Clinical.Constants.dosingTypes.uniform;
    this.uniformDosingType = this.uniformDosingType || {};
    this.variableDosingType = this.variableDosingType || {};
    this.durationInDays = this.durationInDays || 0;
    this.isDiscontinuedAllowed = this.isDiscontinuedAllowed || true;
    this.isEditAllowed = this.isEditAllowed || true;
    this.quantityEnteredViaEdit = this.quantityEnteredViaEdit || false;
    this.quantityEnteredManually = this.quantityEnteredManually || false;
    this.isBeingEdited = this.isBeingEdited || false;
    this.orderAttributes = [];
    this.isNonCodedDrug = this.isNonCodedDrug || false;
    this.changedBySelection = false;

    this.setAsNonCodedDrug = function () {
        this.isNonCodedDrug = !this.isNonCodedDrug;
        if(this.isNonCodedDrug) this.drugNonCoded = this.drugNameDisplay;
    };

    this.clearCodedDrugUuid = function () {
        if (this.changedBySelection) {
            this.changedBySelection = false;
            return;
        }
        if(this.drug) this.drug.uuid = undefined;
    };

    this.overlappingScheduledWith = function(otherDrugOrder){

        var dateUtil = Bahmni.Common.Util.DateUtil;
        if (otherDrugOrder.effectiveStopDate == null && this.effectiveStopDate == null) {
            return true;
        }

        if (otherDrugOrder.effectiveStopDate == null) {
            return dateUtil.diffInSeconds(this.effectiveStopDate, otherDrugOrder.effectiveStartDate) >-1;
        }

        if (this.effectiveStopDate == null) {
            return (dateUtil.diffInSeconds(this.effectiveStartDate, otherDrugOrder.effectiveStartDate) >-1) && (dateUtil.diffInSeconds(this.effectiveStartDate, otherDrugOrder.effectiveStopDate) <1);
        }

        return (dateUtil.diffInSeconds(this.effectiveStartDate, otherDrugOrder.effectiveStopDate) <= 0 && dateUtil.diffInSeconds(this.effectiveStopDate, otherDrugOrder.effectiveStartDate) > -1);
    };

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

    var getOtherDescription = function(withRoute, withDuration){
        var otherDescription = addDelimiter(blankIfFalsy(getInstructions()), ", ") +
            addDelimiter(blankIfFalsy(asNeeded(self.asNeeded)), ', ');
        if(withRoute){
            otherDescription = otherDescription + addDelimiter(blankIfFalsy(self.route), " - ");
        }else{
            otherDescription = otherDescription.substring(0, otherDescription.length - 2);
            otherDescription = addDelimiter(blankIfFalsy(otherDescription), " - ");
        }
        if(withDuration){
            otherDescription = otherDescription + addDelimiter(blankIfFalsy(self.duration), " ") + addDelimiter(blankIfFalsy(self.durationUnit), ", ")
        }
        otherDescription = otherDescription.substring(0, otherDescription.length - 2);
        return otherDescription;
    };

    var constructDrugNameDisplay = function (drug, drugForm) {
        return {
            label: drug.name + " (" + drugForm + ")",
            value: drug.name + " (" + drugForm + ")",
            drug: drug
        };
    };

    this.getDoseInformation = function(){
        return getDoseAndFrequency();
    };

    this.getDisplayName = function(){
        return this.drugNameDisplay ? this.drugNameDisplay : constructDrugNameDisplay(this.drug, this.drug.form).label;
    };

    this.getDrugName = function(){
        return self.drugNameDisplay ? self.drugNameDisplay : constructDrugNameDisplay(self.drug, self.drug.form).value
    };

    this.getDrugOrderName = function(showDrugForm){
        if(showDrugForm) {
            return this.getDisplayName();
        }
        else {
            return self.drugNonCoded ? self.drugNonCoded : self.drug.name;
        }
    };

    this.getDescription = function () {
        return addDelimiter(blankIfFalsy(getDoseAndFrequency()), " ") +
            getOtherDescription(true, true);
    };

    this.getDescriptionWithoutRoute = function(){
        return addDelimiter(blankIfFalsy(getDoseAndFrequency()), " ") +
            getOtherDescription(false, true);
    };

    this.getDescriptionWithoutRouteAndDuration = function(){
        var otherDescription = getOtherDescription(false, false);
        var description = addDelimiter(blankIfFalsy(getDoseAndFrequency()), " ");
        return otherDescription? description + otherDescription: description.substring(0, description.length - 2);
    };

    this.getDescriptionWithoutDuration = function(){
        var otherDescription = getOtherDescription(true, false);
        var description = addDelimiter(blankIfFalsy(getDoseAndFrequency()), " ");
        return otherDescription? description + otherDescription: description.substring(0, description.length - 2);
    };

    this.getDescriptionWithQuantity = function(){
        var description = self.getDescription();
        var qtywithUnit = self.getQuantityWithUnit();
        if(_.isEmpty(qtywithUnit)){
            return description;
        }
        return addDelimiter(description, "(") + addDelimiter(qtywithUnit, ")");
    };

    this.getQuantityWithUnit = function () {
        if(this.simpleDrugForm === true){
            return "";
        }
        return addDelimiter(blankIfFalsy(self.quantity), " ") + blankIfFalsy(quantityUnitsFrom(self.quantityUnit));
    };

    var getFrequencyPerDay = function(){
        var frequency = self.isUniformDosingType() && _.find(config.frequencies, function(frequency){
            return self.uniformDosingType.frequency && (frequency.name === self.uniformDosingType.frequency);
        });

        return frequency && frequency.frequencyPerDay;
    };

    var findAnElement = function(array, element){
        var found = _.find(array, function (arrayElement) {
            return arrayElement.name === element;
        });

        return found ? element : undefined;
    };

    var getDoseUnits = function (doseUnit) {
        return findAnElement(config.doseUnits, doseUnit);
    };

    var getRoute = function (route) {
        return findAnElement(config.routes, route);
    };

    this.changeDrug = function(drug) {
        this.drug = drug;
        if(!drug) return;
        var defaults = drugFormDefaults[this.drug.form];
        if(defaults) {
            this.doseUnits = getDoseUnits(defaults.doseUnits);
            this.route = getRoute(defaults.route);
        }
    };

    this.calculateDurationUnit = function () {
        if (self.frequencyType === Bahmni.Clinical.Constants.dosingTypes.uniform && self.uniformDosingType.frequency != null) {
            var defaultDurationUnitMap = appConfig.frequencyDefaultDurationUnitsMap || [];

            defaultDurationUnitMap.forEach(function(range) {
                var minFrequency = eval(range.minFrequency);
                var maxFrequency = eval(range.maxFrequency);
                if ((minFrequency == null || minFrequency < getFrequencyPerDay()) &&
                    (maxFrequency == null || getFrequencyPerDay() <= maxFrequency)) {
                    self.durationUnit = range.defaultDurationUnit;
                }
            });
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
        return doseUnit;
    };

    var modifyForReverseSyncIfRequired = function(drugOrder) {
        if (drugOrder.reverseSynced) {
            drugOrder.uniformDosingType = {};
            drugOrder.quantity = undefined;
            drugOrder.quantityUnit = undefined;
            drugOrder.doseUnits = undefined;

            drugOrder.changeDrug(drugOrder.drug);
        }
    };

    this.calculateQuantityAndUnit = function () {
        self.calculateDurationInDays();
        if (!self.quantityEnteredManually && !self.quantityEnteredViaEdit) {
            if (self.frequencyType === Bahmni.Clinical.Constants.dosingTypes.uniform) {
                self.quantity = self.uniformDosingType.dose * (self.uniformDosingType.frequency ? getFrequencyPerDay() : 0) * self.durationInDays;
            } else if (self.frequencyType == Bahmni.Clinical.Constants.dosingTypes.variable) {
                var dose = self.variableDosingType;
                self.quantity = (dose.morningDose + dose.afternoonDose + dose.eveningDose) * self.durationInDays;
            }

            if(self.quantity % 1 != 0){
                self.quantity = self.quantity - ( self.quantity % 1 ) + 1;
            }
        }
        if(self.quantityEnteredViaEdit && self.quantityUnit) {
            self.quantityUnit = quantityUnitsFrom(self.quantityUnit);
        }
        else {
            self.quantityUnit = quantityUnitsFrom(self.doseUnits);
        }
        self.quantityEnteredViaEdit = false;
    };

    this.isStopped = function () {
        return !!self.dateStopped;
    };

    this.isScheduled = function(){
        return !self.isDiscontinuedOrStopped() && self.scheduledDate && self.scheduledDate > today();
    };

    this.isActive = function(){
        return !self.isDiscontinuedOrStopped() && (self.effectiveStopDate == null || self.effectiveStopDate >= today());
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

    this.getSpanDetails = function () {
        var valueString = '';
        _.forEach(this.span, function (value, key, obj) {
            valueString += value + " " + key + " + ";
        });
        return valueString.substring(0, valueString.length - 3);
    };

    this.getDurationAndDurationUnits = function () {
        return addDelimiter(blankIfFalsy(self.duration), " ") +
        blankIfFalsy(self.durationUnit)
    };

    this.refill = function (existingOrderStopDate) {
        var newDrugOrder = new Bahmni.Clinical.DrugOrderViewModel(appConfig, config, this);
        newDrugOrder.previousOrderUuid = undefined;
        newDrugOrder.action = Bahmni.Clinical.Constants.orderActions.new;
        newDrugOrder.uuid = undefined;
        newDrugOrder.dateActivated = undefined;
        var oldEffectiveStopDate = existingOrderStopDate ? new Date(existingOrderStopDate): new Date(self.effectiveStopDate);
        newDrugOrder.effectiveStartDate = oldEffectiveStopDate >= today() ? DateUtil.addSeconds(oldEffectiveStopDate, 1) : today();
        newDrugOrder.calculateDurationInDays();
        newDrugOrder.effectiveStopDate = DateUtil.addDays(DateUtil.parse(newDrugOrder.effectiveStartDate), newDrugOrder.durationInDays);
        modifyForReverseSyncIfRequired(newDrugOrder);
        defaultQuantityUnit(newDrugOrder);

        return newDrugOrder;
    };

    this.revise = function () {
        var newDrugOrder = new Bahmni.Clinical.DrugOrderViewModel(appConfig, config, this);

        newDrugOrder.previousOrderUuid = self.uuid;
        self.calculateDurationInDays();
        newDrugOrder.previousOrderDurationInDays = self.durationInDays;
        newDrugOrder.action = Bahmni.Clinical.Constants.orderActions.revise;
        newDrugOrder.uuid = undefined;
        newDrugOrder.dateActivated = undefined;
        newDrugOrder.drugNameDisplay = self.drug ? constructDrugNameDisplay(self.drug, self.drug.form).value : self.drugNonCoded;
        //this field is just a flag that you turn on when revising the first time. It is turned off at the first
        //call of calculateQuantityAndUnit(). Bad code. Needs change.
        newDrugOrder.quantityEnteredViaEdit = true;
        newDrugOrder.isBeingEdited = true;

        if (newDrugOrder.effectiveStartDate <= today()) {
            newDrugOrder.effectiveStartDate = today();
        }

        modifyForReverseSyncIfRequired(newDrugOrder);
        defaultQuantityUnit(newDrugOrder);


        return newDrugOrder;
    };

    this.cloneForEdit = function (index, appConfig, config) {
        var editableDrugOrder = new Bahmni.Clinical.DrugOrderViewModel(appConfig, config, this);
        editableDrugOrder.currentIndex = index;
        editableDrugOrder.isBeingEdited = true;
        editableDrugOrder.quantityEnteredViaEdit = true;
        defaultQuantityUnit(editableDrugOrder);
        return editableDrugOrder;
    };

    var validateUniformDosingType = function () {
        if (self.uniformDosingType.frequency) {
            if (self.uniformDosingType.dose && self.uniformDosingType.doseUnits &&
                    self.quantityUnit && self.uniformDosingType.dose > 0) {
                return true;
            } else if (self.uniformDosingType.dose == undefined && !self.uniformDosingType.doseUnits && !self.quantityUnit) {
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
            self.variableDosingType.doseUnits == undefined ||
            self.quantityUnit == undefined);
    };

    this.validate = function(arg){
        if(self.isUniformDosingType()){
            return validateUniformDosingType();
        }else if(self.isVariableDosingType()){
            return validateVariableDosingType();
        }
        return false;
    };

    this.loadOrderAttributes = function(drugOrderResponse){
        if(config && config.orderAttributes){
            var findOrderAttribute= function(drugOrder,orderAttribute) {
                return _.find(drugOrder.orderAttributes, function (drugOrderAttribute) {
                    return orderAttribute.name === drugOrderAttribute.name;
                });
            };

            config.orderAttributes.forEach(function(orderAttributeInConfig){
                var orderAttributeInDrugOrder = findOrderAttribute(drugOrderResponse,orderAttributeInConfig);
                var existingOrderAttribute = findOrderAttribute(self,orderAttributeInConfig);
                var orderAttribute = existingOrderAttribute || {};
                orderAttribute.name= orderAttributeInConfig.name;
                orderAttribute.shortName= orderAttributeInConfig.shortName;
                orderAttribute.conceptUuid= orderAttributeInConfig.uuid;
                orderAttribute.value= orderAttributeInDrugOrder && orderAttributeInDrugOrder.value === "true";
                orderAttribute.obsUuid= orderAttributeInDrugOrder ? orderAttributeInDrugOrder.obsUuid : undefined;
                orderAttribute.encounterUuid = orderAttributeInDrugOrder ? orderAttributeInDrugOrder.encounterUuid : undefined;
                if(!existingOrderAttribute){
                    self.orderAttributes.push(orderAttribute);
                }
            });
        }
    };


    this.getOrderAttributesAsObs = function(){
        if(self.orderAttributes){
            var orderAttributesWithValues = self.orderAttributes.filter(function(orderAttribute){ return orderAttribute.value || orderAttribute.obsUuid});
            return orderAttributesWithValues.map(function(orderAttribute){
                return {
                    uuid : orderAttribute.obsUuid,
                    value: orderAttribute.value ? true:false,
                    orderUuid: self.uuid,
                    concept: {uuid:orderAttribute.conceptUuid }
                }
            });
        }
    };

    this.loadOrderAttributes({});
};

Bahmni.Clinical.DrugOrderViewModel.createFromContract = function (drugOrderResponse, appConfig, config) {
    var DateUtil = Bahmni.Common.Util.DateUtil;
    var administrationInstructions = JSON.parse(drugOrderResponse.dosingInstructions.administrationInstructions) || {};
    var viewModel = new Bahmni.Clinical.DrugOrderViewModel(appConfig, config);
    viewModel.asNeeded = drugOrderResponse.dosingInstructions.asNeeded;
    viewModel.route = drugOrderResponse.dosingInstructions.route;

    if (drugOrderResponse.effectiveStartDate) {
        viewModel.effectiveStartDate = DateUtil.parse(drugOrderResponse.effectiveStartDate);
    }
    viewModel.effectiveStopDate = drugOrderResponse.effectiveStopDate;
    viewModel.durationUnit = drugOrderResponse.durationUnits;
    viewModel.scheduledDate = drugOrderResponse.effectiveStartDate;
    viewModel.duration = drugOrderResponse.duration;
    if (drugOrderResponse.dosingInstructions.frequency || drugOrderResponse.dosingInstructions.dose) {
        viewModel.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
        viewModel.uniformDosingType = {
            dose: drugOrderResponse.dosingInstructions.dose,
            doseUnits: drugOrderResponse.dosingInstructions.doseUnits,
            frequency: drugOrderResponse.dosingInstructions.frequency
        }
    } else if(administrationInstructions.morningDose || administrationInstructions.afternoonDose || administrationInstructions.eveningDose){
        viewModel.frequencyType = Bahmni.Clinical.Constants.dosingTypes.variable;
        viewModel.variableDosingType = {
            morningDose: administrationInstructions.morningDose,
            afternoonDose: administrationInstructions.afternoonDose,
            eveningDose: administrationInstructions.eveningDose,
            doseUnits: drugOrderResponse.dosingInstructions.doseUnits
        }
    } else {
        viewModel.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
        viewModel.reverseSynced = true;
        viewModel.uniformDosingType = {
            dose: parseFloat(administrationInstructions.dose),
            doseUnits: administrationInstructions.doseUnits
        }
    }
    viewModel.instructions = administrationInstructions.instructions;
    viewModel.additionalInstructions = administrationInstructions.additionalInstructions;
    viewModel.quantity = drugOrderResponse.dosingInstructions.quantity;
    viewModel.quantityUnit = drugOrderResponse.dosingInstructions.quantityUnits;
    viewModel.drug = drugOrderResponse.drug;
    viewModel.provider = drugOrderResponse.provider;
    viewModel.creatorName = drugOrderResponse.creatorName;
    viewModel.action = drugOrderResponse.action;
    viewModel.concept = drugOrderResponse.concept;
    viewModel.dateStopped = drugOrderResponse.dateStopped;
    viewModel.uuid = drugOrderResponse.uuid;
    viewModel.previousOrderUuid = drugOrderResponse.previousOrderUuid;
    viewModel.dateActivated = drugOrderResponse.dateActivated;
    viewModel.encounterUuid = drugOrderResponse.encounterUuid;
    if(drugOrderResponse.orderReasonConcept != null){

    viewModel.orderReasonConcept = {
        name: drugOrderResponse.orderReasonConcept.name.name || drugOrderResponse.orderReasonConcept.name,
        uuid: drugOrderResponse.orderReasonConcept.uuid
    }
    }
    viewModel.orderReasonText = drugOrderResponse.orderReasonText;
    viewModel.orderNumber = drugOrderResponse.orderNumber && parseInt(drugOrderResponse.orderNumber.replace("ORD-", ""));
    viewModel.drugNonCoded = drugOrderResponse.drugNonCoded;
    viewModel.isNonCodedDrug = drugOrderResponse.drugNonCoded ? true : false;
    viewModel.drugNameDisplay = drugOrderResponse.drugNonCoded ? drugOrderResponse.drugNonCoded: drugOrderResponse.drug.name + " (" + drugOrderResponse.drug.form + ")";
    config ? viewModel.loadOrderAttributes(drugOrderResponse) : viewModel.orderAttributes = drugOrderResponse.orderAttributes;
    viewModel.visit = drugOrderResponse.visit;
    viewModel.voided = drugOrderResponse.voided;
    return viewModel;
};
