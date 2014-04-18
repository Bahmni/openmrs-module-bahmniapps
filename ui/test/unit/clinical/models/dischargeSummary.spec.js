describe("DischgeSummary", function() {
	var buildObservation = Bahmni.Tests.observationMother.build;
	var buildConcept = Bahmni.Tests.conceptMother.build;
	var DateUtil = Bahmni.Common.Util.DateUtil;
	var visit;
	
	var createDrugOrder = function(name, startDate, endDate) {
		return {drugName: name, startDate: startDate, endDate: endDate};
	}

	beforeEach(function() {
		visit = jasmine.createSpyObj('visit', ['getDischargeDispositionEncounterDate']);
	});

	describe("getObservationValue", function() {
		it("should get value of observation", function() {
			var dateOfOperationObs = buildObservation({concept: buildConcept({name: 'Date Of Operation'}), value: '2014-04-01'});
			var compoundDateOfOperation = buildObservation({groupMembers: [dateOfOperationObs]});
			var dischgeSummaryObs = buildObservation({concept: buildConcept({name: 'Discharge Summary'}), groupMembers: [compoundDateOfOperation]});
			var compoundDischgeSummary = buildObservation({groupMembers: [dischgeSummaryObs]});
			visit.observations = [buildObservation({concept: buildConcept({name: 'Height'}), value: 50}), compoundDischgeSummary];
			
			var dischargeSummary = new Bahmni.Clinical.DischargeSummary(null, visit);

			expect(dischargeSummary.getObservationValue('Date Of Operation')).toBe('2014-04-01');
			expect(dischargeSummary.getObservationValue('Height')).toBe(50);
		});
	});

	describe("getTreatmentAdviced", function() {
		it("should drug orders after discharge disposition encounter date", function() {
		  	visit.getDischargeDispositionEncounterDate.andReturn(DateUtil.parse('2014-04-20T15:52:59.000+0530'));
		  	var calpolBeforeDishcarge = createDrugOrder('Calpol', '2014-04-15T15:55:00.000+0530', '2014-04-18T15:52:59.000+0530');
		  	var salbutamolDuringDichrageDisposition = createDrugOrder('Salbutamol', visit.getDischargeDispositionEncounterDate(), '2014-04-29T11:52:59.000+0530');
		  	var beclomateAfterDischarge = createDrugOrder('Beclomate', '2014-04-20T15:55:00.000+0530', '2014-04-26T15:52:59.000+0530');
		  	visit.drugOrders = [calpolBeforeDishcarge, salbutamolDuringDichrageDisposition, beclomateAfterDischarge];
			var dischargeSummary = new Bahmni.Clinical.DischargeSummary(null, visit);

			var advicedDrugOrders = dischargeSummary.getTreatmentAdviced();
			
			expect(advicedDrugOrders.length).toBe(2);
			expect(advicedDrugOrders[0]).toBe(salbutamolDuringDichrageDisposition);
			expect(advicedDrugOrders[1]).toBe(beclomateAfterDischarge);
		});

		it("should be empty if discharge disposition is not given", function() {
		  	visit.getDischargeDispositionEncounterDate.andReturn(null);
		  	var calpolBeforeDishcarge = createDrugOrder('Calpol', '2014-04-15T15:55:00.000+0530', '2014-04-18T15:52:59.000+0530');
		  	visit.drugOrders = [calpolBeforeDishcarge];
			var dischargeSummary = new Bahmni.Clinical.DischargeSummary(null, visit);

			var advicedDrugOrders = dischargeSummary.getTreatmentAdviced();
			
			expect(advicedDrugOrders.length).toBe(0);
		});
	});
});