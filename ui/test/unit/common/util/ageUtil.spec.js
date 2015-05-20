describe('AgeUtil', function () {
    var ageUtil = Bahmni.Common.Util.AgeUtil;

    describe("differenceInMonths", function () {
        it("should convert difference in dates to months", function () {
            var fromDate = new Date();
            fromDate.setFullYear(2014);
            fromDate.setMonth(0);
            fromDate.setDate(1);
            var toDate = new Date();
            toDate.setFullYear(2015);
            toDate.setMonth(4);
            toDate.setDate(16);
            expect(ageUtil.differenceInMonths(fromDate, toDate)).toEqual(16.5);
        });

        it("should round months to 2 decimals", function () {
            var fromDate = new Date();
            fromDate.setFullYear(2015);
            fromDate.setMonth(0);
            fromDate.setDate(1);
            var toDate = new Date();
            toDate.setFullYear(2015);
            toDate.setMonth(0);
            toDate.setDate(11);
            expect(ageUtil.differenceInMonths(fromDate, toDate)).toEqual(0.333);
        });

        it("should take the current date if end date is not given", function () {
            Bahmni.Common.Util.DateUtil.now = function () {
                var fromDate = new Date();
                fromDate.setFullYear(2015);
                fromDate.setMonth(5);
                fromDate.setDate(1);
                return fromDate;
            };
            var fromDate = new Date();
            fromDate.setFullYear(2015);
            fromDate.setMonth(4);
            fromDate.setDate(1);
            expect(ageUtil.differenceInMonths(fromDate)).toEqual(1);
        });
    });

    describe("monthsToAge", function () {
        it("should convert given months to age", function () {
            expect(ageUtil.monthsToAgeString(133.33)).toEqual("11y 1m 10d");
        });
    });

});
