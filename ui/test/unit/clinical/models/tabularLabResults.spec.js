'use strict';

describe("TabularLabResults", function() {
    var result1 = {name: "Test One"};
    var result2 = {name: "Test Two", value: 100, isAbnormal: false, observationDateTime: "2014-04-18T00:00:00.000+0530", notes: null};
    var result3 = {name: "Test Two", value: 110, isAbnormal: false, observationDateTime: "2014-04-19T00:00:00.000+0530", notes: null};
    var result4 = {name: "Test Three", value: 140, isAbnormal: false, observationDateTime: "2014-04-17T00:00:00.000+0530", notes: null};
    var result5 = {name: "Test Three", value: 160, isAbnormal: false, observationDateTime: "2014-04-17T00:00:00.000+0530", notes: null};
    var result6 = {name: "Test Three", value: 170, isAbnormal: true, observationDateTime: "2014-04-21T00:00:00.000+0530", notes: null};

    var testOrders = [result1, result2, result3, result4, result5, result6];

    it("should return days based on visit startDate and endDate", function() {
        var visitStartDate = "2014-04-17T00:00:00.000+0530";
        var visitEndDate = "2014-04-22T00:00:00.000+0530";
        var res = Bahmni.Clinical.TabularLabResults.create(testOrders, visitStartDate, visitEndDate);

        expect(res.getDays().length).toBe(6);
    });

    it("should return unique test results as rows",function(){
        var visitStartDate = "2014-04-17T00:00:00.000+0530";
        var visitEndDate = "2014-04-22T00:00:00.000+0530";
        var res = Bahmni.Clinical.TabularLabResults.create(testOrders, visitStartDate, visitEndDate);

        expect(res.getRows().length).toBe(3)
        expect(res.getRows()[0].testName).toBe("Test One");
        expect(res.getRows()[1].testName).toBe("Test Two");
        expect(res.getRows()[2].testName).toBe("Test Three");

        expect(res.getRows()[0].results.length).toBe(6);
        expect(res.getRows()[1].results.length).toBe(6);
        expect(res.getRows()[2].results.length).toBe(6);

        expect(res.getRows()[0].results).toEqual([[], [result1], [], [], [], []]);
        expect(res.getRows()[1].results).toEqual([[], [result2], [result3], [], [], []]);
        expect(res.getRows()[2].results).toEqual([[result4, result5], [], [], [], [result6], []]);
    });
})