'use strict';

describe('Order', function () {
    var newConcept = function () {
        return {
                "name": {
                    "name": "Asitic Fluid"
                },
                "uuid": "uuid"
            };
    };

    it("should create order", function () {
        var concept = newConcept();
        var order = Bahmni.Clinical.Order.create(concept);
        expect(order.concept.name).toBe('Asitic Fluid');
        expect(order.concept.uuid).toBe('uuid');
        expect(order.uuid).toBe(undefined);
    });

});