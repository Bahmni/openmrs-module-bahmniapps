'use strict';

describe("ConceptWeightBasedSorter", function () {

    var allTestsAndPanels = {
        setMembers: [
            {name: {name: "Test1"}},
            {name: {name: "Panel1"}},
            {name: {name: "Test2"}},
            {name: {name: "Test1BelongsToPanel1"}},
            {name: {name: "Test2BelongsToPanel1"}},
            {name: {name: "TestBelongsToPanel2"}}
        ]
    };

    it("should sort by sortWeight of the test/panel in AllTestsAndPanels", function () {
        var sortedConceptSet = new Bahmni.Clinical.ConceptWeightBasedSorter(allTestsAndPanels);
        var orders = [
            {concept: {name: "Test2"}},
            {concept: { name: "Test1"}}
        ];

        var sortedOrders = sortedConceptSet.sort(orders);

        expect(sortedOrders[0].concept.name).toBe("Test1");
        expect(sortedOrders[1].concept.name).toBe("Test2");
    });

    it("should add test/panel at the end if it is not there in allTestsAndPanels", function () {
        var sortedConceptSet = new Bahmni.Clinical.ConceptWeightBasedSorter(allTestsAndPanels);
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

    it("should sort test results by sortWeight of the test in AllTestsAndPanels", function () {
        var sortedConceptSet = new Bahmni.Clinical.ConceptWeightBasedSorter(allTestsAndPanels);
        var testResults = [
            {orderName: "Test2"},
            {orderName: "Test1"}
        ];

        var sortedResults = sortedConceptSet.sortTestResults(testResults);

        expect(sortedResults[0].orderName).toBe("Test1");
        expect(sortedResults[1].orderName).toBe("Test2");
    });

    it("should sort tabular results by sortWeight", function () {
        var sortedConceptSet = new Bahmni.Clinical.ConceptWeightBasedSorter(allTestsAndPanels);
        var testResults = [
            {testName: "Test2"},
            {testName: "Test1"}
        ];

        var sortedResults = sortedConceptSet.sortTestResults(testResults);

        expect(sortedResults[0].testName).toBe("Test1");
        expect(sortedResults[1].testName).toBe("Test2");
    });

    it("should sort test results in a panel by sortWeight of the test in AllTestsAndPanels", function () {
        var sortedConceptSet = new Bahmni.Clinical.ConceptWeightBasedSorter(allTestsAndPanels);
        var testResults = [
            {orderName: "Test2"},
            {orderName: "Panel1", isPanel: true, tests: [
                {testName: "Test2BelongsToPanel1"},
                {testName: "Test1BelongsToPanel1"}
            ]}
        ];

        var sortedResults = sortedConceptSet.sortTestResults(testResults);

        expect(sortedResults[0].orderName).toBe("Panel1");
        expect(sortedResults[0].tests[0].testName).toBe("Test1BelongsToPanel1");
        expect(sortedResults[0].tests[1].testName).toBe("Test2BelongsToPanel1");
        expect(sortedResults[1].orderName).toBe("Test2");
    });
});
