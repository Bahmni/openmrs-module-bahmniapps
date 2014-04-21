describe('DateUtil',function(){
    var dateUtil = Bahmni.Common.Util.DateUtil;

    it("should be true if two dates are same irrespective of time", function() {
        expect(dateUtil.isSameDate("2014-01-20T11:12:13.000Z", "2014-01-20T00:00:00.000Z")).toBeTruthy();
        expect(dateUtil.isSameDate("2014-01-20T11:12:13.000+0530", "2014-01-20T00:00:00.000+0530")).toBeTruthy();
        expect(dateUtil.isSameDate("2014-01-21T11:12:13.000Z", "2014-01-20T00:00:00.000Z")).toBeFalsy();
        expect(dateUtil.isSameDate(undefined, new Date().toString())).toBeFalsy();
        expect(dateUtil.isSameDate(new Date().toString(), null)).toBeFalsy();
    });
    
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
	
	describe("getDayNumber", function(){
		it('should return 1 when date and reference date are same',function(){
			var refDate = new Date('2013','12','05','10','30');
			var date = new Date('2013','12','05','10','30');
			expect(dateUtil.getDayNumber(refDate, date)).toBe(1);
		});

		it('should return 2 when date and reference date are in differnt days and difference is less than 24 hrs',function(){
			var refDate = new Date('2013','12','04','22','30');
			var date = new Date('2013','12','05','10','30');
			expect(dateUtil.getDayNumber(refDate, date)).toBe(2);
		});

		it('should return 2 when date and reference date are in differnt days and difference is between 24 hrs to 48 hrs',function(){
			var refDate = new Date('2013','12','04','10','30');
			var date = new Date('2013','12','05','18','30');
			
			expect(dateUtil.getDayNumber(refDate, date)).toBe(2);
		});
	});	
});