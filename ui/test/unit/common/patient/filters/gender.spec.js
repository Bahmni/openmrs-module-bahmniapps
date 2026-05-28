/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

describe("gender Filter", function () {
    var genderFilter, rootScope;

    beforeEach(module('bahmni.common.patient'));
    beforeEach(inject(function($filter, $rootScope) {
        genderFilter = $filter('gender');
        rootScope = $rootScope;
    }));

    it("should return Unknown when gender char is null", function() {
        expect(genderFilter(null)).toBe("Unknown");
    });

    it("should return respective mapped value", function() {
        rootScope.genderMap = {"M": "Male"};
        expect(genderFilter("m")).toBe("Male");
    });
});