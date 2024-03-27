'use strict';

Bahmni.Clinical.DrugOrder = (function () {
    var DateUtil = Bahmni.Common.Util.DateUtil;

    var DrugOrder = function (drugOrderData) {
        angular.extend(this, drugOrderData);
    };

    DrugOrder.create = function (drugOrderData) {
        return new DrugOrder(drugOrderData);
    };

    DrugOrder.createFromUIObject = function (drugOrderData) {
        var dateUtil = Bahmni.Common.Util.DateUtil;
        var getDosingInstructions = function (drugOrderData) {
            var dosingInstructions = {};
            dosingInstructions.instructions = drugOrderData.instructions && drugOrderData.instructions;
            dosingInstructions.additionalInstructions = drugOrderData.additionalInstructions;
            if (drugOrderData.frequencyType === Bahmni.Clinical.Constants.dosingTypes.variable) {
                dosingInstructions.morningDose = drugOrderData.variableDosingType.morningDose;
                dosingInstructions.afternoonDose = drugOrderData.variableDosingType.afternoonDose;
                dosingInstructions.eveningDose = drugOrderData.variableDosingType.eveningDose;
            }
            return JSON.stringify(dosingInstructions);
        };

        var frequency = drugOrderData.isUniformDosingType() && !drugOrderData.isCurrentDosingTypeEmpty() && drugOrderData.uniformDosingType.frequency;

        var route = drugOrderData.route;

        var drugOrder = new DrugOrder({
            careSetting: drugOrderData.careSetting || "OUTPATIENT",
            drug: drugOrderData.drug,
            drugNonCoded: drugOrderData.drugNonCoded,
            orderType: "Drug Order",
            dosingInstructionType: Bahmni.Clinical.Constants.flexibleDosingInstructionsClass,
            dosingInstructions: {
                dose: drugOrderData.uniformDosingType.dose,
                doseUnits: drugOrderData.doseUnits,
                route: route,
                frequency: frequency,
                asNeeded: drugOrderData.asNeeded,
                administrationInstructions: getDosingInstructions(drugOrderData),
                quantity: drugOrderData.quantity,
                quantityUnits: drugOrderData.quantityUnit,
                numberOfRefills: 0
            },
            duration: drugOrderData.duration,
            durationUnits: drugOrderData.durationUnit,
            scheduledDate: dateUtil.parse(drugOrderData.scheduledDate),
            autoExpireDate: dateUtil.parse(drugOrderData.autoExpireDate),
            previousOrderUuid: drugOrderData.previousOrderUuid,
            action: drugOrderData.action,
            orderReasonConcept: drugOrderData.orderReasonConcept,
            orderReasonText: drugOrderData.orderReasonText,
            dateStopped: dateUtil.parse(drugOrderData.dateStopped),
            concept: drugOrderData.concept,
            sortWeight: drugOrderData.sortWeight,
            orderGroup: {
                uuid: drugOrderData.orderGroupUuid,
                orderSet: {
                    uuid: drugOrderData.orderSetUuid
                }
            }
        }
        );
        if (!drugOrder.dosingInstructions.quantityUnits) {
            drugOrder.dosingInstructions.quantityUnits = "Unit(s)";
        }
        return drugOrder;
    };

    DrugOrder.prototype = {
        isActiveOnDate: function (date) {
            return date >= DateUtil.getDate(this.effectiveStartDate) && date <= DateUtil.getDate(this.effectiveStopDate);
        },

        getStatusOnDate: function (date) {
            if (DateUtil.isSameDate(this.dateStopped, date)) {
                return 'stopped';
            }
            return this.isActiveOnDate(date) ? 'active' : 'inactive';
        },

        isActive: function () {
            return this.isActiveOnDate(DateUtil.today());
        }
    };

    return DrugOrder;
})();
