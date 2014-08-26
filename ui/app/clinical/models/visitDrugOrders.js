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
        var drugOrders = new Bahmni.Clinical.OrdersMapper().map(encounterTransactions, 'drugOrders').filter(function (order) {
            return !order.voided
        });
        var ipdOrders = null;
        if (admissionDate) {
            ipdOrders = Bahmni.Clinical.DrugSchedule.create(admissionDate, dischargeDate, drugOrders);
        }
        var orderGroup = new Bahmni.Clinical.OrdersMapper().group(drugOrders);
        return new this(drugOrders, ipdOrders, orderGroup);
    };


    return VisitDrugOrder;
})();