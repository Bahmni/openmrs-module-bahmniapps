describe('DateUtil', function () {
    var dateUtil = Bahmni.Common.Util.DateUtil;

    it("should parse datetime string format", function () {
        var parsed = dateUtil.parseDatetime("2015-12-05 16:02:45");
        expect(parsed).toEqual(moment("2015-12-05 16:02:45"));
    });

    describe("isSameDateTime", function () {
        it("should be true if two dates and times are same", function () {
            expect(dateUtil.isSameDateTime("2014-01-20T11:12:13.000Z", "2014-01-20T11:12:13.000Z")).toBeTruthy();
            expect(dateUtil.isSameDateTime("2014-01-20T11:12:13.000+0530", "2014-01-20T11:12:13.000+0530")).toBeTruthy();

            expect(dateUtil.isSameDateTime("2014-01-20T11:12:13.000+0530", "2014-01-20T11:12:12.000+0530")).toBeFalsy();
            expect(dateUtil.isSameDateTime("2014-01-20T11:12:13.000+0530", "2014-01-21T11:12:13.000+0530")).toBeFalsy();
            expect(dateUtil.isSameDateTime(undefined, "2014-01-20T11:12:13.000Z")).toBeFalsy();
            expect(dateUtil.isSameDateTime("2014-01-20T11:12:13.000Z", null)).toBeFalsy();
        });
    });

    describe("isSameDateTime", function () {
        it("should be true if two dates are same irrespective of time", function () {
            expect(dateUtil.isSameDate("2014-01-20T11:12:13.000Z", "2014-01-20T00:00:00.000Z")).toBeTruthy();
            expect(dateUtil.isSameDate("2014-01-20T11:12:13.000+0530", "2014-01-20T00:00:00.000+0530")).toBeTruthy();
            expect(dateUtil.isSameDate("2014-01-21T11:12:13.000Z", "2014-01-20T00:00:00.000Z")).toBeFalsy();
            expect(dateUtil.isSameDate(undefined, new Date().toString())).toBeFalsy();
            expect(dateUtil.isSameDate(new Date().toString(), null)).toBeFalsy();
        });
    });

    describe('diffInYearsMonthsDays', function () {
        it("should calculate difference between dates when month and day are same", function () {
            var fromDate = new Date("2011-06-21");
            var toDate = new Date("2013-06-21");

            var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

            expect(period.years).toBe(2);
            expect(period.months).toBe(0);
            expect(period.days).toBe(0);
        });

        it("should calculate difference between dates when month of fromDate is lesser than month of toDate", function () {
            var fromDate = new Date("2011-08-21");
            var toDate = new Date("2013-06-21");

            var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

            expect(period.years).toBe(1);
            expect(period.months).toBe(10);
            expect(period.days).toBe(0);
        });

        it("should calculate difference between dates when date of fromDate is greater than date of toDate", function () {
            var fromDate = new Date("2011-08-25");
            var toDate = new Date("2013-08-15");

            var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

            expect(period.years).toBe(1);
            expect(period.months).toBe(11);
            expect(period.days).toBe(21);
        });

        describe('when fromDate is february', function () {
            it("should calculate difference between dates when fromDate is non-leap year", function () {
                var fromDate = new Date("2011-02-26");
                var toDate = new Date("2011-03-15");

                var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

                expect(period.years).toBe(0);
                expect(period.months).toBe(0);
                expect(period.days).toBe(17);
            });

            it("should calculate difference between dates when fromDate is leap year", function () {
                var fromDate = new Date("2012-02-26");
                var toDate = new Date("2012-03-15");

                var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

                expect(period.years).toBe(0);
                expect(period.months).toBe(0);
                expect(period.days).toBe(18);
            });
        });


        describe("when day of fromDate is lesser than day of toDate", function () {
            it("should calculate difference between dates when month previous to toDate has 30 days", function () {
                var fromDate = new Date("2013-07-21");
                var toDate = new Date("2013-08-15");

                var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

                expect(period.years).toBe(0);
                expect(period.months).toBe(0);
                expect(period.days).toBe(25);
            });


            it("should calculate difference between dates when month previous to toDate has 30 days", function () {
                var fromDate = new Date("2013-09-21");
                var toDate = new Date("2013-10-15");

                var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

                expect(period.years).toBe(0);
                expect(period.months).toBe(0);
                expect(period.days).toBe(24);
            });
        });
    });

    describe("diffInDaysRegardlessOfTime", function () {
        it('should return 0 when dates are same', function () {
            var fromDate = new Date('2013', '12', '05', '10', '30');
            var toDate = new Date('2013', '12', '05', '10', '34');
            expect(dateUtil.diffInDaysRegardlessOfTime(fromDate, toDate)).toBe(0);
        });

        it('should return 10 when dates are 10 days appart, regardless of time', function () {
            var fromDate = new Date('2013', '12', '25', '10', '30');
            var toDate = new Date('2014', '01', '04', '10', '34');
            expect(dateUtil.diffInDaysRegardlessOfTime(fromDate, toDate)).toBe(10);
        });
    });

    describe("getDayNumber", function () {
        it('should return 1 when date and reference date are same', function () {
            var refDate = new Date('2013', '12', '05', '10', '30');
            var date = new Date('2013', '12', '05', '10', '30');
            expect(dateUtil.getDayNumber(refDate, date)).toBe(1);
        });

        it('should return 2 when date and reference date are in differnt days and difference is less than 24 hrs', function () {
            var refDate = new Date('2013', '12', '04', '22', '30');
            var date = new Date('2013', '12', '05', '10', '30');
            expect(dateUtil.getDayNumber(refDate, date)).toBe(2);
        });

        it('should return 2 when date and reference date are in differnt days and difference is between 24 hrs to 48 hrs', function () {
            var refDate = new Date('2013', '12', '04', '10', '30');
            var date = new Date('2013', '12', '05', '18', '30');

            expect(dateUtil.getDayNumber(refDate, date)).toBe(2);
        });
    });

    describe("getDateWithoutHours", function () {
        it('should return date without hours', function () {
            var dateString = new Date('2015', '02', '09', '12', '26');
            var time = new Date('2015', '02', '09').getTime();
            expect(dateUtil.getDateWithoutHours(dateString)).toBe(time);
        });
    });

    describe("getEndDateFromDuration", function () {
        it('should return date from a given duration', function () {
            var dateFrom = new Date('2015', '7', '14', '12');
            var endDate = new Date('2015', '9', '14', '12')
            expect(dateUtil.getEndDateFromDuration(dateFrom, 2, "Months")).toEqual(endDate);
        });
    });

    describe("parseLongToServerFormat", function () {
        it("should convert long date to server format", function () {
            expect(dateUtil.parseLongDateToServerFormat(1425234600000)).toEqual("2015-03-02T00:00:00.000");
        })
    });

    describe("formatDateWithTime", function () {
        it("should take a long representation of date and format", function () {
            expect(dateUtil.formatDateWithTime("1427803080000")).toEqual("31 Mar 15 5:28 pm");
        });

        it("should take a string representation of date and format", function () {
            expect(dateUtil.formatDateWithTime("2015-03-02T00:15:00.000")).toEqual("02 Mar 15 12:15 am");
        });

        it("should not break for undefined and return null", function () {
            expect(dateUtil.formatDateWithTime(undefined)).toBeNull();
        });

        it("should return the original string if it cannot be formatted", function () {
            expect(dateUtil.formatDateWithTime("Recent")).toBe("Recent");
        });
    });

    describe("formatDateWithoutTime", function () {
        it("should take a long representation of date and format", function () {
            expect(dateUtil.formatDateWithoutTime("1427803080000")).toEqual("31 Mar 15");
        });

        it("should take a string representation of date and format", function () {
            expect(dateUtil.formatDateWithoutTime("2015-03-02T00:15:00.000")).toEqual("02 Mar 15");
        });

        it("should not break for undefined and return null", function () {
            expect(dateUtil.formatDateWithoutTime(undefined)).toBeNull();
        });

        it("should return the original string if it cannot be formatted", function () {
            expect(dateUtil.formatDateWithoutTime("Recent")).toBe("Recent");
        });
    });

    describe("formatTime", function () {
        it("should take a long representation of date and format", function () {
            expect(dateUtil.formatTime("1427803080000")).toEqual("5:28 pm");
        });

        it("should take a string representation of date and format", function () {
            expect(dateUtil.formatTime("2015-03-02T00:15:00.000")).toEqual("12:15 am");
        });

        it("should not break for undefined and return null", function () {
            expect(dateUtil.formatTime(undefined)).toBeNull();
        });
        it("should return the original string if it cannot be formatted", function () {
            expect(dateUtil.formatTime("Recent")).toBe("Recent");
        })
    });

    describe("diffInDays", function () {
        it("should return 0 for difference of same date", function () {
            var date = new Date('2015', '7', '14', '12');
            expect(dateUtil.diffInDays(date, date)).toEqual(0);
        });

        it("should return 1 for difference of one day", function () {
            var date = new Date('2015', '7', '14', '12');
            var nextDate = new Date('2015', '7', '15', '12');
            expect(dateUtil.diffInDays(date, nextDate)).toEqual(1);
        });

        it("should return 365 for difference of one year", function () {
            var date = new Date('2014', '7', '15', '12');
            var nextYear = new Date('2015', '7', '15', '12');
            expect(dateUtil.diffInDays(date, nextYear)).toEqual(365);
        });
    });

    describe("diffInMilliSeconds", function () {
        it("should return 0 for difference of same date", function () {
            var date = new Date('2014', '7', '15', '12');
            expect(dateUtil.diffInMilliSeconds(date, date)).toEqual(0);
        });
        it("should return 5000 for 5000ms added to date", function () {
            var date = new Date('2014', '7', '15', '12').setMilliseconds(0);
            var dataNextMilli = new Date('2014', '7', '15', '12').setMilliseconds(5000);;
            expect(dateUtil.diffInMilliSeconds(dataNextMilli, date)).toEqual(5000);
        });
    });

});
