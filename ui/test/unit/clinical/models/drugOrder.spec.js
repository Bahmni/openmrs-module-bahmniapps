describe("DrugOrder", function() {
	var DrugOrder = Bahmni.Clinical.DrugOrder;
	var DateUtil = Bahmni.Common.Util.DateUtil;
	
	describe("isDrugConsumedOnDate", function() {
		it("should be true when date is between start date and end date", function() {
			var drugOrder = new DrugOrder({
				startDate: DateUtil.parse('2014-04-10T15:52:59.000+0530'),
				endDate: DateUtil.parse('2014-04-11T15:52:59.000+0530')
			});

			expect(drugOrder.isDrugConsumedOnDate(DateUtil.parse('2014-04-09'))).toBe(false);
			expect(drugOrder.isDrugConsumedOnDate(DateUtil.parse('2014-04-10'))).toBe(true);
			expect(drugOrder.isDrugConsumedOnDate(DateUtil.parse('2014-04-11'))).toBe(true);
			expect(drugOrder.isDrugConsumedOnDate(DateUtil.parse('2014-04-12'))).toBe(false);
		});
	});
});