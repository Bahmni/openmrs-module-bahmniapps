'use strict';

Bahmni.Clinical.OrdersUtil = (function () {
    var DateUtil = Bahmni.Common.Util.DateUtil;

    var containsOlderOrder = function (orders, orderToCheck) {
        return orders.some(function (order) {
            return order.concept.name === orderToCheck.concept.name && DateUtil.parse(order.dateCreated) > DateUtil.parse(orderToCheck.dateCreated);
        });
    };

    var OrdersUtil = {
        latest: function (orders) {
            var clonedOrders = _.clone(orders);
            clonedOrders.forEach(function (order) {
                if (containsOlderOrder(clonedOrders, order)) {
                    _.pull(clonedOrders, order);
                }
            });
            return clonedOrders;
        }
    }

    return OrdersUtil;
})();


