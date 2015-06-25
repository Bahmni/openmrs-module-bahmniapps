'use strict';

Bahmni.Clinical.Order = (function () {
	var Order = function (data) {
        angular.extend(this, data);
        this.dateCreated = data.dateCreated;
    };

    var getName = function (test) {
        var name = _.find(test.names, {conceptNameType: "SHORT"}) || _.find(test.names, {conceptNameType: "FULLY_SPECIFIED"});
        return name ? name.name : undefined;
    };

    Order.create = function (test) {
        var order = new Order({
        		uuid: undefined,
			    concept: {
                    uuid: test.uuid,
                    displayName: getName(test)
                },
			    voided: false,
            }
        );
        return order;
    };

    Order.revise = function(order){
      var revisedOrder = new Order({
          concept: order.concept,
          action: Bahmni.Clinical.Constants.orderActions.revise,
          previousOrderUuid: order.uuid,
          voided: false,
          commentToFulfiller: order.commentToFulfiller
      });
        return revisedOrder;
    };

    return Order;
})();