describe("CompundObservationNode", function() {
	var CompundObservationNode = Bahmni.ConceptSet.CompundObservationNode;
	var build = Bahmni.Tests.openMRSConceptMother.build;
	var compoundObservationConcept = Bahmni.Tests.openMRSConceptMother.buildCompoundObservationConcept()

	describe("onValueChanged", function() {
		describe("for numeric observation", function() {
			var node;
			
			beforeEach(function() {
				var primaryObservation = {};
				var primaryConcept = build({name: "Pulse", dataTypeName: "Numeric",hiAbsolute: 10, lowAbsolute: 2});
				var conceptUIConfig = {};
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
});