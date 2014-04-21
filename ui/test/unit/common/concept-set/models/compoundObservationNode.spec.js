'use strict';

describe("CompundObservationNode", function() {
	var CompundObservationNode = Bahmni.ConceptSet.CompundObservationNode;
	var buildMRSConcept = Bahmni.Tests.openMRSConceptMother.build;
	var compoundObservationConcept = Bahmni.Tests.openMRSConceptMother.buildCompoundObservationConcept()
	var buildConcept = Bahmni.Tests.conceptMother.build;
    var buildObservation = Bahmni.Tests.observationMother.build;
    var mapConcept = new Bahmni.ConceptSet.ConceptMapper().map;
	var conceptUIConfig, primaryObservation, primaryMRSConcept, node, primaryConcept;
	
	describe("create", function() {
	 	describe("for multiselect", function() {
			beforeEach(function() {
				primaryMRSConcept = buildMRSConcept({name: "Complaints", dataType: "Coded"});
				primaryConcept = mapConcept(primaryMRSConcept)
				conceptUIConfig = {multiselect: true};
			});

			it("shoud initialize value to an array of primary observation's values", function() {
			 	var coughConcept = buildConcept({name: "Cough"});
			 	var chestPainConcept = buildConcept({name: "Chest Pain"});
			 	var coughObservation = buildObservation({concept: primaryConcept, value: coughConcept});
			 	var chestPainbservation = buildObservation({concept: primaryConcept, value: chestPainConcept});
			 	var compoundObservation = buildObservation({groupMembers: [coughObservation, chestPainbservation]});
				node = new CompundObservationNode(compoundObservation, primaryMRSConcept, compoundObservationConcept, conceptUIConfig);
			 	
			 	var value = node.value;

			 	expect(value.length).toBe(2);
				expect(value).toContain(coughConcept);
				expect(value).toContain(chestPainConcept);
			});

			it("shoud ignore the voided observation's", function() {
			 	var coughConcept = buildConcept({name: "Cough"});
			 	var chestPainConcept = buildConcept({name: "Chest Pain"});
			 	var coughObservation = buildObservation({voided: true, concept: primaryConcept, value: coughConcept});
			 	var chestPainbservation = buildObservation({concept: primaryConcept, value: chestPainConcept});
			 	var compoundObservation = buildObservation({groupMembers: [coughObservation, chestPainbservation]});
				node = new CompundObservationNode(compoundObservation, primaryMRSConcept, compoundObservationConcept, conceptUIConfig);
			 	
			 	var value = node.value;

			 	expect(value.length).toBe(1);
				expect(value).toContain(chestPainConcept);
			});
	 	});
	});

	describe("hasValue", function() {
		beforeEach(function() {
			primaryMRSConcept = buildMRSConcept({});
			node = new CompundObservationNode(buildObservation(), primaryMRSConcept, compoundObservationConcept, {});
		});

		it("should be false when value is empty string or null or undefined", function() {
			node.value = '';
			expect(node.hasValue()).toBe(false);

			node.value = null;
			expect(node.hasValue()).toBe(false);

			node.value = undefined;
			expect(node.hasValue()).toBe(false);
		});

		it("should be false when value is empty array", function() {
			node.value = [];

			expect(node.hasValue()).toBe(false);
		});

		it("should be true when value is non empty array", function() {
			node.value = [buildConcept()];

			expect(node.hasValue()).toBe(true);
		});

		it("should be true when value is not empty", function() {
			node.value = 'foo';
			expect(node.hasValue()).toBe(true);

			node.value = 10;
			expect(node.hasValue()).toBe(true);
		});

		it("should be true when value is 0", function() {
			node.value = 0;

			expect(node.hasValue()).toBe(true);
		});

		it("should be true when value is false", function() {
			node.value = false;

			expect(node.hasValue()).toBe(true);
		});
	});

	describe("on changing value", function() {
		describe("for numeric observation", function() {
			beforeEach(function() {
				primaryMRSConcept = buildMRSConcept({name: "Pulse", dataType: "Numeric", hiNormal: 10, lowNormal: 2});
				node = new CompundObservationNode(buildObservation(), primaryMRSConcept, compoundObservationConcept, {});
			});

			it("should set abnormality to true when value is beyond max", function() {
				node.value = 11;

				expect(node.abnormalityObservation.value).toBe(true);
			});

			it("should set abnormality to true when value is below min", function() {
				node.value = 1;

				expect(node.abnormalityObservation.value).toBe(true);
			});

			it("should set abnormality to false when value is in range", function() {
				node.value = 9;
				
				expect(node.abnormalityObservation.value).toBe(false);
			});

			it("should set abnormality to undefined when value is not set", function() {
				node.value = "";
				
				expect(node.abnormalityObservation.value).toBe(undefined);
			});
		});

		describe("for single value observation", function() {
			beforeEach(function() {
				primaryMRSConcept = buildMRSConcept({});
				node = new CompundObservationNode(buildObservation(), primaryMRSConcept, compoundObservationConcept, {});
			});

			it("should clear abnormality observation value when primary is cleared", function() {
				node.abnormalityObservation.value = true;

				node.value = '';

				expect(node.abnormalityObservation.value).toBe(undefined);		  
			});
		});



		describe("for multiselect value", function() {
			beforeEach(function() {
				primaryMRSConcept = buildMRSConcept({name: "Complaints", dataType: "Coded"});
				primaryConcept = mapConcept(primaryMRSConcept)
				conceptUIConfig = {multiselect: true};
			});

			it("should add an observation for each new value", function() {
			 	var coughConcept = buildConcept({name: "Cough"});
			 	var chestPainConcept = buildConcept({name: "Chest Pain"});
				node = new CompundObservationNode(buildObservation(), primaryMRSConcept, compoundObservationConcept, conceptUIConfig);
			 	
			 	node.value = [coughConcept, chestPainConcept];

			 	expect(node.compoundObservation.groupMembers.length).toBe(2 + 1);
			 	expect(node.compoundObservation.groupMembers[0].concept.name).toBe("IS_ABNORMAL");
			 	expect(node.compoundObservation.groupMembers[1].concept.name).toBe("Complaints");
			 	expect(node.compoundObservation.groupMembers[1].value).toBe(coughConcept);
			 	expect(node.compoundObservation.groupMembers[2].concept.name).toBe("Complaints");
			 	expect(node.compoundObservation.groupMembers[2].value).toBe(chestPainConcept);
			});

			it("should remove newly added observation when value is removed", function() {
			 	var coughConcept = buildConcept({name: "Cough"});
			 	var chestPainConcept = buildConcept({name: "Chest Pain"});
				node = new CompundObservationNode(buildObservation(), primaryMRSConcept, compoundObservationConcept, conceptUIConfig);
			 	
			 	node.value = [coughConcept, chestPainConcept];
			 	node.value = [coughConcept];

			 	expect(node.compoundObservation.groupMembers.length).toBe(1 + 1);
			 	expect(node.compoundObservation.groupMembers[0].concept.name).toBe("IS_ABNORMAL");
			 	expect(node.compoundObservation.groupMembers[1].concept.name).toBe("Complaints");
			 	expect(node.compoundObservation.groupMembers[1].value).toBe(coughConcept);
			});

			it("should retain the previous observation when value is retained", function() {
			 	var coughConcept = buildConcept({name: "Cough"});
			 	var chestPainConcept = buildConcept({name: "Chest Pain"});
			 	var coughObservation = buildObservation({concept: primaryConcept, value: coughConcept});
			 	var compoundObservation = buildObservation({groupMembers: [coughObservation]});
				node = new CompundObservationNode(compoundObservation, primaryMRSConcept, compoundObservationConcept, conceptUIConfig);
			 	
			 	node.value = [coughConcept, chestPainConcept];

			 	expect(node.compoundObservation.groupMembers.length).toBe(2 + 1);
			 	expect(node.compoundObservation.groupMembers[0].concept.name).toBe("Complaints");
			 	expect(node.compoundObservation.groupMembers[0].uuid).toBe(coughObservation.uuid);
			 	expect(node.compoundObservation.groupMembers[0].value).toBe(coughConcept);
			 	expect(node.compoundObservation.groupMembers[2].concept.name).toBe("Complaints");
			 	expect(node.compoundObservation.groupMembers[2].uuid).toBe(undefined);
			 	expect(node.compoundObservation.groupMembers[2].value).toBe(chestPainConcept);
			});

			it("should void the previous observation when value is removed", function() {
			 	var coughConcept = buildConcept({name: "Cough"});
			 	var chestPainConcept = buildConcept({name: "Chest Pain"});
			 	var coughObservation = buildObservation({concept: primaryConcept, value: coughConcept});
			 	var compoundObservation = buildObservation({groupMembers: [coughObservation]});
				node = new CompundObservationNode(compoundObservation, primaryMRSConcept, compoundObservationConcept, conceptUIConfig);
			 	
			 	node.value = [chestPainConcept];

			 	expect(node.compoundObservation.groupMembers.length).toBe(2 + 1);
			 	expect(node.compoundObservation.groupMembers[0].concept.name).toBe("Complaints");
			 	expect(node.compoundObservation.groupMembers[0].uuid).toBe(coughObservation.uuid);
			 	expect(node.compoundObservation.groupMembers[0].value).toBe(coughConcept);
			 	expect(node.compoundObservation.groupMembers[0].voided).toBe(true);
			 	expect(node.compoundObservation.groupMembers[2].concept.name).toBe("Complaints");
			 	expect(node.compoundObservation.groupMembers[2].uuid).toBe(undefined);
			 	expect(node.compoundObservation.groupMembers[2].value).toBe(chestPainConcept);
			});

			it("should un-void the previous observation when value is removed and added again", function() {
			 	var coughConcept = buildConcept({name: "Cough"});
			 	var chestPainConcept = buildConcept({name: "Chest Pain"});
			 	var coughObservation = buildObservation({concept: primaryConcept, value: coughConcept, voided: true});
			 	var compoundObservation = buildObservation({groupMembers: [coughObservation]});
				node = new CompundObservationNode(compoundObservation, primaryMRSConcept, compoundObservationConcept, conceptUIConfig);
			 	
			 	node.value = [coughConcept, chestPainConcept];

			 	expect(node.compoundObservation.groupMembers.length).toBe(2 + 1);
			 	expect(node.compoundObservation.groupMembers[0].concept.name).toBe("Complaints");
			 	expect(node.compoundObservation.groupMembers[0].uuid).toBe(coughObservation.uuid);
			 	expect(node.compoundObservation.groupMembers[0].value).toBe(coughConcept);
			 	expect(node.compoundObservation.groupMembers[0].voided).toBe(false);
			 	expect(node.compoundObservation.groupMembers[2].concept.name).toBe("Complaints");
			 	expect(node.compoundObservation.groupMembers[2].uuid).toBe(undefined);
			 	expect(node.compoundObservation.groupMembers[2].value).toBe(chestPainConcept);
			});
			
			it("should clear abnormality observation value when primary is cleared", function() {
				node.abnormalityObservation.value = true;

				node.value = [];

				expect(node.abnormalityObservation.value).toBe(undefined);		  
			});
		});
	});

	describe("atLeastOneValueSet", function() {
		beforeEach(function() {
			primaryMRSConcept = buildMRSConcept({name: "Vitals"});
			conceptUIConfig = {};
		});

		var createNode = function(conceptName, value) {
			var primaryObservation = {value: value, concept: {name: conceptName}};
			var compoundObservation = {groupMembers: [primaryObservation]};
			return new CompundObservationNode(compoundObservation, primaryMRSConcept, compoundObservationConcept, conceptUIConfig);
		}
		
		it("should be true if value of one of immediate child is set", function() {
			var pulseNode = createNode("Pulse");
			var sugarNode = createNode("Sugar");
			var vitalsNode = createNode("Vitals")
			vitalsNode.children = [pulseNode, sugarNode];
			
			sugarNode.value = '';
			pulseNode.value = 10;

			expect(vitalsNode.atLeastOneValueSet()).toBe(true);
		});

		it("should be true if value of one of second level child is set", function() {
			var systolicNode = createNode("systolic");
			var diastolicNode = createNode("diastolic");
			var bpNode = createNode("BP");
			var vitalsNode = createNode("Vitals")
			bpNode.children = [systolicNode, diastolicNode];
			vitalsNode.children = [bpNode];
			
			diastolicNode.value = '';
			systolicNode.value = 10;

			expect(vitalsNode.atLeastOneValueSet()).toBe(true);
		});

		it("should be false if none of child or their children value is set", function() {
			var systolicNode = createNode("systolic");
			var diastolicNode = createNode("diastolic");
			var bpNode = createNode("BP");
			var vitalsNode = createNode("Vitals")
			bpNode.children = [systolicNode, diastolicNode];
			vitalsNode.children = [bpNode];
			
			diastolicNode.value = '';
			systolicNode.value = '';

			expect(vitalsNode.atLeastOneValueSet()).toBe(false);
		});

		it("should be false if group has value and none of the children has value", function() {
			var systolicNode = createNode("systolic");
			var diastolicNode = createNode("diastolic");
			var bpNode = createNode("BP");
			var vitalsNode = createNode("Vitals")
			bpNode.children = [systolicNode, diastolicNode];
			vitalsNode.children = [bpNode];
			
			bpNode.value = '110, 180';
			diastolicNode.value = '';
			systolicNode.value = '';

			expect(vitalsNode.atLeastOneValueSet()).toBe(false);
		});
	});
});