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