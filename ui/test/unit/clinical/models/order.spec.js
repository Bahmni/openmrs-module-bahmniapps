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

});