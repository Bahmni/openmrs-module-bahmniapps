'use strict';

Bahmni.Clinical.VisitDrugOrder = (function () {

    var VisitDrugOrder = function (orders, ipdOrders) {
        this.drugOrders = orders;
        this.ipdDrugSchedule = ipdOrders;
    };

    VisitDrugOrder.prototype = {
        hasIPDDrugSchedule: function () {
            return this.ipdDrugSchedule && this.ipdDrugSchedule.hasDrugOrders();
        },
        getDrugOrderGroups: function () {
            return new Bahmni.Clinical.OrdersMapper().group(this.drugOrders);
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
        return new this(drugOrders, ipdOrders);
    };


    return VisitDrugOrder;
})();