'use strict';

Bahmni.Clinical.OrderGroup = function(){};

Bahmni.Clinical.OrderGroup.prototype.convert = function(listOfOrders) {
    var groupingFunction = function(order) {
        return order.dateCreated.substring(0, 10);
    };
    var groupedOrders = new Bahmni.Clinical.ResultGrouper().group(listOfOrders, groupingFunction, 'orders', 'date');
    return groupedOrders.map(function(order) {
        return {
            date: new Date(order.date),
            orders: order.orders
        };
    }).sort(function(first, second) {
            return first.date < second.date ? -1: 1;
        });
};

Bahmni.Clinical.OrderGroup.prototype.create = function (encounterTransactions, item, filterFunction) {
    filterFunction = filterFunction || function(){return true;}
    var flatten = function(transactions) {
        return transactions.reduce(function (result, transaction) {
            var providers = transaction.providers;
            transaction[item].forEach(function(order) {
                 order.provider = providers.length > 0 ? providers[0] : null;
            });
            return result.concat(transaction[item]);
        }, []);
    };
    var flattenedOrders = flatten(encounterTransactions).filter(filterFunction);
    return this.convert(flattenedOrders);
};