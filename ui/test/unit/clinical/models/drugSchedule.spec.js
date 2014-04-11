describe("DrugSchedule", function() {
	var visit;
	var DrugSchedule = Bahmni.Clinical.DrugSchedule;
	var DateUtil = Bahmni.Common.Util.DateUtil;
	
	var createDrugOrder = function(name, startDate, endDate) {
		return {drugName: name, startDate: startDate, endDate: endDate}
	}


	beforeEach(function() {
		visit = jasmine.createSpyObj('visit', ['getAdmissionDate', 'getDischargeDate']);
	});
	
	describe("create", function() {
		it("should initialize DrugSchedule with visit admission date, discharge date and drug orders within these dates", function() {
		  	visit.getAdmissionDate.andReturn(DateUtil.parse('2014-04-10T15:52:59.000+0530'));	  
		  	visit.getDischargeDate.andReturn(DateUtil.parse('2014-04-20T15:52:59.000+0530'));
		  	var beclomateAfterDischarge = createDrugOrder('Beclomate', '2014-04-21T15:55:00.000+0530', '2014-04-26T15:52:59.000+0530');
		  	var calpolAfterAdmissionBeforeDishcarge = createDrugOrder('Calpol', '2014-04-15T15:55:00.000+0530', '2014-04-18T15:52:59.000+0530');
		  	var amoxyBeforeAdmissionAfterDishcarge = createDrugOrder('Amoxy', '2014-04-06T11:52:00.000+0530', '2014-04-22T11:52:59.000+0530');
		  	var paracetamolBeforeAdmission = createDrugOrder('Paracetamol', '2014-04-04T11:52:00.000+0530', '2014-04-09T11:52:59.000+0530');
		  	visit.drugOrders = [beclomateAfterDischarge, calpolAfterAdmissionBeforeDishcarge, amoxyBeforeAdmissionAfterDishcarge, paracetamolBeforeAdmission];

		  	var drugSchedule = DrugSchedule.create(visit);

		  	expect(drugSchedule.fromDate).toBe(visit.getAdmissionDate());
		  	expect(drugSchedule.toDate).toBe(visit.getDischargeDate());
		  	expect(drugSchedule.drugOrders.length).toBe(2);
		  	expect(drugSchedule.drugOrders[0].drugName).toBe('Calpol');
		  	expect(drugSchedule.drugOrders[1].drugName).toBe('Amoxy');
		});

		it("should initialize end date to today when discharge date is not provided", function() {
		  	visit.getAdmissionDate.andReturn(DateUtil.parse('2014-04-10T15:52:59.000+0530'));	  
		  	visit.getDischargeDate.andReturn(null);
		  	spyOn(DateUtil, 'now').andReturn(DateUtil.parse('2014-04-20T15:52:59.000+0530'))
		  	var calpolAfterAdmission = createDrugOrder('Calpol', '2014-04-15T15:55:00.000+0530', '2014-04-18T15:52:59.000+0530');
		  	var amoxyBeforeAdmissionBeforeToday = createDrugOrder('Amoxy', '2014-04-06T11:52:00.000+0530', '2014-04-22T11:52:59.000+0530');
		  	var paracetamolBeforeAdmission = createDrugOrder('Paracetamol', '2014-04-04T11:52:00.000+0530', '2014-04-09T11:52:59.000+0530');
		  	visit.drugOrders = [calpolAfterAdmission, amoxyBeforeAdmissionBeforeToday, paracetamolBeforeAdmission];

		  	var drugSchedule = DrugSchedule.create(visit);

		  	expect(drugSchedule.fromDate).toBe(visit.getAdmissionDate());
		  	expect(drugSchedule.toDate).toBe(DateUtil.now());
		  	expect(drugSchedule.drugOrders.length).toBe(2);
		  	expect(drugSchedule.drugOrders[0].drugName).toBe('Calpol');
		  	expect(drugSchedule.drugOrders[1].drugName).toBe('Amoxy');
		});
	});

	describe("getDays", function() {
		it("should get days from fromDate to toDate", function() {
		  	var fromDate = DateUtil.parse('2014-04-10T15:52:59.000+0530');
		  	var toDate = DateUtil.parse('2014-04-12T16:52:59.000+0530');
			var drugSchedule = new DrugSchedule(fromDate, toDate, []);

			var days = drugSchedule.getDays();

			expect(days.length).toBe(3);
			expect(days[0].dayNumber).toBe(1);
			expect(days[0].date).toEqual(DateUtil.parse('2014-04-10'));
			expect(days[1].dayNumber).toBe(2);
			expect(days[1].date).toEqual(DateUtil.parse('2014-04-11'));
			expect(days[2].dayNumber).toBe(3);
			expect(days[2].date).toEqual(DateUtil.parse('2014-04-12'));
		});

		it("should consider actual days covered, ignoring time", function() {
		  	var fromDate = DateUtil.parse('2014-04-10T15:52:59.000+0530');
		  	var toDate = DateUtil.parse('2014-04-12T14:52:59.000+0530');
			var drugSchedule = new DrugSchedule(fromDate, toDate, []);

			var days = drugSchedule.getDays();

			expect(days.length).toBe(3);
			expect(days[0].date).toEqual(DateUtil.parse('2014-04-10'));
			expect(days[1].date).toEqual(DateUtil.parse('2014-04-11'));
			expect(days[2].date).toEqual(DateUtil.parse('2014-04-12'));
		});
	});
});