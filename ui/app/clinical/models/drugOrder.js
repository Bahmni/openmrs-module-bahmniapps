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
        var getAdministrationInstructions = function(drugOrderData) {
            var instructions = {
                instructions: drugOrderData.instructions,
                notes: drugOrderData.notes || ""
            };

            if (drugOrderData.frequencyType === 'variable') {
                instructions.morningDose = drugOrderData.variableDosingType.morningDose;
                instructions.afternoonDose = drugOrderData.variableDosingType.afternoonDose;
                instructions.eveningDose = drugOrderData.variableDosingType.eveningDose;
            }
            return JSON.stringify(instructions);
        }
        var doseUnits = drugOrderData.frequencyType === "uniform" ? drugOrderData.uniformDosingType.doseUnits : drugOrderData.variableDosingType.doseUnits;


        var drugOrder = new DrugOrder({
                careSetting: "Outpatient",
                drug: {name:drugOrderData.drugName},
                orderType: "Drug Order",
                dosingInstructions: {
                    dose: drugOrderData.uniformDosingType.dose,
                    doseUnits: doseUnits,
                    route: drugOrderData.route,
                    frequency: drugOrderData.uniformDosingType.frequency,
                    asNeeded: drugOrderData.prn,
                    administrationInstructions: getAdministrationInstructions(drugOrderData),
                    quantity: drugOrderData.quantity,
                    quantityUnits: drugOrderData.quantityUnit,
                    numRefills: 0},
                duration: drugOrderData.duration,
                durationUnits: drugOrderData.durationUnit,
                scheduledDate: dateUtil.parse(drugOrderData.scheduledDate),
                endDate: dateUtil.addDays(dateUtil.parse(drugOrderData.scheduledDate), drugOrderData.durationInDays),
                provider: drugOrderData.provider,
                action: drugOrderData.action
            }
        );
        return drugOrder;
    };

    DrugOrder.prototype = {
        isActiveOnDate: function (date) {
            return date >= DateUtil.getDate(this.startDate) && date <= DateUtil.getDate(this.endDate);
        },

        isActive: function () {
            return this.isActiveOnDate(DateUtil.today());
        },

        isFreeTextDosingType: function () {
            return this.dosingType === 'FreeTextDosingInstructions';
        }
    };

    return DrugOrder;
})();