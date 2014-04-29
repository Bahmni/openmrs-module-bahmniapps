'use strict';

describe("SortedConceptSet", function () {

    var allTestsAndPanels = {
        setMembers: [
            {name: {name: "Test1"}},
            {name: {name: "Panel1"}},
            {name: {name: "Test2"}},
            {name: {name: "TestBelongsToPanel1"}},
            {name: {name: "TestBelongsToPanel2"}}
        ]
    };

    it("should sort by sortWeight of the test/panel in AllTestsAndPanels", function () {
        var sortedConceptSet = new Bahmni.Clinical.SortedConceptSet(allTestsAndPanels);
        var orders = [
            {concept: {name: "Test2"}},
            {concept: { name: "Test1"}}
        ];

        var sortedOrders = sortedConceptSet.sort(orders);

        expect(sortedOrders[0].concept.name).toBe("Test1");
        expect(sortedOrders[1].concept.name).toBe("Test2");
    });

    it("should add test/panel at the end if it is not there in allTestsAndPanels", function () {
        var sortedConceptSet = new Bahmni.Clinical.SortedConceptSet(allTestsAndPanels);
        var orders = [
            {concept: {name: "Test3"}},
            {concept: { name: "Test1"}},
            {concept: { name: "Test2"}}
        ];

        var sortedOrders = sortedConceptSet.sort(orders);

        expect(sortedOrders[0].concept.name).toBe("Test1");
        expect(sortedOrders[1].concept.name).toBe("Test2");
        expect(sortedOrders[2].concept.name).toBe("Test3");
    });

});
