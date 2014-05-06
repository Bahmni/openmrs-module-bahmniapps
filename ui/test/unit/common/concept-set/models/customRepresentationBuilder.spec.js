'use strict';

describe("CustomRepresentationBuilder", function() {
	var builder = Bahmni.ConceptSet.CustomRepresentationBuilder;
	describe("build", function() {
		it("should build custom representation recursively for given fields, child and number of levels", function() {
		  	expect(builder.build(['uuid'], 'members', 1)).toBe('(uuid,members:(uuid))')
		  	expect(builder.build(['name'], 'setMembers', 1)).toBe('(name,setMembers:(name))')
		  	expect(builder.build(['name'], 'setMembers', 2)).toBe('(name,setMembers:(name,setMembers:(name)))')
		});
	});
});


