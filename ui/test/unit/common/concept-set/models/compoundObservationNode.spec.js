describe("CompundObservationNode", function() {
	var CompundObservationNode = Bahmni.ConceptSet.CompundObservationNode;
	var build = Bahmni.Tests.openMRSConceptMother.build;
	var compoundObservationConcept = Bahmni.Tests.openMRSConceptMother.buildCompoundObservationConcept()
	var conceptUIConfig, primaryObservation, primaryConcept, node;

	describe("onValueChanged", function() {
		describe("for numeric observation", function() {
			beforeEach(function() {
				primaryObservation = {};
				primaryConcept = build({name: "Pulse", dataTypeName: "Numeric",hiAbsolute: 10, lowAbsolute: 2});
				conceptUIConfig = {};
				node = CompundObservationNode.createNew(primaryObservation, primaryConcept, compoundObservationConcept, conceptUIConfig);
			});

			it("should set abnormality to true when value is beyond max", function() {
				node.primaryObservation.value = 11;

				node.onValueChanged();

				expect(node.abnormalityObservation.value).toBe(true);
			});

			it("should set abnormality to true when value is below min", function() {
				node.primaryObservation.value = 1;

				node.onValueChanged();

				expect(node.abnormalityObservation.value).toBe(true);
			});

			it("should set abnormality to false when value is in range", function() {
				node.primaryObservation.value = 9;
				
				node.onValueChanged();

				expect(node.abnormalityObservation.value).toBe(false);
			});

			it("should set abnormality to undefined when value is not set", function() {
				node.primaryObservation.value = "";
				
				node.onValueChanged();

				expect(node.abnormalityObservation.value).toBe(undefined);
			});
		});
	});

	describe("atLeastOneValueSet", function() {
		beforeEach(function() {
			primaryConcept = build({name: "Vitals"});
			conceptUIConfig = {};
		});

		var createNode = function(conceptName, value) {
			return CompundObservationNode.createNew({value: value, concpet: {name: conceptName}}, primaryConcept, compoundObservationConcept, conceptUIConfig);
		}
		
		it("should be true if value of one of immediate child is set", function() {
			var pulseNode = createNode("Pulse");
			var sugarNode = createNode("Sugar");
			var vitalsNode = createNode("Vitals")
			vitalsNode.children = [pulseNode, sugarNode];
			
			sugarNode.primaryObservation.value = '';
			pulseNode.primaryObservation.value = 10;

			expect(vitalsNode.atLeastOneValueSet()).toBe(true);
		});

		it("should be true if value of one of second level child is set", function() {
			var systolicNode = createNode("systolic");
			var diastolicNode = createNode("diastolic");
			var bpNode = createNode("BP");
			var vitalsNode = createNode("Vitals")
			bpNode.children = [systolicNode, diastolicNode];
			vitalsNode.children = [bpNode];
			
			diastolicNode.primaryObservation.value = '';
			systolicNode.primaryObservation.value = 10;

			expect(vitalsNode.atLeastOneValueSet()).toBe(true);
		});

		it("should be false if none of child or their children value is set", function() {
			var systolicNode = createNode("systolic");
			var diastolicNode = createNode("diastolic");
			var bpNode = createNode("BP");
			var vitalsNode = createNode("Vitals")
			bpNode.children = [systolicNode, diastolicNode];
			vitalsNode.children = [bpNode];
			
			diastolicNode.primaryObservation.value = '';
			systolicNode.primaryObservation.value = '';

			expect(vitalsNode.atLeastOneValueSet()).toBe(false);
		});
	});
});