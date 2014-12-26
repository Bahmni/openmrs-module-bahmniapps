'use strict';

describe("boolean Filter", function () {
    var booleanFilter;

    beforeEach(module('bahmni.clinical'));
    beforeEach(inject(function($filter) {
      booleanFilter = $filter('boolean');
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