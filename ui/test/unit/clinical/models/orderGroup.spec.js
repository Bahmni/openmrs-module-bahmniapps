'use strict';

describe('Order Group', function () {
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
        sampleTestOrder = function(){
            return{
                "uuid": "c71c52da-d446-4162-8d27-b9ece3c971a3",
                "voided": false,
                "voidReason": null,
                "instructions": null,
                "dateCreated": "2014-04-15T11:09:45.000+0530",
                "dateChanged": null,
                "orderTypeUuid": "a28516de-a2a1-11e3-af88-005056821db0",
                "concept": {
                    "uuid": "a55ac0bc-4059-4e92-9695-2b376f2ef80e",
                    "name": "Culture (Tissue)",
                    "set": false,
                    "dataType": "Text"
                }
            }
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
        },
        createTestOrder = function (testName, date) {
            var order = sampleTestOrder();
            order.dateCreated = date;
            order.concept.name = testName;
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

    it('should populate accessionUuid for testOrders from encounterTransaction', function () {
        var firstTestOrder = createTestOrder("culture(pus)", "2014-03-24T14:38:13.000+0530");
        var secondTestOrder = createTestOrder("culture(tissue)", "2014-03-24T14:38:13.000+0530");
        var thirdTestOrder = createTestOrder("platelet count", "2014-03-25T14:38:13.000+0530");
        var encounterUuid1 = "encounterUuid1";
        var encounterUuid2 = "encounterUuid2";
        var encounterTransactions = [
            {providers: [sampleProvider()], testOrders: [thirdTestOrder], encounterUuid: encounterUuid1},
            {providers: [sampleProvider()], testOrders: [firstTestOrder, secondTestOrder], encounterUuid: encounterUuid2}
        ];
        var orders = new Bahmni.Clinical.OrderGroup().create(encounterTransactions, 'testOrders', function () {
            return true;
        });
        expect(orders[0].orders[0].accessionUuid).toBe(encounterUuid1);
        expect(orders[1].orders[0].accessionUuid).toBe(encounterUuid2);
    });

    it('should group based on groupParameter',function(){
        var firstTestOrder = createTestOrder("culture(pus)", "2014-03-24T14:38:13.000+0530");
        var secondTestOrder = createTestOrder("culture(tissue)", "2014-03-24T14:38:13.000+0530");
        var thirdTestOrder = createTestOrder("platelet count", "2014-03-25T14:38:13.000+0530");
        var encounterUuid1 = "encounterUuid1";
        var encounterUuid2 = "encounterUuid2";
        var encounterTransactions = [
            {providers: [sampleProvider()], testOrders: [thirdTestOrder], encounterUuid: encounterUuid1},
            {providers: [sampleProvider()], testOrders: [firstTestOrder, secondTestOrder], encounterUuid: encounterUuid2}
        ];
        var filterFunction = function () {return true;};
        var orders = new Bahmni.Clinical.OrderGroup().create(encounterTransactions, 'testOrders', filterFunction, 'accessionUuid');
        expect(orders[0].accessionUuid).toBe(encounterUuid1);
        expect(orders[0].orders.length).toBe(1);
        expect(orders[1].accessionUuid).toBe(encounterUuid2);
        expect(orders[1].orders.length).toBe(2);
    })
});
