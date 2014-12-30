'use strict';

Bahmni.Clinical.LabOrder = (function () {
    var LabOrder = function (data) {
        angular.extend(this, data);
        this.orderDate = data.dateCreated;
    };

    var createOrderable = function (order) {
        if (order.concept.set) {
            return Bahmni.Clinical.Panel.create(order.concept, order.observations);
        } else {
            if (order.observations.length === 0) return new Bahmni.Clinical.Test({concept: order.concept});
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
    };

    LabOrder.create = function (order) {
        return new LabOrder({concept: order.concept, orderable: createOrderable(order), dateCreated: order.dateCreated, accessionUuid: order.accessionUuid});
    };

    return LabOrder;
})();