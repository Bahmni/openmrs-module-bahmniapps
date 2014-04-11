'use strict';

Bahmni.Clinical.OrderGroup = function(){};

Bahmni.Clinical.OrderGroup.prototype.group = function(orders) {
    var groupByDate = function(order) { return order.dateCreated.substring(0, 10); };
    var groupedOrders = new Bahmni.Clinical.ResultGrouper().group(orders, groupByDate, 'orders', 'date');
    return groupedOrders.map(function(order) {
        return {
            date: new Date(order.date),
            orders: order.orders
        };
    }).sort(function(first, second) { return first.date < second.date ? 1: -1; });
};

Bahmni.Clinical.OrderGroup.prototype.create = function (encounterTransactions, ordersName, filterFunction) {
    var filteredOrders = this.flatten(encounterTransactions, ordersName, filterFunction);
    return this.group(filteredOrders);
};

Bahmni.Clinical.OrderGroup.prototype.flatten = function (encounterTransactions, ordersName, filterFunction) {
    filterFunction = filterFunction || function(){return true;}
    var setOrderProvider = function (encounter) { 
        encounter[ordersName].forEach(function(order) { order.provider = encounter.providers[0]; }); 
    }
    encounterTransactions.forEach(setOrderProvider);
    var flattenedOrders = encounterTransactions.reduce(function(orders, encounter) { return orders.concat(encounter[ordersName]) }, []);
    return flattenedOrders.filter(filterFunction);
};