'use strict';

describe("Age Filter", function () {    
    var ageFilter;
    
    beforeEach(module('bahmni.common.patient'));
    beforeEach(inject(function($filter) {
      ageFilter = $filter('age');
    }));

    it("should return years when age is more than a year w.r.t reference date", function() {
      expect(ageFilter('2013-09-01', '2014-10-01')).toBe('1 y');
      expect(ageFilter('2012-09-01', '2014-11-11')).toBe('2 y');
    });

    it("should return months when age is less than a year w.r.t reference date", function() {
      expect(ageFilter('2014-09-01', '2014-10-01')).toBe('1 m');
      expect(ageFilter('2013-11-01', '2014-10-01')).toBe('11 m');
    });

    it("should return days when age is less than a month w.r.t reference date", function() {
      expect(ageFilter('2014-09-30', '2014-10-01')).toBe('1 d');
      expect(ageFilter('2014-09-02', '2014-10-01')).toBe('29 d');
      expect(ageFilter('2014-02-28', '2014-03-01')).toBe('1 d');
      expect(ageFilter('2014-03-01', '2014-03-01')).toBe('0 d');
    });

    it("should age w.r.t current time when reference date is not given", function() {
      spyOn(Bahmni.Common.Util.DateUtil, 'now').andReturn('2014-10-01');
      
      expect(ageFilter('2014-09-30')).toBe('1 d');
      expect(ageFilter('2013-09-30')).toBe('1 y');
    });
});