/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


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


