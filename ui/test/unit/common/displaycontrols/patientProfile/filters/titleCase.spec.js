/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

describe('title case', function(){

    beforeEach(function () {
        module('bahmni.common.displaycontrol.patientprofile');
    });

    it('has a titleCase filter', inject(function($filter) {
        expect($filter('titleCase')).not.toBeNull();
    }));

    it("should return true empty array ", inject(function (titleCaseFilter) {
        expect(titleCaseFilter("name middle last")).toBe("Name Middle Last");
    }));

});