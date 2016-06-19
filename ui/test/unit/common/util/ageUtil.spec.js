describe('AgeUtil', function () {
    var ageUtil = Bahmni.Common.Util.AgeUtil;

    describe("differenceInMonths", function () {
        it("should convert difference in dates to months", function () {
            var fromDate = new Date();
            fromDate.setDate(1);
            fromDate.setMonth(0);
            fromDate.setFullYear(2014);
            var toDate = new Date();
            toDate.setDate(16);
            toDate.setMonth(4);
            toDate.setFullYear(2015);
            expect(ageUtil.differenceInMonths(fromDate, toDate)).toEqual(16.5);
        });

        it("should round months to 2 decimals", function () {
            var fromDate = new Date();
            fromDate.setDate(1);
            fromDate.setMonth(0);
            fromDate.setFullYear(2015);
            var toDate = new Date();
            toDate.setDate(11);
            toDate.setMonth(0);
            toDate.setFullYear(2015);
            expect(ageUtil.differenceInMonths(fromDate, toDate)).toEqual(0.333);
        });

        it("should take the current date if end date is not given", function () {
            var originalNow = Bahmni.Common.Util.DateUtil.now;
            Bahmni.Common.Util.DateUtil.now = function () {
                var fromDate = new Date();
                fromDate.setDate(1);
                fromDate.setMonth(5);
                fromDate.setFullYear(2015);
                return fromDate;
            };
            var fromDate = new Date();
            fromDate.setDate(1);
            fromDate.setMonth(4);
            fromDate.setFullYear(2015);
            expect(ageUtil.differenceInMonths(fromDate)).toEqual(1);
            Bahmni.Common.Util.DateUtil.now = originalNow;
        });
    });

    describe("monthsToAge", function () {
        it("should convert given months to age", function () {
            expect(ageUtil.monthsToAgeString(133.33)).toEqual("11y 1m 10d");
        });
    });

});
