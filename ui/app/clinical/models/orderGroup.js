'use strict';

Bahmni.Clinical.OrderGroup = function(){};

function getGroupingFunction(groupingParameter) {
    var groupingFunction;
    if (groupingParameter == 'date') {
        groupingFunction = function (order) {
            return order.dateCreated.substring(0, 10);
        };
    } else {
        groupingFunction = function (order) {
            return order.accessionUuid;
        }
    }
    return groupingFunction;
}

Bahmni.Clinical.OrderGroup.prototype.group = function(orders, groupingParameter) {
    groupingParameter = groupingParameter || 'date';
    var groupingFunction = getGroupingFunction(groupingParameter);
    var groupedOrders = new Bahmni.Clinical.ResultGrouper().group(orders, groupingFunction, 'orders', groupingParameter);
    if(groupingParameter == 'date'){
        return groupedOrders.map(function(order) {
            return {
                date: new Date(order.date),
                orders: order.orders
            };
        }).sort(function(first, second) { return first.date < second.date ? 1: -1; });
    }
    return groupedOrders.map(function (order) {
        return {
            accessionUuid:order.accessionUuid,
            orders:order.orders
        }
    });
};

Bahmni.Clinical.OrderGroup.prototype.create = function (encounterTransactions, ordersName, filterFunction, groupingParameter) {
    var filteredOrders = this.flatten(encounterTransactions, ordersName, filterFunction);
    var group = this.group(filteredOrders, groupingParameter);
    return group;
};

Bahmni.Clinical.OrderGroup.prototype.flatten = function (encounterTransactions, ordersName, filterFunction) {
    filterFunction = filterFunction || function(){return true;}
    var setOrderProvider = function (encounter) { 
        encounter[ordersName].forEach(function(order) {
            order.provider = encounter.providers[0];
            order.accessionUuid = encounter.encounterUuid;
        });
    };
    encounterTransactions.forEach(setOrderProvider);
    var flattenedOrders = encounterTransactions.reduce(function(orders, encounter) { return orders.concat(encounter[ordersName]) }, []);
    return flattenedOrders.filter(filterFunction);
};