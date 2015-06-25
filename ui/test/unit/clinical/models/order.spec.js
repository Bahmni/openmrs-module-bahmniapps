'use strict';

describe('Order', function () {
    var testWithShortName = {names: [{"conceptNameType": "SHORT", "name": "TestShortName"}, {"conceptNameType": "FULLY_SPECIFIED", "name": "FullySpecifiedName"}],  
                             uuid: "uuid"}
    var testWithoutShortName = {names: [{"conceptNameType": "FULLY_SPECIFIED", "name": "FullySpecifiedName"}]}

    it("should get short name as display name for test", function () {
        var order = Bahmni.Clinical.Order.create(testWithShortName);
        expect(order.concept.displayName).toBe("TestShortName");
    });

    it("should get fully specified name as display name for test", function () {
        var order = Bahmni.Clinical.Order.create(testWithoutShortName);
        expect(order.concept.displayName).toBe("FullySpecifiedName");
    });

    it("should create order", function () {
        var order = Bahmni.Clinical.Order.create(testWithShortName);
        expect(order.concept.displayName).toBe('TestShortName');
        expect(order.concept.uuid).toBe('uuid');
        expect(order.uuid).toBe(undefined);
    });

    it("should create a revised order", function () {
        var originalOrder = {
            concept : {},
            uuid:'uuid',
            commentToFulfiller:'notes'
        };
        var revisedOrder = Bahmni.Clinical.Order.revise(originalOrder);
        expect(revisedOrder.concept).toBe(originalOrder.concept);
        expect(revisedOrder.action).toBe(Bahmni.Clinical.Constants.orderActions.revise);
        expect(revisedOrder.previousOrderUuid).toBe(originalOrder.uuid);
        expect(revisedOrder.voided).toBe(false);
        expect(revisedOrder.commentToFulfiller).toBe(originalOrder.commentToFulfiller);
    });

});