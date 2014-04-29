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
            var clonedOrders = Bahmni.Common.Util.ArrayUtil.clone(orders);
            clonedOrders.forEach(function (order) {
                if (containsOlderOrder(clonedOrders, order)) {
                    Bahmni.Common.Util.ArrayUtil.removeItem(clonedOrders, order);
                }
            });
            return clonedOrders;
        }
    }

    return OrdersUtil;
})();


