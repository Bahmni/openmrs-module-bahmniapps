'use strict';

describe("ConceptSetSection", function() {
	var ConceptSetSection = Bahmni.ConceptSet.ConceptSetSection;

	var conceptSet = {name:{name:"vitals"}}
    describe("isAvailable", function() {
		it("should be true if 'showIf' condition is not defined", function() {
			expect(new ConceptSetSection([{extensionParams:{conceptName:"vitals"}}],[],conceptSet).isAvailable()).toBe(true);
			expect(new ConceptSetSection([{extensionParams:{conceptName:"vitals", showIf: null }}],[],conceptSet).isAvailable()).toBe(true);
		});

		it("should be false if 'showIf' condition returns false", function() {
			var conceptSetSection = new ConceptSetSection([{extensionParams:{conceptName:"vitals", showIf: ["return false;"] }}],[],conceptSet);

			expect(conceptSetSection.isAvailable()).toBe(false);
		});

		it("should be true if 'showIf' condition returns true", function() {
			var conceptSetSection = new ConceptSetSection([{extensionParams:{conceptName:"vitals", showIf: ["return true;"] }}],[],conceptSet);

			expect(conceptSetSection.isAvailable()).toBe(true);
		});

		it("should pass the context to the showIf function", function() {
			var context = {visitTypeName: 'OPD', patient: {gender: 'M'} };
			var extensionParams = [
				{
					extensionParams:{
						showIf: ["if(context.visitTypeName === 'OPD' && context.patient.gender === 'M')",
									"return true;",
								 "else",
								    "return false;"
								],
						conceptName:"vitals"
					}
				}
			];
			var conceptSetSection = new ConceptSetSection(extensionParams,[],conceptSet);

			expect(conceptSetSection.isAvailable(context)).toBe(true);
		});
    });

	describe("isAdded",function(){
		var config = [
			{
				extensionParams:{
					default:true,
					conceptName:"vitals"
				}
			}
		];


		it("should be true if concept set is configured to be default",function(){
			var conceptSetSection = new ConceptSetSection(config,[],conceptSet);
			expect(conceptSetSection.isAdded).toBe(true);
		})

		it("should be true if concept set observation has at least one value set, even if its not default",function(){
			var observations = [{concept:{name:"vitals"},value:"12"},{concept:{name:"second vitals"},value:""}];
			var conceptSetSection = new ConceptSetSection({},observations,conceptSet);
			expect(conceptSetSection.isAdded).toBe(true);
		})

		it("should be false if concept set has no observations",function(){
			var observations = [{concept:{name:"vitals"},value:""}];
			var conceptSetSection = new ConceptSetSection({},observations,conceptSet);
			expect(conceptSetSection.isAdded).toBe(false);

			var conceptSetSection = new ConceptSetSection({},[],conceptSet);
			expect(conceptSetSection.isAdded).toBe(false);
		})
	});

	describe("isOpen",function(){
		it("should be true if conceptSet observations has value",function(){
			var observations = [{concept:{name:"vitals"},value:"12"},{concept:{name:"second vitals"},value:""}];
			var conceptSetSection = new ConceptSetSection({},observations,conceptSet);
			expect(conceptSetSection.isOpen).toBe(true);
		})
	});

	describe("toggleAdded",function(){
		var config = [
			{
				extensionParams:{
					default:true,
					conceptName:"vitals"
				}
			}
		];

		it("should return false if conceptSet observations has value",function(){
			var observations = [{concept:{name:"vitals"},value:"12"},{concept:{name:"second vitals"},value:""}];
			var conceptSetSection = new ConceptSetSection({},observations,conceptSet);
			expect(conceptSetSection.toggleAdded()).toBe(false);
		})

		it("should return true if conceptSet observations has no value",function(){
			var observations = [{concept:{name:"vitals"},value:""}];
			var conceptSetSection = new ConceptSetSection(config,observations,conceptSet);
			expect(conceptSetSection.toggleAdded()).toBe(true);
		})
	})


});