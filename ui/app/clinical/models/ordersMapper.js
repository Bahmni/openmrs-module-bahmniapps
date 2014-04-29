'use strict';

Bahmni.Clinical.OrdersMapper = function(){};

Bahmni.Clinical.OrdersMapper.prototype.group = function(orders, groupingParameter) {
    var getGroupingFunction = function (groupingParameter) {
        if (groupingParameter == 'date') {
            return function (order) {
                return order.dateCreated.substring(0, 10);
            };
        }
        return function (order) {
            return order[groupingParameter];
        }
    };

    groupingParameter = groupingParameter || 'date';
    var groupingFunction = getGroupingFunction(groupingParameter);
    var groupedOrders = new Bahmni.Clinical.ResultGrouper().group(orders, groupingFunction, 'orders', groupingParameter);
    if(groupingParameter === 'date'){
        return groupedOrders.map(function(order) {
            var sortedOrders = order.orders.sort(function(first, second) { first.dateCreated < second.dateCreated ? 1 : -1; });
            return {
                date: new Date(order.date),
                orders: sortedOrders
            };
        }).sort(function(first, second) { return first.date < second.date ? 1: -1; });
    }
    return groupedOrders.map(function (order) {
        var returnObj = {};
        returnObj[groupingParameter] = order[groupingParameter];
        returnObj['orders'] = order.orders;
        return returnObj;
    });
};

Bahmni.Clinical.OrdersMapper.prototype.create = function (encounterTransactions, ordersName, filterFunction, groupingParameter, allTestAndPanels) {
    filterFunction = filterFunction || function() {return true; };
    var filteredOrders = this.map(encounterTransactions, ordersName, allTestAndPanels).filter(filterFunction);
    return this.group(filteredOrders, groupingParameter);
};

Bahmni.Clinical.OrdersMapper.prototype.map = function (encounterTransactions, ordersName, allTestAndPanels) {
    var allTestsPanelsConcept = new Bahmni.Clinical.SortedConceptSet(allTestAndPanels);
    var orderObservationsMapper = new Bahmni.Clinical.OrderObservationsMapper();
    var setOrderProvider = function (encounter) {
        encounter[ordersName].forEach(function(order) {
            order.provider = encounter.providers[0];
            order.accessionUuid = encounter.encounterUuid;
            order.visitUuid = encounter.visitUuid;
        });
    };
    encounterTransactions.forEach(setOrderProvider);
    var flattenedOrders = Bahmni.Common.Util.ArrayUtil.flatten(encounterTransactions, ordersName);
    var allObservations = Bahmni.Common.Util.ArrayUtil.flatten(encounterTransactions, 'observations');
    orderObservationsMapper.map(allObservations, flattenedOrders);
    var sortedOrders = allTestsPanelsConcept.sort(flattenedOrders);
    sortedOrders.forEach(function(order) {
        order.observations.forEach(function(obs){
            obs.groupMembers = allTestsPanelsConcept.sort(obs.groupMembers);
        });
    });
    return  sortedOrders;
};