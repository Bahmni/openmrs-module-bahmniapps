'use strict';

describe('OrdersMapper', function () {
    var sampleOrder = function () {
            return {
                "numberPerDosage": 1,
                "prn": false,
                "drug": {
                    name: "Asprin 75mg"
                },
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
        createDrugOrder = function (drugName, createDate, startDate) {
            var order = sampleOrder();
            order.dateCreated = createDate;
            order.startDate = startDate;
            order.drug = {name:drugName};
            return order;
        },
        createOrder = function (testName, date, voided) {
            var order = sampleTestOrder();
            order.uuid = Bahmni.Tests.genUUID();
            order.dateCreated = date;
            order.startDate = date;
            order.concept.name = testName;
            if(voided)
                order.voided = voided;
            return order;
        };

    it('should create drugOrders from a list of encounterTransaction objects', function () {
        var firstOrder = createDrugOrder("aspirin", "2014-03-24T14:38:13.000+0530", "2014-03-30T14:38:13.000+0530");
        var secondOrder = createDrugOrder("cetrizine", "2014-03-24T14:38:13.000+0530", "2014-03-30T14:38:13.000+0530");
        var thirdOrder = createDrugOrder("calpol", "2014-03-25T14:38:13.000+0530", "2014-03-26T14:38:13.000+0530");
        var encounterTransactions = [
            {   providers: [], observations: [],
                drugOrders: [thirdOrder]},
            {   providers: [], observations: [],
                drugOrders: [firstOrder, secondOrder]}
        ];
        var orders = new Bahmni.Clinical.OrdersMapper().create(encounterTransactions, 'drugOrders');

        expect(orders.length).toBe(2);
        expect(orders[0].date).toEqual(moment("2014-03-30").toDate());
        expect(orders[1].date).toEqual(moment("2014-03-26").toDate());
        expect(orders[0].orders.length).toBe(2);
        expect(orders[1].orders.length).toBe(1);
    });

    it('should filter based on filter function', function () {
        var firstOrder = createDrugOrder("aspirin", "2014-03-24T14:38:13.000+0530");
        var secondOrder = createDrugOrder("cetrizine", "2014-03-24T14:38:13.000+0530");
        var thirdOrder = createDrugOrder("calpol", "2014-03-25T14:38:13.000+0530");
        var encounterTransactions = [
            {   providers: [], observations: [],
                drugOrders: [thirdOrder]},
            {   providers: [], observations: [],
                drugOrders: [firstOrder, secondOrder]}
        ];
        var orders = new Bahmni.Clinical.OrdersMapper().create(encounterTransactions, 'drugOrders', function () {
            return false;
        });
        expect(orders.length).toBe(0);
    });

    it('should populate provider from encounterTransaction', function () {
        var firstOrder = createDrugOrder("aspirin", "2014-03-24T14:38:13.000+0530", "2014-03-30T14:38:13.000+0530");
        var secondOrder = createDrugOrder("cetrizine", "2014-03-24T14:38:13.000+0530", "2014-03-30T14:38:13.000+0530");
        var thirdOrder = createDrugOrder("calpol", "2014-03-25T14:38:13.000+0530", "2014-03-30T14:38:13.000+0530");
        var encounterTransactions = [
            {providers: [sampleProvider()], drugOrders: [thirdOrder], observations: []},
            {   providers: [], observations: [],
                drugOrders: [firstOrder, secondOrder]}
        ];
        var orders = new Bahmni.Clinical.OrdersMapper().create(encounterTransactions, 'drugOrders', function () {
            return true;
        });
        expect(orders[0].orders[0].provider.name).toBe(sampleProvider().name);
    });

    it('should populate accessionUuid for orders from encounterTransaction', function () {
        var firstTestOrder = createOrder("culture(pus)", "2014-03-24T14:38:13.000+0530");
        var secondTestOrder = createOrder("culture(tissue)", "2014-03-24T14:38:13.000+0530");
        var thirdTestOrder = createOrder("platelet count", "2014-03-25T14:38:13.000+0530");
        var encounterUuid1 = "encounterUuid1";
        var encounterUuid2 = "encounterUuid2";
        var encounterTransactions = [
            {providers: [sampleProvider()], orders: [thirdTestOrder], encounterUuid: encounterUuid1, observations: []},
            {providers: [sampleProvider()], orders: [firstTestOrder, secondTestOrder], encounterUuid: encounterUuid2, observations: []}
        ];
        var orders = new Bahmni.Clinical.OrdersMapper().create(encounterTransactions, 'orders', function () {
            return true;
        });
        expect(orders[0].orders[0].accessionUuid).toBe(encounterUuid1);
        expect(orders[1].orders[0].accessionUuid).toBe(encounterUuid2);
    });


    it("should sort tests", function () {
        var firstTestOrder = createOrder("Test1", "2014-03-24T14:38:13.000+0530");
        var secondTestOrder = createOrder("Test2", "2014-03-24T14:38:13.000+0530");
        var thirdTestOrder = createOrder("Test3", "2014-03-25T14:38:13.000+0530");
        var allTestsAndPanelsConcept = {setMembers:[{name:{name:"Test2"}}, {name:{name:"Test1"}}]};
        var encounterTransactions = [
            {providers: [sampleProvider()], orders: [firstTestOrder, secondTestOrder], observations: []}
        ];

        var sortedOrders = new Bahmni.Clinical.OrdersMapper().map(encounterTransactions, 'orders', allTestsAndPanelsConcept);

        expect(sortedOrders[0].concept.name).toBe("Test2");
        expect(sortedOrders[1].concept.name).toBe("Test1");
    });

    it("should remove tests that are voided", function(){
        var firstTestOrder = createOrder("Test1", "2014-03-24T14:38:13.000+0530");
        var secondTestOrder = createOrder("Test2", "2014-03-24T14:38:13.000+0530", true);
        var thirdTestOrder = createOrder("Test3", "2014-03-25T14:38:13.000+0530");

        var allTestsAndPanelsConcept = {setMembers:[{name:{name:"Test2"}}, {name:{name:"Test3"}}, {name:{name:"Test1"}}]};
        var encounterTransactions = [
            {providers: [sampleProvider()], orders: [firstTestOrder, secondTestOrder, thirdTestOrder], observations: []}
        ];

        var sortedOrders = new Bahmni.Clinical.OrdersMapper().map(encounterTransactions, 'orders', allTestsAndPanelsConcept);

        expect(sortedOrders[0].concept.name).toBe("Test3");
        expect(sortedOrders[1].concept.name).toBe("Test1");
    })

    it("should sort tests under panel", function () {
        var panelOrder = createOrder("Panel1", "2014-03-25T14:38:13.000+0530");
        var allTestsAndPanelsConcept = {setMembers:[{name:{name:"Test2"}}, {name:{name:"Test1"}}]};
        var test1ResultObservation = {concept:{name:"Test1"}, value: 12, groupMembers: []};
        var test2ResultObservation = {concept:{name:"Test2"}, value: 17, groupMembers: []};
        var panelResultObservation = {concept:{name:"Panel1"}, groupMembers: [test1ResultObservation, test2ResultObservation], orderUuid: panelOrder.uuid};
        var encounterTransactions = [
            {providers: [sampleProvider()], orders: [panelOrder], observations:[panelResultObservation]}
        ];

        var sortedOrders = new Bahmni.Clinical.OrdersMapper().map(encounterTransactions, 'orders', allTestsAndPanelsConcept);

        expect(sortedOrders[0].concept.name).toBe("Panel1");
        expect(sortedOrders[0].observations[0].concept.name).toBe("Panel1");
        expect(sortedOrders[0].observations[0].groupMembers[0].concept.name).toBe("Test2");
        expect(sortedOrders[0].observations[0].groupMembers[1].concept.name).toBe("Test1");
    })
});
