'use strict';

describe("TabularLabResults", function () {
    var result1 = {name: "Test One",displayList:function(){
        return this;
    }};
    var result2 = {name: "Test Two", value: 100, isAbnormal: false, observationDateTime: "2014-04-18T00:00:00.000+0530", notes: null,
        displayList:function(){
            return this;
        }
    };
    var result3 = {name: "Test Two", value: 110, isAbnormal: false, observationDateTime: "2014-04-19T00:00:00.000+0530", notes: null,
        displayList:function(){
        return this;
    }};
    var result4 = {name: "Test Three", value: 140, isAbnormal: false, observationDateTime: "2014-04-17T00:00:00.000+0530", notes: null,displayList:function(){
        return this;
    }};
    var result5 = {name: "Test Three", value: 160, isAbnormal: false, observationDateTime: "2014-04-17T00:00:00.000+0530", notes: null,displayList:function(){
        return this;
    }};
    var result6 = {name: "Test Three", value: 170, isAbnormal: true, observationDateTime: "2014-04-21T00:00:00.000+0530", notes: null,displayList:function(){
        return this;
    }};

    var testOrders = [result1, result2, result3, result4, result5, result6];
    var ALL_TESTS_AND_PANELS = {"results": [
        {"uuid": "553e2fa2-a91c-11e3-b237-0800271c1b75", "name": {"uuid": "553e968f-a91c-11e3-b237-0800271c1b75", "name": "All_Tests_and_Panels"}, "setMembers": [
            {"uuid": "a6f0294a-7fb9-4e3e-9ce1-2ed369f9808b", "name": {"uuid": "570af4fd-591c-4863-bbbc-67bcf2c85084", "name": "Test Three"}},
            {"uuid": "d2b67e1e-ec20-49cf-b2d6-766ea9d3c8d3", "name": {"uuid": "17a67549-0ba1-46bb-92eb-dca9f81fafa1", "name": "Test Two"}}
        ]}
    ]}

    it("should return days based on visit startDate and endDate", function () {
        var visitStartDate = "2014-04-17T00:00:00.000+0530";
        var visitEndDate = "2014-04-22T00:00:00.000+0530";
        var res = Bahmni.Clinical.TabularLabResults.create(testOrders, visitStartDate, visitEndDate, ALL_TESTS_AND_PANELS.results[0]);

        expect(res.getDays().length).toBe(6);
    });

    iit("should return unique test results as rows", function () {
        var visitStartDate = "2014-04-17T00:00:00.000+0530";
        var visitEndDate = "2014-04-22T00:00:00.000+0530";
        var res = Bahmni.Clinical.TabularLabResults.create(testOrders, visitStartDate, visitEndDate, ALL_TESTS_AND_PANELS.results[0]);
        expect(res.getRows().length).toBe(3)
        expect(res.getRows()[0].name).toBe("Test Three");
        expect(res.getRows()[1].name).toBe("Test Two");
        expect(res.getRows()[2].name).toBe("Test One");

        expect(res.getRows()[0].results.length).toBe(6);
        expect(res.getRows()[1].results.length).toBe(6);
        expect(res.getRows()[2].results.length).toBe(6);

        expect(res.getRows()[0].results).toEqual([[result4, result5], [], [], [], [result6], []]);
        expect(res.getRows()[1].results).toEqual([[], [result2], [result3], [], [], []]);
        expect(res.getRows()[2].results).toEqual([[], [], [], [], [], []]);
    });
});