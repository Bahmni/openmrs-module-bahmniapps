'use strict';

var constructDrugNameDisplayWithConcept = function (drug, concept) {
    if (!_.isEmpty(drug)) {
        if (drug.name) {
            return drug.name + " (" + drug.form + ")";
        } else if (concept) {
            return (concept.shortName || concept.name) + " (" + drug.form + ")";
        }
    }
};
var constructDrugNameDisplay = function (drug) {
    if (!_.isEmpty(drug)) {
        return drug.name + " (" + drug.form + ")";
    }
};

Bahmni.Clinical.DrugOrderViewModel = function (config, proto, encounterDate) {
    angular.copy(proto, this);

    var DateUtil = Bahmni.Common.Util.DateUtil;
    var self = this;
    config = config || {};
    var inputOptionsConfig = config.inputOptionsConfig || {};
    var drugFormDefaults = inputOptionsConfig.drugFormDefaults || {};
    var durationUnits = config.durationUnits || [];
    var now = DateUtil.now();

    var today = function () {
        return DateUtil.parse(self.encounterDate);
    };

    Object.defineProperty(this, 'effectiveStartDate', {
        get: function () {
            return self._effectiveStartDate;
        },
        set: function (value) {
            self._effectiveStartDate = value;

            if (DateUtil.parse(value) > today()) {
                self.scheduledDate = self._effectiveStartDate;
            } else {
                self.scheduledDate = null;
            }
        },
        enumerable: true
    });

    Object.defineProperty(this, 'doseUnits', {
        enumerable: true,
        get: function () {
            if (this.isUniformDosingType()) {
                return this.uniformDosingType.doseUnits;
            }
            if (this.isVariableDosingType()) {
                return this.variableDosingType.doseUnits;
            }
            return null;
        },
        set: function (value) {
            if (this.isUniformDosingType()) {
                this.uniformDosingType.doseUnits = value;
            } else if (this.isVariableDosingType()) {
                this.variableDosingType.doseUnits = value;
            }
        }
    });

    var getDosingType = function () {
        return self.isUniformDosingType() ? self.uniformDosingType : self.variableDosingType;
    };

    var destructureReal = function (number) {
        var mantissa = parseFloat((number - Math.floor(number)).toFixed(2)),
            abscissa = Math.ceil(number - mantissa);

        var result = _.result(_.find(config.getDoseFractions(), function (item) {
            return item.value === mantissa;
        }), 'label');

        var response = {
            dose: number,
            fraction: null
        };

        if (result) {
            response.dose = abscissa;
            response.fraction = {
                label: result,
                value: mantissa
            };
        }

        return response;
    };

    this.encounterDate = encounterDate ? encounterDate : now;
    this.asNeeded = this.asNeeded || false;
    this.route = this.route || undefined;
    this.durationUnit = this.durationUnit || inputOptionsConfig.defaultDurationUnit;
    this.simpleDrugForm = this.simpleDrugForm || inputOptionsConfig.simpleDrugForm || false;
    this.instructions = this.instructions || inputOptionsConfig.defaultInstructions;
    this.autoExpireDate = this.autoExpireDate || undefined;
    this.frequencyType = this.frequencyType || Bahmni.Clinical.Constants.dosingTypes.uniform;
    this.uniformDosingType = this.uniformDosingType || {};
    if (this.uniformDosingType.dose && config.getDoseFractions && !_.isEmpty(config.getDoseFractions())) {
        var destructredNumber = destructureReal(this.uniformDosingType.dose);
        this.uniformDosingType.dose = destructredNumber.dose === 0 ? "" : destructredNumber.dose;

        if (destructredNumber.fraction) {
            this.uniformDosingType.doseFraction = destructredNumber.fraction;
        }
    }
    this.variableDosingType = this.variableDosingType || {};
    this.durationInDays = this.durationInDays || 0;
    this.isDiscontinuedAllowed = this.isDiscontinuedAllowed || true;
    this.isEditAllowed = this.isEditAllowed || true;
    this.quantityEnteredViaEdit = this.quantityEnteredViaEdit || false;
    this.quantityEnteredManually = this.quantityEnteredManually || false;
    this.quantityUnitEnteredManually = this.quantityUnitEnteredManually || false;
    this.isBeingEdited = this.isBeingEdited || false;
    this.orderAttributes = [];
    this.isNonCodedDrug = this.isNonCodedDrug || false;
    this.isDurationRequired = inputOptionsConfig.duration && inputOptionsConfig.duration.required == false ? false : true;

    if (inputOptionsConfig.defaultStartDate === false && !this.effectiveStartDate) {
        this.effectiveStartDate = null;
    } else {
        this.effectiveStartDate = this.effectiveStartDate || this.encounterDate;
    }

    this.isUniformFrequency = true;
    this.showExtraInfo = false;

    this.overlappingScheduledWith = function (otherDrugOrder) {
        var dateUtil = Bahmni.Common.Util.DateUtil;
        if (!otherDrugOrder.effectiveStopDate && !this.effectiveStopDate) {
            return true;
        }

        if (!otherDrugOrder.effectiveStopDate) {
            return dateUtil.diffInSeconds(this.effectiveStopDate, otherDrugOrder.effectiveStartDate) > -1;
        }

        if (!this.effectiveStopDate) {
            return (dateUtil.diffInSeconds(this.effectiveStartDate, otherDrugOrder.effectiveStartDate) > -1) && (dateUtil.diffInSeconds(this.effectiveStartDate, otherDrugOrder.effectiveStopDate) < 1);
        }

        return (dateUtil.diffInSeconds(this.effectiveStartDate, otherDrugOrder.effectiveStopDate) <= 0 && dateUtil.diffInSeconds(this.effectiveStopDate, otherDrugOrder.effectiveStartDate) > -1);
    };

    var morphToMixedFraction = function (number) {
        var mantissa = parseFloat((number - Math.floor(number)).toFixed(2)),
            abscissa = Math.ceil(number - mantissa);

        if (!config.getDoseFractions || _.isEmpty(config.getDoseFractions()) || mantissa === 0) {
            return number;
        }

        var result = _.result(_.find(config.getDoseFractions(), function (item) {
            return item.value === mantissa;
        }), 'label');

        if (!result) {
            return number;
        }

        return abscissa ? "" + abscissa + result : "" + result;
    };

    var simpleDoseAndFrequency = function () {
        var uniformDosingType = self.uniformDosingType;
        var mantissa = self.uniformDosingType.doseFraction ? self.uniformDosingType.doseFraction.value : 0;
        var dose = uniformDosingType.dose ? uniformDosingType.dose : 0;
        var doseAndUnits;
        if (uniformDosingType.dose || mantissa) {
            doseAndUnits = blankIfFalsy(morphToMixedFraction(parseFloat(dose) + mantissa)) + " " + blankIfFalsy(self.doseUnits);
        }

        return addDelimiter(blankIfFalsy(doseAndUnits), ", ") +
            addDelimiter(blankIfFalsy(uniformDosingType.frequency), ", ");
    };

    var numberBasedDoseAndFrequency = function () {
        var variableDosingType = self.variableDosingType;
        var variableDosingString = addDelimiter(morphToMixedFraction(variableDosingType.morningDose || 0) + "-" +
            morphToMixedFraction(variableDosingType.afternoonDose || 0) +
            "-" + morphToMixedFraction(variableDosingType.eveningDose || 0), " ");

        if (!self.isVariableDoseEmpty(variableDosingType)) {
            return addDelimiter((variableDosingString + blankIfFalsy(self.doseUnits)).trim(), ", ");
        }
    };

    this.isVariableDoseEmpty = function (variableDosingType) {
        return (!variableDosingType.morningDose && !variableDosingType.afternoonDose && !variableDosingType.eveningDose);
    };

    this.getAsNeededText = function (asNeeded) {
        if (asNeeded && config.translate) {
            return config.translate(null, 'MEDICATION_AS_NEEDED');
        } else if (asNeeded) {
            return 'sos';
        } else {
            return '';
        }
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

    var getOtherDescription = function (withRoute, withDuration) {
        var otherDescription = addDelimiter(blankIfFalsy(getInstructions()), ", ") +
            addDelimiter(blankIfFalsy(self.getAsNeededText(self.asNeeded)), ', ');
        if (withRoute) {
            otherDescription = otherDescription + addDelimiter(blankIfFalsy(self.route), " - ");
        } else {
            otherDescription = otherDescription.substring(0, otherDescription.length - 2);
            otherDescription = addDelimiter(blankIfFalsy(otherDescription), " - ");
        }
        if (withDuration) {
            if (self.duration && self.duration != 0) {
                otherDescription = otherDescription + addDelimiter(blankIfFalsy(self.duration), " ") + addDelimiter(blankIfFalsy(self.durationUnit), ", ");
            }
        }
        otherDescription = otherDescription.substring(0, otherDescription.length - 2);
        return otherDescription;
    };

    this.getDoseInformation = function () {
        return getDoseAndFrequency();
    };

    this.getDisplayName = function () {
        return this.drugNameDisplay ? this.drugNameDisplay : constructDrugNameDisplay(this.drug);
    };

    this.getDrugOrderName = function (showDrugForm) {
        if (showDrugForm) {
            return this.getDisplayName();
        } else {
            return self.drugNonCoded ? self.drugNonCoded : self.drug.name;
        }
    };

    this.getDescription = function () {
        return addDelimiter(blankIfFalsy(getDoseAndFrequency()), " ") +
            getOtherDescription(true, true);
    };

    this.getDescriptionWithoutRoute = function () {
        return addDelimiter(blankIfFalsy(getDoseAndFrequency()), " ") +
            getOtherDescription(false, true);
    };

    this.getDescriptionWithoutRouteAndDuration = function () {
        var otherDescription = getOtherDescription(false, false);
        var description = addDelimiter(blankIfFalsy(getDoseAndFrequency()), " ");
        return otherDescription ? description + otherDescription : description.substring(0, description.length - 2);
    };

    this.getDescriptionWithoutDuration = function () {
        var otherDescription = getOtherDescription(true, false);
        var description = addDelimiter(blankIfFalsy(getDoseAndFrequency()), " ");
        return otherDescription ? description + otherDescription : description.substring(0, description.length - 2);
    };

    this.getDescriptionWithQuantity = function () {
        var description = self.getDescription();
        var qtywithUnit = self.getQuantityWithUnit();
        if (_.isEmpty(qtywithUnit)) {
            return description;
        }
        return addDelimiter(description, "(") + addDelimiter(qtywithUnit, ")");
    };

    this.getQuantityWithUnit = function () {
        if (this.simpleDrugForm === true || self.quantity === 0) {
            return "";
        }
        return addDelimiter(blankIfFalsy(self.quantity), " ") + blankIfFalsy(quantityUnitsFrom(self.quantityUnit));
    };

    var getFrequencyPerDay = function () {
        var frequency = self.isUniformDosingType() && _.find(config.frequencies, function (frequency) {
            return self.uniformDosingType.frequency && (frequency.name === self.uniformDosingType.frequency);
        });

        return frequency && frequency.frequencyPerDay;
    };

    var findAnElement = function (array, element) {
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

    this.changeDrug = function (drug) {
        this.drug = drug;
        if (!drug) {
            return;
        }
        var defaults = drugFormDefaults[this.drug.form];
        if (defaults) {
            this.doseUnits = getDoseUnits(defaults.doseUnits);
            this.route = getRoute(defaults.route);
        }
    };

    this.calculateDurationUnit = function () {
        if (self.frequencyType === Bahmni.Clinical.Constants.dosingTypes.uniform && self.uniformDosingType.frequency != null) {
            var defaultDurationUnitMap = inputOptionsConfig.frequencyDefaultDurationUnitsMap || [];

            defaultDurationUnitMap.forEach(function (range) {
                var minFrequency = eval(range.minFrequency); // eslint-disable-line no-eval
                var maxFrequency = eval(range.maxFrequency); // eslint-disable-line no-eval
                if ((!minFrequency || minFrequency < getFrequencyPerDay()) &&
                    (!maxFrequency || getFrequencyPerDay() <= maxFrequency)) {
                    self.durationUnit = range.defaultDurationUnit;
                }
            });
        }
    };

    this.setFrequencyType = function (type) {
        self.frequencyType = type;
        if (self.frequencyType === Bahmni.Clinical.Constants.dosingTypes.variable) {
            if (self.uniformDosingType.doseUnits) {
                self.variableDosingType.doseUnits = self.uniformDosingType.doseUnits;
            }
            self.uniformDosingType = {};
        } else {
            if (self.variableDosingType.doseUnits) {
                self.uniformDosingType.doseUnits = self.variableDosingType.doseUnits;
            }
            self.variableDosingType = {};
        }
    };

    this.toggleFrequency = function () {
        if (this.isUniformFrequency) {
            self.frequencyType = Bahmni.Clinical.Constants.dosingTypes.variable;
            self.setFrequencyType(self.frequencyType);
            this.isUniformFrequency = false;
        } else {
            self.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
            self.setFrequencyType(self.frequencyType);
            this.isUniformFrequency = true;
        }
    };

    this.toggleExtraInfo = function () {
        this.showExtraInfo = !this.showExtraInfo;
    };

    this.isCurrentDosingTypeEmpty = function () {
        var dosingType = getDosingType();
        return _.every(dosingType, function (element) { return !element; });
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

    this.setQuantityUnitEnteredManually = function () {
        self.quantityUnitEnteredManually = true;
    };

    this.calculateDurationInDays = function () {
        var durationUnitFromConfig = _.find(durationUnits, function (unit) {
            return unit.name === self.durationUnit;
        });
        self.durationInDays = self.duration ? self.duration * (durationUnitFromConfig && durationUnitFromConfig.factor || 1) : Number.NaN;
    };

    var quantityUnitsFrom = function (doseUnit) {
        return doseUnit;
    };

    var modifyForReverseSyncIfRequired = function (drugOrder) {
        if (drugOrder.reverseSynced) {
            drugOrder.uniformDosingType = {};
            drugOrder.quantity = undefined;
            drugOrder.quantityUnit = undefined;
            drugOrder.doseUnits = undefined;

            drugOrder.changeDrug(drugOrder.drug);
        }
    };

    var setDurationUnitsBasedOnFrequency = function () {
        if (inputOptionsConfig.autopopulateDurationBasedOnFrequency != undefined) {
            inputOptionsConfig.autopopulateDurationBasedOnFrequency.forEach(function (frequency) {
                if (frequency.frequencyName === self.uniformDosingType.frequency) {
                    self.duration = frequency.duration;
                    durationUnits.forEach(function (durationUnit) {
                        if (durationUnit.name === frequency.durationUnit) {
                            self.durationUnit = durationUnit.name;
                        }
                    });
                }
            });
        }
    };

    this.calculateQuantityAndUnit = function () {
        self.calculateDurationInDays();
        setDurationUnitsBasedOnFrequency();
        if (!self.quantityEnteredManually && !self.quantityEnteredViaEdit) {
            if (self.frequencyType === Bahmni.Clinical.Constants.dosingTypes.uniform) {
                var mantissa = self.uniformDosingType.doseFraction ? self.uniformDosingType.doseFraction.value : 0;
                var dose = self.uniformDosingType.dose ? self.uniformDosingType.dose : 0;
                self.quantity = (dose + mantissa) * (self.uniformDosingType.frequency ? getFrequencyPerDay() : 0) * self.durationInDays;
            } else if (self.frequencyType === Bahmni.Clinical.Constants.dosingTypes.variable) {
                var dose = self.variableDosingType;
                self.quantity = (dose.morningDose + dose.afternoonDose + dose.eveningDose) * self.durationInDays;
            }

            if (self.quantity % 1 !== 0) {
                self.quantity = self.quantity - (self.quantity % 1) + 1;
            }
        }
        if ((self.quantityEnteredViaEdit && self.quantityUnit) || self.quantityUnitEnteredManually) {
            self.quantityUnit = quantityUnitsFrom(self.quantityUnit);
        } else {
            self.quantityUnit = quantityUnitsFrom(self.doseUnits);
        }
        self.quantityEnteredViaEdit = false;
        self.quantityUnitEnteredViaEdit = false;
    };

    this.isStopped = function () {
        return !!self.dateStopped;
    };

    this.isScheduled = function () {
        return !self.isDiscontinuedOrStopped() && self.scheduledDate && self.scheduledDate > today();
    };

    this.isActive = function () {
        return !self.isDiscontinuedOrStopped() && (!self.effectiveStopDate || self.effectiveStopDate >= today());
    };

    this.discontinued = function () {
        return self.action === Bahmni.Clinical.Constants.orderActions.discontinue;
    };

    this.isDiscontinuedOrStopped = function () {
        return (self.isStopped() || self.discontinued()) && self.isMarkedForDiscontinue === undefined;
    };

    var defaultQuantityUnit = function (drugOrder) {
        if (!drugOrder.quantityUnit) {
            drugOrder.quantityUnit = "Unit(s)";
        }
    };

    this.getSpanDetails = function () {
        var valueString = '- ';
        _.forEach(this.span, function (value, key) {
            if (value) {
                valueString += value + " " + key + " + ";
            }
        });
        return valueString.substring(0, valueString.length - 3);
    };

    this.getDurationAndDurationUnits = function () {
        return self.duration ? self.duration + " " + self.durationUnit : "";
    };

    this.refill = function (existingOrderStopDate) {
        var newDrugOrder = new Bahmni.Clinical.DrugOrderViewModel(config, this);
        newDrugOrder.previousOrderUuid = undefined;
        newDrugOrder.action = Bahmni.Clinical.Constants.orderActions.new;
        newDrugOrder.uuid = undefined;
        newDrugOrder.dateActivated = undefined;
        var oldEffectiveStopDate = existingOrderStopDate ? new Date(existingOrderStopDate) : new Date(self.effectiveStopDate);
        newDrugOrder.effectiveStartDate = oldEffectiveStopDate >= today() ? DateUtil.addSeconds(oldEffectiveStopDate, 1) : today();
        newDrugOrder.calculateDurationInDays();
        newDrugOrder.effectiveStopDate = DateUtil.addDays(DateUtil.parse(newDrugOrder.effectiveStartDate), newDrugOrder.durationInDays);
        modifyForReverseSyncIfRequired(newDrugOrder);
        defaultQuantityUnit(newDrugOrder);
        newDrugOrder.orderReasonText = null;
        newDrugOrder.orderReasonConcept = null;
        newDrugOrder.orderSetUuid = self.orderSetUuid;
        newDrugOrder.orderGroupUuid = undefined;
        newDrugOrder.isNewOrderSet = false;
        return newDrugOrder;
    };

    this.revise = function () {
        var newDrugOrder = new Bahmni.Clinical.DrugOrderViewModel(config, this);

        newDrugOrder.previousOrderUuid = self.uuid;
        self.calculateDurationInDays();
        newDrugOrder.previousOrderDurationInDays = self.durationInDays;
        newDrugOrder.action = Bahmni.Clinical.Constants.orderActions.revise;
        newDrugOrder.uuid = undefined;
        newDrugOrder.dateActivated = undefined;
        newDrugOrder.drugNameDisplay = constructDrugNameDisplay(self.drug) || self.drugNonCoded || self.concept.name;

        // this field is just a flag that you turn on when revising the first time. It is turned off at the first
        // call of calculateQuantityAndUnit(). Bad code. Needs change. // I agree.
        newDrugOrder.quantityEnteredViaEdit = true;
        newDrugOrder.isBeingEdited = true;

        newDrugOrder.orderSetUuid = self.orderSetUuid;
        newDrugOrder.orderGroupUuid = self.orderGroupUuid;
        newDrugOrder.isNewOrderSet = false;

        if (newDrugOrder.effectiveStartDate <= today()) {
            newDrugOrder.effectiveStartDate = today();
        }

        modifyForReverseSyncIfRequired(newDrugOrder);
        defaultQuantityUnit(newDrugOrder);

        return newDrugOrder;
    };

    this.cloneForEdit = function (index, config) {
        var editableDrugOrder = new Bahmni.Clinical.DrugOrderViewModel(config, this);
        editableDrugOrder.currentIndex = index;
        editableDrugOrder.isBeingEdited = true;
        editableDrugOrder.quantityEnteredViaEdit = true;
        editableDrugOrder.orderSetUuid = self.orderSetUuid;
        editableDrugOrder.orderGroupUuid = self.orderGroupUuid;
        defaultQuantityUnit(editableDrugOrder);
        if (editableDrugOrder.frequencyType === Bahmni.Clinical.Constants.dosingTypes.variable) {
            editableDrugOrder.isUniformFrequency = false;
        }
        return editableDrugOrder;
    };

    this.isDoseMandatory = function () {
        inputOptionsConfig.routesToMakeDoseSectionNonMandatory = inputOptionsConfig.routesToMakeDoseSectionNonMandatory || [];
        return (inputOptionsConfig.routesToMakeDoseSectionNonMandatory.indexOf(this.route) === -1) &&
            (!_.isEmpty(self.uniformDosingType.doseUnits) || !_.isEmpty(self.variableDosingType.doseUnits));
    };

    this.isMantissaRequired = function () {
        return (this.isDoseMandatory() && this.isUniformFrequency && !this.uniformDosingType.dose);
    };

    this.isUniformDoseUnitRequired = function () {
        return (this.uniformDosingType.dose) ||
               (this.uniformDosingType.doseFraction) ||
               (this.isUniformFrequency && this.isDoseMandatory());
    };

    this.isUniformDoseRequired = function () {
        return this.isUniformFrequency &&
               this.isDoseMandatory() &&
               !this.uniformDosingType.doseFraction;
    };

    this.isVariableDoseRequired = function () {
        if (!this.isUniformFrequency) {
            if (this.isDoseMandatory()) {
                return true;
            } else {
                return (self.variableDosingType.morningDose ||
                    self.variableDosingType.afternoonDose ||
                    self.variableDosingType.eveningDose
                );
            }
        }
    };
    this.loadOrderAttributes = function (drugOrderResponse) {
        if (config && config.orderAttributes) {
            var findOrderAttribute = function (drugOrder, orderAttribute) {
                return _.find(drugOrder.orderAttributes, function (drugOrderAttribute) {
                    return orderAttribute.name === drugOrderAttribute.name;
                });
            };

            config.orderAttributes.forEach(function (orderAttributeInConfig) {
                var orderAttributeInDrugOrder = findOrderAttribute(drugOrderResponse, orderAttributeInConfig);
                var existingOrderAttribute = findOrderAttribute(self, orderAttributeInConfig);
                var orderAttribute = existingOrderAttribute || {};
                orderAttribute.name = orderAttributeInConfig.name;
                orderAttribute.shortName = orderAttributeInConfig.shortName;
                orderAttribute.conceptUuid = orderAttributeInConfig.uuid;
                orderAttribute.value = orderAttributeInDrugOrder && orderAttributeInDrugOrder.value === "true";
                orderAttribute.obsUuid = orderAttributeInDrugOrder ? orderAttributeInDrugOrder.obsUuid : undefined;
                orderAttribute.encounterUuid = orderAttributeInDrugOrder ? orderAttributeInDrugOrder.encounterUuid : undefined;
                if (!existingOrderAttribute) {
                    self.orderAttributes.push(orderAttribute);
                }
            });
        }
    };

    this.getOrderAttributesAsObs = function () {
        if (self.orderAttributes) {
            var orderAttributesWithValues = self.orderAttributes.filter(function (orderAttribute) { return orderAttribute.value || orderAttribute.obsUuid; });
            return orderAttributesWithValues.map(function (orderAttribute) {
                return {
                    uuid: orderAttribute.obsUuid,
                    value: orderAttribute.value ? true : false,
                    orderUuid: self.uuid,
                    concept: {uuid: orderAttribute.conceptUuid }
                };
            });
        }
    };

    this.loadOrderAttributes({});

    var calculateUniformDose = function () {
        var mantissa = self.uniformDosingType.doseFraction ? self.uniformDosingType.doseFraction.value : 0;
        var dose = self.uniformDosingType.dose ? self.uniformDosingType.dose : 0;
        self.uniformDosingType.doseFraction = void 0;
        return !dose && !mantissa ? null : dose + mantissa;
    };

    this.setUniformDoseFraction = function () {
        if (self.frequencyType === "uniform") {
            self.uniformDosingType.dose = calculateUniformDose();
        }
    };

    this.getDoseAndUnits = function () {
        var variableDosingType = self.variableDosingType;
        var variableDosingString = addDelimiter(morphToMixedFraction(variableDosingType.morningDose || 0) + "-" + morphToMixedFraction(variableDosingType.afternoonDose || 0) + "-" + morphToMixedFraction(variableDosingType.eveningDose || 0), " ");

        if (self.frequencyType === Bahmni.Clinical.Constants.dosingTypes.uniform) {
            var value = morphToMixedFraction(calculateUniformDose());
            return value ? value + " " + blankIfFalsy(self.doseUnits) : "";
        } else {
            return (variableDosingString + blankIfFalsy(self.doseUnits)).trim();
        }
    };

    this.getFrequency = function () {
        return self.frequencyType === Bahmni.Clinical.Constants.dosingTypes.uniform ? blankIfFalsy(self.uniformDosingType.frequency) : "";
    };

    this.calculateEffectiveStopDate = function () {
        if (this.durationInDays) {
            this.effectiveStopDate = DateUtil
                .addDays(
                DateUtil.parse(this.effectiveStartDate), this.durationInDays);
        }
    };
};

Bahmni.Clinical.DrugOrderViewModel.createFromContract = function (drugOrderResponse, config) {
    var DateUtil = Bahmni.Common.Util.DateUtil;
    drugOrderResponse.dosingInstructions = drugOrderResponse.dosingInstructions || {};
    var administrationInstructions = JSON.parse(drugOrderResponse.dosingInstructions.administrationInstructions || "{}");
    var viewModel = new Bahmni.Clinical.DrugOrderViewModel(config);
    viewModel.asNeeded = !drugOrderResponse.dosingInstructions.asNeeded ? false : drugOrderResponse.dosingInstructions.asNeeded;
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
        };
    } else if (administrationInstructions.morningDose || administrationInstructions.afternoonDose || administrationInstructions.eveningDose) {
        viewModel.frequencyType = Bahmni.Clinical.Constants.dosingTypes.variable;
        viewModel.variableDosingType = {
            morningDose: administrationInstructions.morningDose,
            afternoonDose: administrationInstructions.afternoonDose,
            eveningDose: administrationInstructions.eveningDose,
            doseUnits: drugOrderResponse.dosingInstructions.doseUnits
        };
    } else {
        viewModel.frequencyType = Bahmni.Clinical.Constants.dosingTypes.uniform;
        viewModel.reverseSynced = true;
        viewModel.uniformDosingType = {
            dose: parseFloat(administrationInstructions.dose),
            doseUnits: administrationInstructions.doseUnits
        };
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
    viewModel.careSetting = drugOrderResponse.careSetting;
    viewModel.dateStopped = drugOrderResponse.dateStopped;
    viewModel.uuid = drugOrderResponse.uuid;
    viewModel.previousOrderUuid = drugOrderResponse.previousOrderUuid;
    viewModel.dateActivated = drugOrderResponse.dateActivated;
    viewModel.encounterUuid = drugOrderResponse.encounterUuid;
    if (drugOrderResponse.orderReasonConcept) {
        viewModel.orderReasonConcept = drugOrderResponse.orderReasonConcept;
    }
    viewModel.orderReasonText = drugOrderResponse.orderReasonText;
    viewModel.orderNumber = drugOrderResponse.orderNumber && parseInt(drugOrderResponse.orderNumber.replace("ORD-", ""));
    viewModel.drugNonCoded = drugOrderResponse.drugNonCoded;
    viewModel.isNonCodedDrug = drugOrderResponse.drugNonCoded ? true : false;
    viewModel.drugNameDisplay = viewModel.drugNonCoded || constructDrugNameDisplayWithConcept(viewModel.drug, viewModel.concept) || _.get(viewModel, 'concept.name');
    if (config) {
        viewModel.loadOrderAttributes(drugOrderResponse);
    } else {
        viewModel.orderAttributes = drugOrderResponse.orderAttributes;
    }
    viewModel.visit = drugOrderResponse.visit;
    viewModel.voided = drugOrderResponse.voided;
    viewModel.dosage = viewModel.getDoseAndUnits();
    viewModel.isDrugRetired = drugOrderResponse.retired;
    if (drugOrderResponse.orderGroup) {
        viewModel.orderGroupUuid = drugOrderResponse.orderGroup.uuid;
        viewModel.orderSetUuid = drugOrderResponse.orderGroup.orderSet.uuid;
        viewModel.sortWeight = drugOrderResponse.sortWeight;
    }
    return viewModel;
};
