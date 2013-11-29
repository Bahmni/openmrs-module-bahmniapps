'use strict';

describe("dateUtil", function(){
    var dateUtil;
    beforeEach(module('registration.util'));
    beforeEach(inject(['dateUtil', function(dateUtilInjected){
        dateUtil = dateUtilInjected;
    }]));

    describe('diffInYearsMonthsDays', function(){
        it("should calculate difference between dates when month and day are same", function(){
            var fromDate = new Date("2011-06-21");
            var toDate = new Date("2013-06-21");

            var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

            expect(period.years).toBe(2);
            expect(period.months).toBe(0);
            expect(period.days).toBe(0);
        });

        it("should calculate difference between dates when  month of fromDate is lesser than  month  of toDate`", function(){
            var fromDate = new Date("2011-08-21");
            var toDate = new Date("2013-06-21");

            var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

            expect(period.years).toBe(1);
            expect(period.months).toBe(10);
            expect(period.days).toBe(0);
        });

        describe('when fromDate is february', function(){
            it("should calculate difference between dates when fromDate is non-leap year", function(){
                var fromDate = new Date("2011-02-26");
                var toDate = new Date("2011-03-15");

                var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

                expect(period.years).toBe(0);
                expect(period.months).toBe(0);
                expect(period.days).toBe(17);
            });

            it("should calculate difference between dates when fromDate is leap year", function(){
                var fromDate = new Date("2012-02-26");
                var toDate = new Date("2012-03-15");

                var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

                expect(period.years).toBe(0);
                expect(period.months).toBe(0);
                expect(period.days).toBe(18);
            });
        });


        describe("when day of fromDate is lesser than day of toDate", function(){
            it("should calculate difference between dates when month previous to toDate has 30 days", function(){
                var fromDate = new Date("2013-07-21");
                var toDate = new Date("2013-08-15");

                var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

                expect(period.years).toBe(0);
                expect(period.months).toBe(0);
                expect(period.days).toBe(25);
            });
        

            it("should calculate difference between dates when month previous to toDate has 30 days", function(){
                var fromDate = new Date("2013-09-21");
                var toDate = new Date("2013-10-15");

                var period = dateUtil.diffInYearsMonthsDays(fromDate, toDate);

                expect(period.years).toBe(0);
                expect(period.months).toBe(0);
                expect(period.days).toBe(24);
            });
        })
    });
});