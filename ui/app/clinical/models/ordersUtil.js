'use strict';

Bahmni.Clinical.OrdersUtil = (function () {
    var contains = function (order, orderList) {
        return orderList.some(function (orderInList) {
            return orderInList.concept.name === order.concept.name;
        });
    };

    var OrdersUtil = {
        //The logic except comparer can be moved to ArrayUtil
        unique: function (orders) {
            var uniqueOrders = [];
            orders.forEach(function (order) {
                if (!contains(order, uniqueOrders)) {
                    uniqueOrders.push(order);
                }
            });
            return uniqueOrders;
        }
    }

    return OrdersUtil;
})();


