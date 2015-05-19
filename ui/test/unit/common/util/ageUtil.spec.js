describe('AgeUtil', function () {
    var ageUtil = Bahmni.Common.Util.AgeUtil;

    describe("differenceInMonths", function () {
        it("should convert difference in dates to months", function () {
            var fromDate = new Date("2014-01-01");
            var toDate = new Date("2015-05-16");
            expect(ageUtil.differenceInMonths(fromDate, toDate)).toEqual(16.5);
        });

        it("should round months to 2 decimals", function () {
            var fromDate = new Date("2015-01-01");
            var toDate = new Date("2015-01-11");
            expect(ageUtil.differenceInMonths(fromDate, toDate)).toEqual(0.333);
        });

        it("should take the current date if end date is not given", function () {
            Bahmni.Common.Util.DateUtil.now = function () {
                return new Date("2015-06-01");
            };
            var fromDate = new Date("2015-05-01");
            expect(ageUtil.differenceInMonths(fromDate)).toEqual(1);
        });
    });

    describe("monthsToAge", function () {
        it("should convert given months to age", function () {
            expect(ageUtil.monthsToAgeString(133.33)).toEqual("11y 1m 10d");
        });
    });

});
