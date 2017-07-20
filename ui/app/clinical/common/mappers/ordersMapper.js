'use strict';

Bahmni.Clinical.OrdersMapper = function (nameToSort) {
    this.nameToSort = nameToSort;
};

Bahmni.Clinical.OrdersMapper.prototype.group = function (orders, groupingParameter) {
    var getGroupingFunction = function (groupingParameter) {
        if (groupingParameter === 'date') {
            return function (order) {
                if (order.startDate) {
                    return Bahmni.Common.Util.DateUtil.getDate(order.startDate);
                } else {
                    return Bahmni.Common.Util.DateUtil.getDate(order.effectiveStartDate);
                }
            };
        }
        return function (order) {
            return order[groupingParameter];
        };
    };

    groupingParameter = groupingParameter || 'date';
    var groupingFunction = getGroupingFunction(groupingParameter);
    var groupedOrders = new Bahmni.Clinical.ResultGrouper().group(orders, groupingFunction, 'orders', groupingParameter);
    if (groupingParameter === 'date') {
        return groupedOrders.map(function (order) {
            return {
                date: Bahmni.Common.Util.DateUtil.parse(order.date),
                orders: _.sortBy(order.orders, 'orderNumber')
            };
        }).sort(function (first, second) { return first.date < second.date ? 1 : -1; });
    }
    return groupedOrders.map(function (order) {
        var returnObj = {};
        returnObj[groupingParameter] = order[groupingParameter];
        returnObj['orders'] = order.orders;
        return returnObj;
    });
};

Bahmni.Clinical.OrdersMapper.prototype.create = function (encounterTransactions, ordersName, filterFunction, groupingParameter, allTestAndPanels) {
    filterFunction = filterFunction || function () { return true; };
    var filteredOrders = this.map(encounterTransactions, ordersName, allTestAndPanels).filter(filterFunction);
    return this.group(filteredOrders, groupingParameter);
};

Bahmni.Clinical.OrdersMapper.prototype.map = function (encounterTransactions, ordersName, allTestAndPanels) {
    var allTestsPanelsConcept = new Bahmni.Clinical.ConceptWeightBasedSorter(allTestAndPanels);
    var orderObservationsMapper = new Bahmni.Clinical.OrderObservationsMapper();
    var setOrderProvider = function (encounter) {
        encounter[ordersName].forEach(function (order) {
            order.provider = encounter.providers[0];
            order.accessionUuid = encounter.encounterUuid;
            order.encounterUuid = encounter.encounterUuid;
            order.visitUuid = encounter.visitUuid;
        });
    };
    encounterTransactions.forEach(setOrderProvider);
    var flattenedOrders = _(encounterTransactions).map(ordersName).flatten().value();
    var ordersWithoutVoidedOrders = flattenedOrders.filter(function (order) {
        return !order.voided;
    });

    var allObservations = _(encounterTransactions).map('observations').flatten().value();

    orderObservationsMapper.map(allObservations, ordersWithoutVoidedOrders);
    var sortedOrders = allTestsPanelsConcept.sort(ordersWithoutVoidedOrders, this.nameToSort);
    sortedOrders.forEach(function (order) {
        order.observations.forEach(function (obs) {
            obs.groupMembers = allTestsPanelsConcept.sort(obs.groupMembers);
        });
    });
    return sortedOrders;
};
