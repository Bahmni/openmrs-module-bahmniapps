describe('DateUtile',function(){
	var DateUtil = Bahmni.Common.Util.DateUtil;

	describe("getDayNumber", function(){
		it('should return 1 when date and reference date are same',function(){
			var refDate = new Date('2013','12','05','10','30');
			var date = new Date('2013','12','05','10','30');
			expect(DateUtil.getDayNumber(refDate, date)).toBe(1);
		});

		it('should return 2 when date and reference date are in differnt days and difference is less than 24 hrs',function(){
			var refDate = new Date('2013','12','04','22','30');
			var date = new Date('2013','12','05','10','30');
			expect(DateUtil.getDayNumber(refDate, date)).toBe(2);
		});

		it('should return 2 when date and reference date are in differnt days and difference is between 24 hrs to 48 hrs',function(){
			var refDate = new Date('2013','12','04','10','30');
			var date = new Date('2013','12','05','18','30');
			
			expect(DateUtil.getDayNumber(refDate, date)).toBe(2);
		});
	});	
});