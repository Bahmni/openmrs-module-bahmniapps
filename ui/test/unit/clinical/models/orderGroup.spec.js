'use strict';

describe('Drug Order', function () {
    var sampleOrder = function () {
            return {
                "numberPerDosage": 1,
                "prn": false,
                "drugName": "Asprin 75mg",
                "drugUnits": null,
                "dosageInstruction": {
                    "uuid": "a29e8cdb-a2a1-11e3-af88-005056821db0",
                    "name": "AC",
                    "set": false,
                    "dataType": "Text"
                },
                "dosageFrequency": {
                    "uuid": "a297a6eb-a2a1-11e3-af88-005056821db0",
                    "name": "qD",
                    "set": false,
                    "dataType": "Text"
                },
                "startDate": "2014-03-24T14:38:15.000+0530",
                "dateCreated": "2014-03-24T14:38:13.000+0530",
                "endDate": "2014-04-04T14:38:15.000+0530",
                "uuid": "2e107fbb-a6f2-4320-bb6d-c62a7928bd11",
                "doseStrength": null,
                "dosageForm": "Tablet",
                "dateChanged": null,
                "notes": "notes for asprin. Spelling is wrong.",
                "concept": {
                    "uuid": "ada919e4-3fce-49f2-a7f0-b8d4f80b082e",
                    "name": "Acetylsalicylic Acid 75mg",
                    "set": false,
                    "dataType": "N/A"
                }
            };
        },
        sampleProvider = function () {
            return {
                "uuid": "35ba3170-cf80-4749-9672-b3b678c77b6a",
                "name": "superman"
            }
        },
        createOrder = function (drugName, date) {
            var order = sampleOrder();
            order.dateCreated = date;
            order.drugName = drugName;
            return order;
        };

    it('should create drugOrders from a list of encounterTransaction objects', function () {
        var firstOrder = createOrder("aspirin", "2014-03-24T14:38:13.000+0530");
        var secondOrder = createOrder("cetrizine", "2014-03-24T14:38:13.000+0530");
        var thirdOrder = createOrder("calpol", "2014-03-25T14:38:13.000+0530");
        var encounterTransaction = [
            {   providers: [],
                drugOrders: [thirdOrder]},
            {   providers: [],
                drugOrders: [firstOrder, secondOrder]}
        ];
        var orders = new Bahmni.Clinical.OrderGroup().create(encounterTransaction, 'drugOrders');
        expect(orders.length).toBe(2);
        expect(orders[0].date.toISOString().substring(0, 10)).toBe("2014-03-25");
        expect(orders[1].date.toISOString().substring(0, 10)).toBe("2014-03-24");
        expect(orders[0].orders.length).toBe(1);
        expect(orders[1].orders.length).toBe(2);
    });

    it('should filter based on filter function', function () {
        var firstOrder = createOrder("aspirin", "2014-03-24T14:38:13.000+0530");
        var secondOrder = createOrder("cetrizine", "2014-03-24T14:38:13.000+0530");
        var thirdOrder = createOrder("calpol", "2014-03-25T14:38:13.000+0530");
        var encounterTransaction = [
            {   providers: [],
                drugOrders: [thirdOrder]},
            {   providers: [],
                drugOrders: [firstOrder, secondOrder]}
        ];
        var orders = new Bahmni.Clinical.OrderGroup().create(encounterTransaction, 'drugOrders', function () {
            return false;
        });
        expect(orders.length).toBe(0);
    });

    it('should populate provider from encounterTransaction', function () {
        var firstOrder = createOrder("aspirin", "2014-03-24T14:38:13.000+0530");
        var secondOrder = createOrder("cetrizine", "2014-03-24T14:38:13.000+0530");
        var thirdOrder = createOrder("calpol", "2014-03-25T14:38:13.000+0530");
        var encounterTransaction = [
            {providers: [sampleProvider()], drugOrders: [thirdOrder]},
            {   providers: [],
                drugOrders: [firstOrder, secondOrder]}
        ];
        var orders = new Bahmni.Clinical.OrderGroup().create(encounterTransaction, 'drugOrders', function () {
            return true;
        });
        expect(orders[0].orders[0].provider.name).toBe(sampleProvider().name);
    });
});
