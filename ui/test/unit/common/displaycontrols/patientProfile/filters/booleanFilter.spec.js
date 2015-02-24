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