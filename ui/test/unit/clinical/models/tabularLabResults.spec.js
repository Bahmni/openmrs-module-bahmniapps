'use strict';

describe("TabularLabResults", function () {
    var visitStartDate, visitEndDate;


    beforeEach(function(){
        visitStartDate = "2014-04-17T00:00:00.000+0530";
        visitEndDate = "2014-04-22T00:00:00.000+0530";
    });

    it("should return days based on visit startDate and endDate", function () {
        visitStartDate = "2014-04-17T00:00:00.000+0530";
        visitEndDate = "2014-04-22T00:00:00.000+0530";

        var res = Bahmni.Clinical.TabularLabResults.create([], visitStartDate, visitEndDate);

        expect(res.getDays().length).toBe(6);
    });

    it("should return unique test results as rows", function () {
        var test1 = setUpTest("Test One", []);
        var test2 = setUpTest("Test Two", []);
        var test3 = setUpTest("Test Two", []);
        var test4 = setUpTest("Test Three", []);
        var labOrder1 = setUpLabOrder("2014-04-17T00:00:00.000+0530", test1);
        var labOrder2 = setUpLabOrder("2014-04-17T00:00:00.000+0530", test2);
        var labOrder3 = setUpLabOrder("2014-04-17T00:00:00.000+0530", test3);
        var labOrder4 = setUpLabOrder("2014-04-17T00:00:00.000+0530", test4);

        var labOrders = [labOrder1, labOrder2, labOrder3, labOrder4];

        var res = Bahmni.Clinical.TabularLabResults.create(labOrders, visitStartDate, visitEndDate);
        expect(res.getOrderables().length).toBe(3);
        expect(res.getOrderables()[0].concept.name).toBe("Test One");
        expect(res.getOrderables()[1].concept.name).toBe("Test Two");
        expect(res.getOrderables()[2].concept.name).toBe("Test Three");
    });


    it("should combine result of the same tests", function () {
        var firstDayResult = setUpResult("MCH", "2014-04-20T00:00:00.000+0530", 12, "2014-04-19T00:00:00.000+0530");
        var secondDayResult = setUpResult("MCH", "2014-04-21T00:00:00.000+0530", 16, "2014-04-20T00:00:00.000+0530");
        var MCH1 = setUpTest("MCH", [firstDayResult]);
        var MCH2 = setUpTest("MCH", [secondDayResult]);
        var labOrder1 = setUpLabOrder("2014-04-19T00:00:00.000+0530", MCH1);
        var labOrder2 = setUpLabOrder("2014-04-20T00:00:00.000+0530", MCH2);
        var labOrders = [labOrder1, labOrder2];

        var res = Bahmni.Clinical.TabularLabResults.create(labOrders, visitStartDate, visitEndDate);

        expect(res.getOrderables().length).toBe(1);
        expect(res.getOrderables()[0].concept.name).toBe("MCH");
        expect(res.getOrderables()[0].results.length).toBe(2);
        expect(res.getOrderables()[0].results).toEqual([firstDayResult, secondDayResult]);
    });

    it("should return results of tests under panel with the attribute belongsToPanel true", function () {
        var mchResult1 = setUpResult("MCH", "2014-04-20T00:00:00.000+0530", 12, "2014-04-19T00:00:00.000+0530");
        var mchResult2 = setUpResult("MCH", "2014-04-21T00:00:00.000+0530", 16, "2014-04-20T00:00:00.000+0530");
        var mcvResult = setUpResult("MCV", "2014-04-21T00:00:00.000+0530", 16, "2014-04-20T00:00:00.000+0530");
        var test1 = setUpTest("MCH", [mchResult1]);
        var test2 = setUpTest("MCH", [mchResult2]);
        var test3 = setUpTest("MCV", [mcvResult]);
        var anaemiaPanel = setUpPanel("Anaemia Panel", [test1, test3]);
        var labOrder1 = setUpLabOrder("2014-04-19T00:00:00.000+0530", anaemiaPanel);
        var labOrder2 = setUpLabOrder("2014-04-20T00:00:00.000+0530", test2);
        var labOrders = [labOrder1, labOrder2];

        var res = Bahmni.Clinical.TabularLabResults.create(labOrders, visitStartDate, visitEndDate);

        expect(res.getOrderables().length).toBe(3);
        expect(res.getOrderables()[0].concept.name).toBe("Anaemia Panel");
        expect(res.getOrderables()[1].concept.name).toBe("MCH");
        expect(res.getOrderables()[1].belongsToPanel).toBe(true);
        expect(res.getOrderables()[1].results).toEqual([mchResult1, mchResult2]);
        expect(res.getOrderables()[2].concept.name).toBe("MCV");
        expect(res.getOrderables()[2].belongsToPanel).toBe(true);
        expect(res.getOrderables()[2].results).toEqual([mcvResult]);
    });

    it("should combine results of tests from multiple order of same panel", function () {
        var mchResult1 = setUpResult("MCH", "2014-04-20T00:00:00.000+0530", 12, "2014-04-19T00:00:00.000+0530");
        var mchResult2 = setUpResult("MCH", "2014-04-21T00:00:00.000+0530", 16, "2014-04-20T00:00:00.000+0530");
        var mcvResult = setUpResult("MCV", "2014-04-21T00:00:00.000+0530", 16, "2014-04-20T00:00:00.000+0530");
        var test1 = setUpTest("MCH", [mchResult1]);
        var test2 = setUpTest("MCH", [mchResult2]);
        var test3 = setUpTest("MCV", [mcvResult]);
        var anaemiaPanel1 = setUpPanel("Anaemia Panel", [test1, test3]);
        var anaemiaPanel2 = setUpPanel("Anaemia Panel", [test2]);
        var labOrder1 = setUpLabOrder("2014-04-19T00:00:00.000+0530", anaemiaPanel1);
        var labOrder2 = setUpLabOrder("2014-04-20T00:00:00.000+0530", anaemiaPanel2);
        var labOrders = [labOrder1, labOrder2];

        var res = Bahmni.Clinical.TabularLabResults.create(labOrders, visitStartDate, visitEndDate);

        expect(res.getOrderables().length).toBe(3);
        expect(res.getOrderables()[0].concept.name).toBe("Anaemia Panel");
        expect(res.getOrderables()[1].concept.name).toBe("MCH");
        expect(res.getOrderables()[1].belongsToPanel).toBe(true);
        expect(res.getOrderables()[1].results).toEqual([mchResult1, mchResult2]);
        expect(res.getOrderables()[2].concept.name).toBe("MCV");
        expect(res.getOrderables()[2].belongsToPanel).toBe(true);
        expect(res.getOrderables()[2].results).toEqual([mcvResult]);
    });

    function setUpResult(testName, obsDateTime, value, orderDate) {
        return new Bahmni.Clinical.Result({
            value: value,
            observationDateTime: obsDateTime,
            concept: {
                name: testName
            },
            orderDate: orderDate
        });
    }

    function setUpTest(testName, results) {
        return new Bahmni.Clinical.Test({
            concept: {
                name: testName
            },
            results: results
        })
    }

    function setUpPanel(name, tests) {
        return new Bahmni.Clinical.Panel({
            concept:{
                name: name,
                set: true
            },
            tests: tests
        })
    }

    var setUpLabOrder = function (dateCreated, testOrPanel) {
        return new Bahmni.Clinical.LabOrder({
            concept: testOrPanel.concept,
            dateCreated: dateCreated,
            orderable: testOrPanel
        });
    }
});