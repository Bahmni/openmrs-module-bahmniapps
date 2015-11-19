'use strict';


describe("drug order history helper", function () {
    var drugOrderHistoryHelper;
    var sampleTreatment = function (uuid, startDate) {
        var drugOrderViewModel = new Bahmni.Clinical.DrugOrderViewModel();
        drugOrderViewModel.drug = {
            uuid: uuid
        };
        drugOrderViewModel.effectiveStartDate = startDate;
        return drugOrderViewModel;
    };

    var sampleNonCodedTreatment = function (startDate) {
        var drugOrderViewModel = new Bahmni.Clinical.DrugOrderViewModel();
        drugOrderViewModel.drugNonCoded = "nonCodedDrug";
        drugOrderViewModel.effectiveStartDate = startDate;
        return drugOrderViewModel;
    };

    beforeEach(function () {
        module('bahmni.clinical');

        inject(['drugOrderHistoryHelper', function (helper) {
            drugOrderHistoryHelper = helper;
        }]);

    });

    it('should return only the inactive drugorders from the past', function () {
        var drug1 = sampleTreatment("uuid1");
        var drug2 = sampleTreatment("uuid2");
        var drug3 = sampleTreatment("uuid3");
        var drug4 = sampleTreatment("uuid4");
        var drug5 = sampleTreatment("uuid5");
        var activeDrugs = [drug1, drug2, drug3];
        var inactiveDrugs = [drug3, drug4, drug5];

        var inactive = drugOrderHistoryHelper.getInactiveDrugsFromPastVisit(activeDrugs, inactiveDrugs);

        expect(inactive).toEqual([drug4, drug5]);
    });

    it('should return only the inactive drugorders from the past when there are noncoded drugorders', function () {
        var drug1 = sampleTreatment("uuid1");
        var drug2 = sampleNonCodedTreatment();
        var drug3 = sampleTreatment("uuid3");
        var drug4 = sampleTreatment("uuid4");
        var drug5 = sampleNonCodedTreatment();
        var activeDrugs = [drug1, drug2, drug3];
        var inactiveDrugs = [drug3, drug4, drug5];

        var inactive = drugOrderHistoryHelper.getInactiveDrugsFromPastVisit(activeDrugs, inactiveDrugs);
        expect(inactive).toEqual([drug4]);
    });

    it("should return none if there are no inactive drugorders", function () {
        var drug1 = sampleTreatment("uuid1");
        var drug2 = sampleTreatment("uuid2");
        var inactive = drugOrderHistoryHelper.getInactiveDrugsFromPastVisit([drug1, drug2], undefined);
        expect(inactive).toEqual([]);
    })

    //it("should partition the drugs into past, present and future", function () {
    //    var current = new Date();
    //
    //    var drug1 = sampleTreatment("uuid1", moment(current).subtract('days', 1).toDate());
    //    var drug2 = sampleTreatment("uuid2", moment(current).subtract('hours', 5).toDate());
    //    var drug3 = sampleTreatment("uuid3", moment(current).subtract('hours', 2).toDate());
    //
    //    //var drug4 = sampleTreatment("uuid4", moment(current).add('hours', 2).toDate());
    //    //var drug5 = sampleTreatment("uuid5", moment(current).add('hours', 5).toDate());
    //
    //    //var drug6 = sampleTreatment("uuid6", moment(current).add('days', 2).toDate());
    //    //var drug7 = sampleTreatment("uuid7", moment(current).add('days', 5).toDate());
    //
    //    var inactiveDrug1 = sampleTreatment("inactiveDrug1", moment(current).subtract('days', 2).toDate());
    //    var inactiveDrug2 = sampleTreatment("inactiveDrug2", moment(current).subtract('days', 5).toDate());
    //
    //    var activeDrugs = [drug1, drug2, drug3];
    //    var inactiveDrugs = [inactiveDrug1, inactiveDrug2];
    //    drugOrderHistoryHelper.getInactiveDrugsFromPastVisit = function () {
    //        return inactiveDrugs;
    //    };
    //
    //    var drugOrders = drugOrderHistoryHelper.getRefillableDrugOrders(activeDrugs, inactiveDrugs);
    //    expect(drugOrders).toEqual([drug2, drug3, drug1, inactiveDrug1, inactiveDrug2]);
    //});

});