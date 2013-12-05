describe('visit Day',function(){
	var encounterTransactions = [];	
	var consultationNoteConcept = {uuid: 'noteUuid'};
	var labOrderTypeUuid = 'safsafds';
	var orderTypes = { };
	var provider = {uuid: 'hjjhjhj', name: 'Dr. Vinkesh Banka'}
	orderTypes[Bahmni.Opd.Consultation.Constants.orderTypes.lab] = labOrderTypeUuid;
	
	var createEncounter = function(encounterData) {
		var encounterTransaction = {observations: [], drugOrders: [], testOrders: [], providers: [provider]} 
		angular.extend(encounterTransaction, encounterData)
		return encounterTransaction;
	}

	var createVisitDay = function() {
		return Bahmni.Opd.Consultation.VisitDay.create('1', new Date('2013-12-02'), encounterTransactions, consultationNoteConcept, orderTypes);
	}

	describe('create',function(){	
		it('should separate obs into consultation note and remaining observations', function(){
			var observation11 = {concept: { uuid: '11'},  voided: true, value: "142"}
			var observation12 = {concept: { uuid: '12'},  voided: false, value: "67"}
			var observation21 = {concept: { uuid: consultationNoteConcept.uuid},  voided: false, value: "The patient has cough"}
			var observation22 = {concept: { uuid: '22'},  voided: false, value: "Done"}
			var encounterTransaction1 = createEncounter({observations: [observation11, observation12]}) 
			var encounterTransaction2 = createEncounter({observations: [observation21, observation22]});
			encounterTransactions = [encounterTransaction1, encounterTransaction2];

			var visitDay = createVisitDay();

			expect(visitDay.observations.length).toBe(2);
			expect(visitDay.consultationNotes.length).toBe(1);
		});

		it('should ignore obs without value', function(){
			var observation11 = {concept: { uuid: '11'},  voided: false, value: ""}
			var observation12 = {concept: { uuid: '12'},  voided: false, value: "67"}
			var encounterTransaction1 = createEncounter({observations: [observation11, observation12]}) 
			encounterTransactions = [encounterTransaction1];

			var visitDay = createVisitDay();

			expect(visitDay.observations.length).toBe(1);
		});	

		it('should map observations ignoring voided ones', function(){
			var observation11 = {concept: { uuid: '11'},  voided: true, value: "dsdsd"}
			var observation12 = {concept: { uuid: '12'},  voided: false, value: "67"}
			var encounterTransaction1 = createEncounter({observations: [observation11, observation12]}) 
			encounterTransactions = [encounterTransaction1];

			var visitDay = createVisitDay();
			
			expect(visitDay.observations.length).toBe(1);
			expect(visitDay.observations[0].concept).toEqual(observation12.concept);
			expect(visitDay.observations[0].provider).toEqual(provider);
		});

		it('should map drug orders ignoring voided ones ', function(){
			var drugorder11 = {concept: { uuid: '11'},  voided: true}
			var drugorder12 = {concept: { uuid: '12'},  voided: false}
			encounterTransactions = [ createEncounter({drugOrders: [drugorder11, drugorder12]}) ];

			var visitDay = createVisitDay();
			
			expect(visitDay.drugOrders.length).toBe(1);			
			expect(visitDay.drugOrders[0].concept).toEqual(drugorder12.concept);
			expect(visitDay.drugOrders[0].provider).toEqual(provider);
		});

		it('should map test orders into lab and others test orders, ignoring voided test orders', function(){
			var testorder11 = {concept: { uuid: '11'},  voided: false, orderTypeUuid: labOrderTypeUuid}
			var testorder12 = {concept: { uuid: '12'},  voided: false, orderTypeUuid: 'someOtherUuid'}
			var testorder13 = {concept: { uuid: '13'},  voided: true, orderTypeUuid: 'voidedOrderUuid'}
			encounterTransactions = [ createEncounter({testOrders: [testorder11, testorder12]}) ];

			var visitDay = createVisitDay();
			
			expect(visitDay.labTestOrders.length).toBe(1);
			expect(visitDay.labTestOrders[0].concept).toEqual(testorder11.concept);
			expect(visitDay.labTestOrders[0].provider).toEqual(provider);
			expect(visitDay.otherTestOrders.length).toBe(1);
			expect(visitDay.otherTestOrders[0].concept).toEqual(testorder12.concept);			
			expect(visitDay.otherTestOrders[0].provider).toEqual(provider);			
		});
	})
})