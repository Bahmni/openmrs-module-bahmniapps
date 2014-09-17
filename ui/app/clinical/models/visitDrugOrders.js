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
        var nameToSort = function(drugOrder) {
            return drugOrder.drug.name;
        };
        var drugOrders = new Bahmni.Clinical.OrdersMapper(nameToSort).map(encounterTransactions, 'drugOrders').filter(function (order) {
            return !order.voided
        });
        var prescribedDrugOrders = [];
        drugOrders.forEach(function(drugOrder){
            prescribedDrugOrders.push(Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder))
        });
        var ipdOrders = null;
        if (admissionDate) {
            ipdOrders = Bahmni.Clinical.DrugSchedule.create(admissionDate, dischargeDate, prescribedDrugOrders);
        }
        var orderGroup = new Bahmni.Clinical.OrdersMapper().group(prescribedDrugOrders, 'date');
        return new this(prescribedDrugOrders, ipdOrders, orderGroup);
    };


    return VisitDrugOrder;
})();