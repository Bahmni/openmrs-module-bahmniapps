'use strict';

Bahmni.Clinical.LabOrder = (function () {
    var LabOrder = function (order, orderable) {
        angular.extend(this, order);
        this.orderable = orderable;
        this.orderDate = order.dateCreated;
    };

    var createOrderable = function (order) {
        if (order.observations.length === 0) return new Bahmni.Clinical.Test({concept: order.concept});
        if (order.concept.set) {
            return Bahmni.Clinical.Panel.create(order.concept, order.observations);
        } else {
            return Bahmni.Clinical.Test.create(order.observations[0]);
        }
    };

    LabOrder.prototype = {
        isPanel: function() {
            return this.concept.set;
        },
        getOrderableType: function() {
            return this.concept.set ? "Panel" : "Test" ;
        },
        getDisplayList: function () {
            var self = this;
            var displayList = this.orderable.getDisplayList();
            displayList.forEach(function(item) { item.orderDate = self.orderDate; });
            return displayList;
        }
    }

    LabOrder.create = function (order) {
        return new LabOrder(order, createOrderable(order));
    };

    return LabOrder;
})();