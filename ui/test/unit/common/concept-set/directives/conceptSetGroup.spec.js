'use strict';

describe("ConceptSetSection", function() {
	var ConceptSetSection = Bahmni.ConceptSet.ConceptSetSection;

    describe("isAvailable", function() {
		it("should be true if 'showIf' condition is not defined", function() {
			expect(new ConceptSetSection({}).isAvailable()).toBe(true);
			expect(new ConceptSetSection({ showIf: null }).isAvailable()).toBe(true);
		});

		it("should be false if 'showIf' condition returns false", function() {
			var conceptSetSection = new ConceptSetSection({ showIf: ["return false;"] });

			expect(conceptSetSection.isAvailable()).toBe(false);
		});

		it("should be true if 'showIf' condition returns true", function() {
			var conceptSetSection = new ConceptSetSection({ showIf: ["return true;"] });

			expect(conceptSetSection.isAvailable()).toBe(true);
		});

		it("should pass the context to the showIf function", function() {
			var context = {vistitTypeName: 'OPD', patient: {gender: 'M'} };
			var extensionParams = { 
				showIf: ["if(context.vistitTypeName === 'OPD' && context.patient.gender === 'M')", 
							"return true;",
						 "else",
						 	"return false;"
						] 
			};
			var conceptSetSection = new ConceptSetSection(extensionParams);

			expect(conceptSetSection.isAvailable(context)).toBe(true);
		});
    });
});