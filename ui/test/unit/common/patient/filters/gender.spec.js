
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