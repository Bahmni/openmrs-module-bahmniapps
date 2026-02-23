/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

describe("my boolean spec", function () {
    var booleanFilter;

    beforeEach(module('bahmni.common.displaycontrol.patientprofile'));
    beforeEach(inject(function($filter) {
      booleanFilter = $filter('booleanFilter');
    }));

    it("should return Yes when value is true", function() {
      expect(booleanFilter(true)).toBe('Yes');
    });

    it("should return No when value is false", function() {
      expect(booleanFilter(false)).toBe('No');
    });

    it("should return value otherwise", function() {
      expect(booleanFilter(1)).toBe(1);
      expect(booleanFilter("ABC")).toBe("ABC");
      expect(booleanFilter(0.1)).toBe(0.1);
      expect(booleanFilter(null)).toBe(null);
      expect(booleanFilter(undefined)).toBe(undefined);
    });
});