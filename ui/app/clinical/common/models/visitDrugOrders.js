'use strict';

Bahmni.Clinical.VisitDrugOrder = (function () {
    var VisitDrugOrder = function (orders, ipdOrders, orderGroup) {
        this.orders = orders;
        this.ipdDrugSchedule = ipdOrders;
        this.orderGroup = orderGroup;
    };

    VisitDrugOrder.prototype = {
        hasIPDDrugSchedule: function () {
            return this.ipdDrugSchedule && this.ipdDrugSchedule.hasDrugOrders();
        },
        getDrugOrderGroups: function () {
            return this.orderGroup;
        },
        getIPDDrugs: function () {
            return this.ipdDrugSchedule.drugs;
        }
    };

    VisitDrugOrder.create = function (encounterTransactions, admissionDate, dischargeDate) {
        var nameToSort = function (drugOrder) {
            return drugOrder.drugNonCoded ? drugOrder.drugNonCoded : drugOrder.drug.name;
        };

        var drugOrders = new Bahmni.Clinical.OrdersMapper(nameToSort).map(encounterTransactions, 'drugOrders');

        var prescribedDrugOrders = _.map(drugOrders, Bahmni.Clinical.DrugOrderViewModel.createFromContract);

        return this.createFromDrugOrders(prescribedDrugOrders, admissionDate, dischargeDate);
    };

    VisitDrugOrder.createFromDrugOrders = function (drugOrders, admissionDate, dischargeDate) {
        drugOrders = _.filter(drugOrders, function (drugOrder) {
            return !drugOrder.voided && drugOrder.action !== Bahmni.Clinical.Constants.orderActions.discontinue;
        });

        drugOrders = _.filter(drugOrders, function (drugOrder) {
            return !_.some(drugOrders, function (otherDrugOrder) {
                return otherDrugOrder.action === Bahmni.Clinical.Constants.orderActions.revise && otherDrugOrder.encounterUuid === drugOrder.encounterUuid && otherDrugOrder.previousOrderUuid === drugOrder.uuid;
            });
        });

        var ipdOrders = null;
        if (admissionDate) {
            ipdOrders = Bahmni.Clinical.DrugSchedule.create(admissionDate, dischargeDate, drugOrders);
        }
        var orderGroup = new Bahmni.Clinical.OrdersMapper().group(drugOrders, 'date');
        return new this(drugOrders, ipdOrders, orderGroup);
    };

    return VisitDrugOrder;
})();
