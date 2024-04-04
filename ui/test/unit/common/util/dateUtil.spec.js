describe('DateUtil', function () {
    var dateUtil = Bahmni.Common.Util.DateUtil;
    var dateFormat = "YYYY-MM-DDTHH:mm:ss.SSS";
    const clientTimeDisplayFormat = "h:mm a";
    const clientDateDisplayFormat = "DD MMM YYYY";

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

    describe("isSameDate", function () {
        it("should be true if two dates are same irrespective of time", function () {
            var firstDate = new Date();
            var secondDate = new Date();
            firstDate.setHours(0, 0, 0, 0, 0);
            secondDate.setHours(23, 59, 0, 0, 0);
            expect(dateUtil.isSameDate(firstDate, secondDate)).toBeTruthy();

            secondDate.setFullYear(secondDate.getFullYear()+1);
            expect(dateUtil.isSameDate(firstDate, secondDate)).toBeFalsy();
            expect(dateUtil.isSameDate(undefined, new Date().toString())).toBeFalsy();
            expect(dateUtil.isSameDate(new Date().toString(), null)).toBeFalsy();
        });
    });

    describe('diffInYearsMonthsDays', function () {
        it("should calculate difference between dates when month and day are same", function () {
            var fromDate = new Date("2020-01-15");
            var toDate = new Date("2024-01-15");
            
            var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

            expect(period.years).toBe(4);
            expect(period.months).toBe(0);
            expect(period.days).toBe(0);
        });

        it("should calculate difference between dates when month of fromDate is lesser than month of toDate", function () {
            var fromDate = new Date();
            fromDate.setDate(21);
            fromDate.setMonth(7);
            fromDate.setFullYear(2011);
            var toDate = new Date();
            toDate.setDate(21);
            toDate.setMonth(5);
            toDate.setFullYear(2013);

            var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

            expect(period.years).toBe(1);
            expect(period.months).toBe(10);
            expect(period.days).toBe(0);
        });

        it("should calculate difference between dates when date of fromDate is greater than date of toDate", function () {
            var fromDate = new Date();
            fromDate.setDate(25);
            fromDate.setMonth(7);
            fromDate.setFullYear(2011);
            var toDate = new Date();
            toDate.setDate(15);
            toDate.setMonth(7);
            toDate.setFullYear(2013);

            var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

            expect(period.years).toBe(1);
            expect(period.months).toBe(11);
            expect(period.days).toBe(21);
        });

        describe('when fromDate is february', function () {
            it("should calculate difference between dates when fromDate and toDate is leap year", function () {
                var fromDate = new Date();
                fromDate.setDate(28);
                fromDate.setMonth(1);
                fromDate.setFullYear(2000);
                var toDate = new Date();
                toDate.setDate(2);
                toDate.setMonth(1);
                toDate.setFullYear(2020);
                var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

                expect(period.years).toBe(19);
                expect(period.months).toBe(11);
                expect(period.days).toBe(3);
            });

            it("should calculate difference between dates when fromDate and toDate is non-leap year", function () {
                var fromDate = new Date();
                fromDate.setDate(26);
                fromDate.setMonth(1);
                fromDate.setFullYear(2011);
                var toDate = new Date();
                toDate.setDate(2);
                toDate.setMonth(1);
                toDate.setFullYear(2023);
                var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

                expect(period.years).toBe(11);
                expect(period.months).toBe(11);
                expect(period.days).toBe(4);
            });

            it("should calculate difference between dates when fromDate is non-leap year", function () {
                var fromDate = new Date();
                fromDate.setDate(26);
                fromDate.setMonth(1);
                fromDate.setFullYear(2011);
                var toDate = new Date();
                toDate.setDate(29);
                toDate.setMonth(1);
                toDate.setFullYear(2020);
                var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

                expect(period.years).toBe(9);
                expect(period.months).toBe(0);
                expect(period.days).toBe(3);
            });

            it("should calculate difference between dates when fromDate is leap year", function () {
                var fromDate = new Date();
                fromDate.setDate(25);
                fromDate.setMonth(1);
                fromDate.setFullYear(2000);
                var toDate = new Date();
                toDate.setDate(2);
                toDate.setMonth(2);
                toDate.setFullYear(2023);

                var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

                expect(period.years).toBe(23);
                expect(period.months).toBe(0);
                expect(period.days).toBe(6);
            });
        });


        describe("when day of fromDate is lesser than day of toDate", function () {
            it("should calculate difference between dates when month previous to toDate has 30 days", function () {
                var fromDate = new Date();
                fromDate.setDate(21);
                fromDate.setMonth(6);
                fromDate.setFullYear(2013);
                var toDate = new Date();
                toDate.setDate(15);
                toDate.setMonth(7);
                toDate.setFullYear(2013);

                var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

                expect(period.years).toBe(0);
                expect(period.months).toBe(0);
                expect(period.days).toBe(25);
            });


            it("should calculate difference between dates when month previous to toDate has 30 days", function () {
                var fromDate = new Date();
                fromDate.setDate(21);
                fromDate.setMonth(8);
                fromDate.setFullYear(2013);
                var toDate = new Date();
                toDate.setDate(15);
                toDate.setMonth(9);
                toDate.setFullYear(2013);

                var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

                expect(period.years).toBe(0);
                expect(period.months).toBe(0);
                expect(period.days).toBe(24);
            });
        });
    });

    describe("diffInDaysRegardlessOfTime", function () {
        it('should return 0 when dates are same', function () {
            var fromDate = new Date();
            fromDate.setHours(0, 0, 0, 0, 0);
            var toDate = new Date();
            toDate.setHours(23, 59, 0, 0, 0);
            expect(dateUtil.diffInDaysRegardlessOfTime(fromDate, toDate)).toBe(0);
        });

        it('should not change the date time', function () {
            var fromDate = new Date("10/10/2015");
            fromDate.setHours(0, 0, 0, 0, 0);
            var cpOfFromDate = new Date(fromDate);
            var toDate = new Date("10/10/2015");
            toDate.setHours(23, 59, 0, 0, 0);
            var cpOfToDate = new Date(toDate);
            expect(dateUtil.diffInDaysRegardlessOfTime(fromDate, toDate)).toBe(0);
            expect(fromDate).toEqual(cpOfFromDate);
            expect(toDate).toEqual(cpOfToDate);
        });

        it('should return 10 when dates are 10 days apart, regardless of time', function () {
            var fromDate = new Date();
            fromDate.setHours(0, 0, 0, 0, 0);
            var toDate = new Date();
            toDate.setHours(23, 59, 0, 0, 0);
            toDate.setDate(toDate.getDate() + 10);
            expect(dateUtil.diffInDaysRegardlessOfTime(fromDate, toDate)).toBe(10);
        });
    });

    describe("getDayNumber", function () {
        it('should return 1 when date and reference date are same', function () {
            var fromDate = new Date();
            var toDate = new Date();
            expect(dateUtil.getDayNumber(fromDate, toDate)).toBe(1);
        });

        it('should return 2 when date and reference date are in differnt days and difference is less than 24 hrs', function () {
            var fromDate = new Date();
            fromDate.setHours(22, 30, 0, 0, 0);
            var toDate = new Date();
            toDate.setHours(10, 30, 0, 0, 0);
            toDate.setDate(toDate.getDate()+1);
            expect(dateUtil.getDayNumber(fromDate, toDate)).toBe(2);
        });

        it('should return 2 when date and reference date are in differnt days and difference is between 24 hrs to 48 hrs', function () {
            var fromDate = new Date();
            fromDate.setHours(10, 30, 0, 0, 0);
            var toDate = new Date();
            toDate.setHours(18, 30, 0, 0, 0);
            toDate.setDate(toDate.getDate()+1);
            expect(dateUtil.getDayNumber(fromDate, toDate)).toBe(2);
        });
    });

    describe("getEndDateFromDuration", function () {
        it('should return date from a given duration', function () {
            var dateFrom = new Date();
            dateFrom.setHours(0, 0, 0, 0, 0);
            var endDate = new Date();
            endDate.setHours(0, 0, 0, 0, 0);
            endDate.setMonth(endDate.getMonth()+2);
            expect(dateUtil.getEndDateFromDuration(dateFrom, 2, "Months")).toEqual(endDate);
        });
    });

    describe("formatDateWithTime", function () {
        it("should take a long representation of date and format", function () {
            var date = new Date(1427803080000);
            expect(dateUtil.formatDateWithTime("1427803080000")).toEqual(moment(date).format(clientDateDisplayFormat + " " + clientTimeDisplayFormat));
        });

        it("should take a string representation of date and format", function () {
            var date = new Date();
            expect(dateUtil.formatDateWithTime(moment(date).format(dateFormat))).toEqual(moment(date).format(clientDateDisplayFormat + " " + clientTimeDisplayFormat));
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
            var date = new Date(1427803080000);
            expect(dateUtil.formatDateWithoutTimeToLocal(1427803080000)).toEqual(moment(date).format(clientDateDisplayFormat));
        });

        it("should take a string representation of date and format", function () {
            var date = new Date();
            expect(dateUtil.formatDateWithoutTimeToLocal(moment(date).format(dateFormat))).toEqual(moment(date).format(clientDateDisplayFormat));
        });

        it("should not break for undefined and return null", function () {
            expect(dateUtil.formatDateWithoutTimeToLocal(undefined)).toBeNull();
        });

        it("should return the original string if it cannot be formatted", function () {
            expect(dateUtil.formatDateWithoutTimeToLocal("Recent")).toBe("Recent");
        });

        it('should return formatted date without time for valid date input', function() {
            var validDate = "2023-07-13";
            var expectedOutput = moment(validDate).format(clientDateDisplayFormat);
            var formattedDate = Bahmni.Common.Util.DateUtil.formatDateWithoutTime(validDate);
            expect(formattedDate).toBe(expectedOutput);
        });

        it('should return formatted date without time for array date input', function() {
            var validDate = [2024,2,25,6,30];
            var expectedOutput = moment(validDate).format(clientDateDisplayFormat);
            var formattedDate = Bahmni.Common.Util.DateUtil.formatDateWithoutTime(validDate);
            expect(formattedDate).toBe(expectedOutput);
        });
    
        it('should return the same input for invalid date input', function() {
            var invalidDate = "invalid_date";
            var formattedDate = Bahmni.Common.Util.DateUtil.formatDateWithoutTime(invalidDate);
            expect(formattedDate).toBe(invalidDate);
        });

        it('should return null for null input', function() {
            var nullInput = null;
            var formattedDate = Bahmni.Common.Util.DateUtil.formatDateWithoutTime(nullInput);
            expect(formattedDate).toBeNull();
        });
    });

    describe('formatDateWithoutTimeToLocal', function() {
        it("should take a long representation of date and format", function () {
            var date = new Date(1427803080000);
            expect(dateUtil.formatDateWithoutTime("1427803080000")).toEqual(moment(date).format(clientDateDisplayFormat));
        });

        it("should take a string representation of date and format", function () {
            var date = new Date();
            expect(dateUtil.formatDateWithoutTime(moment(date).format(dateFormat))).toEqual(moment(date).format(clientDateDisplayFormat));
        });

        it("should not break for undefined and return null", function () {
            expect(dateUtil.formatDateWithoutTime(undefined)).toBeNull();
        });

        it("should return the original string if it cannot be formatted", function () {
            expect(dateUtil.formatDateWithoutTime("Recent")).toBe("Recent");
        });

        it('should return formatted date without time for valid date input', function() {
            var validDate = "2023-07-13";
            var expectedOutput = moment(validDate).format(clientDateDisplayFormat);
            var formattedDate = Bahmni.Common.Util.DateUtil.formatDateWithoutTimeToLocal(validDate);
            expect(formattedDate).toBe(expectedOutput);
        });

        it('should return formatted date without time for array date input', function() {
            var validDate = [2024,2,25,6,30];
            var expectedOutput = moment(validDate).format(clientDateDisplayFormat);
            var formattedDate = Bahmni.Common.Util.DateUtil.formatDateWithoutTimeToLocal(validDate);
            expect(formattedDate).toBe(expectedOutput);
        });

        it('should return the same input for invalid date input', function() {
            var invalidDate = "invalid_date";
            var formattedDate = Bahmni.Common.Util.DateUtil.formatDateWithoutTimeToLocal(invalidDate);
            expect(formattedDate).toBe(invalidDate);
        });

        it('should return null for null input', function() {
            var nullInput = null;
            var formattedDate = Bahmni.Common.Util.DateUtil.formatDateWithoutTimeToLocal(nullInput);
            expect(formattedDate).toBeNull();
        });
    });

    describe("formatTime", function () {
        it("should take a long representation of date and format", function () {
            var date = new Date(1427803080000);
            expect(dateUtil.formatTime("1427803080000")).toEqual(moment(date).format(clientTimeDisplayFormat));
        });

        it("should take a string representation of date and format", function () {
            var date = new Date();
            expect(dateUtil.formatTime(moment(date).format(dateFormat))).toEqual(moment(date).format(clientTimeDisplayFormat));
        });

        it("should not break for undefined and return null", function () {
            expect(dateUtil.formatTime(undefined)).toBeNull();
        });

        it("should return the original string if it cannot be formatted", function () {
            expect(dateUtil.formatTime("Recent")).toBe("Recent");
        })

        it('should return formatted time for valid date input', function() {
            var validDate = "2023-07-13T10:30:00";
            var expectedOutput = moment(validDate).format(clientTimeDisplayFormat);
            var formattedTime = Bahmni.Common.Util.DateUtil.formatTime(validDate);
            expect(formattedTime).toBe(expectedOutput);
        });

        it('should return formatted time for array date input', function() {
            var validDate = [2024,2,25,6,30];
            var expectedOutput = moment(validDate).format(clientDateDisplayFormat);
            var formattedDate = Bahmni.Common.Util.DateUtil.formatDateWithoutTimeToLocal(validDate);
            expect(formattedDate).toBe(expectedOutput);
        });

        it('should return the same input for invalid date input', function() {
            var invalidDate = "invalid_date";
            var formattedTime = Bahmni.Common.Util.DateUtil.formatTime(invalidDate);
            expect(formattedTime).toBe(invalidDate);
        });

        it('should return null for null input', function() {
            var nullInput = null;
            var formattedTime = Bahmni.Common.Util.DateUtil.formatTime(nullInput);
            expect(formattedTime).toBeNull();
        });
    });

    describe('formatTimeToLocal', function() {
        it("should take a long representation of date and format", function () {
            var date = new Date(1427803080000);
            expect(dateUtil.formatTime("1427803080000")).toEqual(moment.utc(date).local().format(clientTimeDisplayFormat));
        });

        it("should take a string representation of date and format", function () {
            var date = new Date();
            expect(dateUtil.formatTime(moment(date).format(dateFormat))).toEqual(moment.utc(date).local().format(clientTimeDisplayFormat));
        });

        it("should not break for undefined and return null", function () {
            expect(dateUtil.formatTime(undefined)).toBeNull();
        });

        it("should return the original string if it cannot be formatted", function () {
            expect(dateUtil.formatTime("Recent")).toBe("Recent");
        })

        it('should return formatted time in local timezone for valid date input', function() {
            var validDate = "2023-07-13T10:30:00";
            var expectedOutput = moment.utc(validDate).local().format(clientTimeDisplayFormat);
            var formattedTime = Bahmni.Common.Util.DateUtil.formatTimeToLocal(validDate);
            expect(formattedTime).toBe(expectedOutput);
        });

        it('should return formatted time for array date input', function() {
            var validDate = [2024,2,25,6,30];
            var expectedOutput = moment.utc(validDate).local().format(clientTimeDisplayFormat);
            var formattedDate = Bahmni.Common.Util.DateUtil.formatTimeToLocal(validDate);
            expect(formattedDate).toBe(expectedOutput);
        });

        it('should return the same input for invalid date input', function() {
            var invalidDate = "invalid_date";
            var formattedTime = Bahmni.Common.Util.DateUtil.formatTimeToLocal(invalidDate);
            expect(formattedTime).toBe(invalidDate);
        });

        it('should return null for null input', function() {
            var nullInput = null;
            var formattedTime = Bahmni.Common.Util.DateUtil.formatTimeToLocal(nullInput);
            expect(formattedTime).toBeNull();
        });
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

    describe("getDateWithoutTime", function() {
        it("should return date without time",function(){
            expect(dateUtil.getDateWithoutTime(new Date('2014', '7', '15', '12','30','25'))).toBe('2014-08-15');
        });

        it("should return null if date provided is null", function() {
            expect(dateUtil.getDateWithoutTime(null)).toBe(null);
        });
    });

    describe("getDateWithMonthsAndYears", function(){
        it("should return date with months and years", function(){
           expect(dateUtil.getDateInMonthsAndYears(new Date('2014', '7', '15', '12','30','25'))).toBe('Aug 2014');
        });
    });

    describe("formatDateInStrictMode", function(){
       it("should return date in dd MMM YYYY format when date with yyyy-MM-dd format is passed", function(){
          expect(dateUtil.formatDateInStrictMode('2016-02-10')).toBe('10 Feb 2016');
       });

       it("should return date in dd MMM YYYY format when date with yyyy-MM-ddTHH:mm:ss.SSSZ is passed", function(){
           expect(dateUtil.formatDateInStrictMode('2016-03-01T10:30:00.000+0530')).toBe(moment('2016-03-01T10:30:00.000+0530').format(clientDateDisplayFormat));
       });

       it("should return the string if the format does not match yyyy-MM-dd or yyyy-MM-ddTHH:mm:ss.SSSZ", function(){
           expect(dateUtil.formatDateInStrictMode('10-02-1994')).toBe('10-02-1994');

       })

    });

    describe("getDateTimeInSpecifiedFormat", function(){
        it("should return the date in the specified format, say \"dddd, MMMM Do YYYY\"", function(){
            expect(dateUtil.getDateTimeInSpecifiedFormat("2016-06-10T10:36:21.310", "dddd, MMMM Do YYYY")).toBe("Friday, June 10th 2016");
        })

        it("should return null if date is not passed and say format is \"dddd, MMMM Do YYYY, HH:mm:ss\"", function(){
            expect(dateUtil.getDateTimeInSpecifiedFormat(undefined, "dddd, MMMM Do YYYY, HH:mm:ss")).toBe(null);
        })

    });

    describe("subtractISOWeekdays", function () {
        it("should return weekday 1(Monday) when given weekday(Tuesday) subtracted to 1 weekday", function () {
            expect(dateUtil.subtractISOWeekDays('2020-03-10T10:36:21.310', 1)).toBe(1);
        });
        it("should return weekday 3(Wednesday) when given weekday(Tuesday) subtracted to 6 weekdays", function () {
            expect(dateUtil.subtractISOWeekDays('2020-03-10T10:36:21.310', 6)).toBe(3);
        });
        it("should return same weekday when number of days to subtract is undefined", function () {
            expect(dateUtil.subtractISOWeekDays('2020-03-10T10:36:21.310', undefined)).toBe(2);
        });
    });
    describe("getWeekStartDate", function () {
        it("should return day code as 1 when start of week is passed as 1 (Monday) for given date 2020-03-10 (Tuesday)", function () {
            expect(dateUtil.getWeekStartDate('2020-03-10T10:36:21.310', 1).getDay()).toBe(1);
        })
    });
    describe("getWeekEndDate", function () {
        it("should return the week end date for the given week start date", function () {
            expect(dateUtil.getWeekEndDate('2020-03-10T10:36:21.310').getDate()).toBe(16);
        });
    });
});
