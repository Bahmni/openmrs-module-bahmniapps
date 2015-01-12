'use strict';

describe("Test ", function () {
    it("hasMultipleResults when results are more than one", function() {
        expect(new Bahmni.Clinical.Test({results: [1, 2]}).hasMultipleResults()).toBeTruthy();
        expect(new Bahmni.Clinical.Test({results: []}).hasMultipleResults()).toBeFalsy();
    });

    it("hasPendingResults when no results", function() {
        expect(new Bahmni.Clinical.Test({results: []}).hasPendingResults()).toBeTruthy();
        expect(new Bahmni.Clinical.Test({results: [1, 2]}).hasPendingResults()).toBeFalsy();
    });

    it("should get minNormal from first result", function() {
        var test = new Bahmni.Clinical.Test({results: [{minNormal: 100}, {minNormal: 300}]});
        expect(test.getMinNormal()).toBe(100);

        test = new Bahmni.Clinical.Test({results: []});
        expect(test.getMinNormal()).toBe(undefined);
    });

    it("should get maxNormal from first result", function() {
        var test = new Bahmni.Clinical.Test({results: [{maxNormal: 100}, {maxNormal: 300}]});
        expect(test.getMaxNormal()).toBe(100);

        test = new Bahmni.Clinical.Test({results: []});
        expect(test.getMaxNormal()).toBe(undefined);
    });

    it("display list should add for pending results", function() {
        var testWithPendingResults = new Bahmni.Clinical.Test({results: [], concept: {name: "Some Name", units: "some units"}});
        expect(testWithPendingResults.hasPendingResults()).toBeTruthy();

        var displayList = testWithPendingResults.getDisplayList();
        expect(displayList.length).toBe(2);
        expect(displayList[0]).toEqual({name: "Some Name", units: "some units", isSummary : true, hasResults: false});
        expect(displayList[1]).toEqual({name: "", isSummary : true, hasResults: false});
    });

    it("display list should add for multiple results", function() {
        var testWithPendingResults = new Bahmni.Clinical.Test({results: [1, 2, 3], concept: {name: "Some Name", units: "some units"}});
        expect(testWithPendingResults.hasMultipleResults()).toBeTruthy();

        var displayList = testWithPendingResults.getDisplayList();
        expect(displayList.length).toBe(5);
        expect(displayList[0]).toEqual({name: "Some Name", units: "some units", isSummary : true, hasResults: true});
        expect(displayList[1]).toEqual({name: "", isSummary : true, hasResults: true});
    });
});