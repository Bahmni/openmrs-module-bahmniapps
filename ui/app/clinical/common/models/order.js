'use strict';

Bahmni.Clinical.Order = (function () {
	var Order = function (data) {
        angular.extend(this, data);
        this.dateCreated = data.dateCreated;
    };

    Order.create = function (test) {
        var order = new Order({
        		uuid: undefined,
			    concept: {
                    uuid : test.uuid,
                    name : test.name.name
                },
			    voided: false,
            }
        );
        return order;
    };

    return Order;
})();