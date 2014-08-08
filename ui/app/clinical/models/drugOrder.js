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
            return JSON.stringify({
                instructions: drugOrderData.instructions,
                notes: drugOrderData.notes || ""
            });
        }
        var drugOrder = new DrugOrder({
                careSetting: "Outpatient",
                drug: {name:drugOrderData.drugName},
                orderType: "Drug Order",
                dosingInstructions: {
                    dose: drugOrderData.dose,
                    doseUnits: drugOrderData.doseUnits,
                    route: drugOrderData.route,
                    frequency: drugOrderData.frequency,
                    asNeeded: drugOrderData.prn,
                    administrationInstructions: getAdministrationInstructions(drugOrderData),
                    quantity: drugOrderData.quantity,
                    quantityUnits: drugOrderData.quantityUnit,
                    numRefills: 0},
                duration: drugOrderData.duration,
                durationUnits: drugOrderData.durationUnit,
                scheduledDate: dateUtil.parse(drugOrderData.scheduledDate),
                endDate: dateUtil.addDays(dateUtil.parse(drugOrderData.scheduledDate), drugOrderData.duration),
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
            return this.dosingType === 'FREE_TEXT';
        }
    };

    return DrugOrder;
})();