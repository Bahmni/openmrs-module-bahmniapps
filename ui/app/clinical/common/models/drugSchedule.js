'use strict';
(function () {
    var DateUtil = Bahmni.Common.Util.DateUtil;
    var Drug = function (name, orders) {
        this.name = name;
        this.orders = orders || [];
    };

    Bahmni.Clinical.DrugSchedule = function (fromDate, toDate, drugOrders) {
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.drugOrders = drugOrders;
        this.days = this.getDays();
        this.drugs = this.getDrugs();
    };

    Bahmni.Clinical.DrugSchedule.prototype = {
        getDays: function () {
            return DateUtil.createDays(this.fromDate, this.toDate);
        },

        getDrugs: function () {
            var drugOrders = this.drugOrders.map(Bahmni.Clinical.DrugOrder.create);
            var allOrderedDrugs = [];
            _.each(drugOrders, function (order) {
                var drugAlreadyOrdered = _.find(allOrderedDrugs, order.drugNonCoded ? {
                    name: order.drugNonCoded
                } : {
                    name: order.drug && order.drug.name || order.concept.name
                });

                if (!drugAlreadyOrdered) {
                    drugAlreadyOrdered = new Drug(order.drugNonCoded ? order.drugNonCoded : order.drug && order.drug.name || order.concept.name);
                    allOrderedDrugs.push(drugAlreadyOrdered);
                }
                drugAlreadyOrdered.orders.push(order);
            });
            return allOrderedDrugs;
        },

        hasDrugOrders: function () {
            return this.drugOrders.length > 0;
        }
    };

    Bahmni.Clinical.DrugSchedule.create = function (fromDate, toDate, drugOrders) {
        var drugOrdersDuringIpd = drugOrders.filter(function (drugOrder) {
            var orderStartDate = DateUtil.parse(drugOrder.effectiveStartDate);
            var orderStopDate = DateUtil.parse(drugOrder.effectiveStopDate);
            return orderStartDate < toDate && orderStopDate >= fromDate;
        });
        return new this(fromDate, toDate, drugOrdersDuringIpd);
    };

    Drug.prototype = {
        isActiveOnDate: function (date) {
            return this.orders.some(function (order) {
                return order.isActiveOnDate(date);
            });
        },

        getStatusOnDate: function (date) {
            var activeDrugOrders = _.filter(this.orders, function (order) {
                return order.isActiveOnDate(date);
            });
            if (activeDrugOrders.length === 0) {
                return 'inactive';
            }
            if (_.every(activeDrugOrders, function (order) {
                return order.getStatusOnDate(date) === 'stopped';
            })) {
                return 'stopped';
            }
            return 'active';
        },

        isActive: function () {
            return this.orders.some(function (order) {
                return order.isActive();
            });
        }
    };

    Bahmni.Clinical.DrugSchedule.Drug = Drug;
})();
