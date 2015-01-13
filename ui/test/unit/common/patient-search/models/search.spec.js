'use strict';

describe("Search", function() {
	var search;
    var allActivePatients = [
        {identifier: 'GAN1234', name: 'Ram Singh', uuid: 'p-uuid-1', activeVisitUuid: 'v-uuid-1'},
        {identifier: 'BAM1234', name: 'Shyam Singh', uuid: 'p-uuid-2', activeVisitUuid: 'v-uuid-2'},
        {identifier: 'SEM1234', name: 'Ganesh Singh', uuid: 'p-uuid-3', activeVisitUuid: 'v-uuid-3'},
        {identifier: 'GAN1235', name: 'Gani Singh', uuid: 'p-uuid-4', activeVisitUuid: 'v-uuid-4'}
    ];
        
	beforeEach(function() {
    	search = new Bahmni.Common.PatientSearch.Search();
	});

	describe("filterPatients", function() {
	    it('should search the activePatients based on the search text (case insensitive)', function () {
	    	search.updatePatientList(allActivePatients);
            search.searchParameter = "Gan";
            
            search.filterPatients();
            
            expect(search.searchResults.length).toBe(3);
	    });
	});

	describe("updateSearchResults", function() {
	    it("should set 'no results' message when there is searchParamenter and results are empty", function () {
            search.searchParameter = "Gan";
            
            search.updateSearchResults([]);
            
            expect(search.noResultsMessage).toBeTruthy();
	    });

	    it("should not set 'no results' message when there is no searchParamenter", function () {
            search.searchParameter = "";
            
            search.updateSearchResults([]);
            
            expect(search.noResultsMessage).toBe(null);
	    });

	    it("should not set 'no results' message when there are results", function () {
            search.searchParameter = "Gan";
            
            search.updateSearchResults(allActivePatients);
            
            expect(search.noResultsMessage).toBe(null);
	    });
	});

	describe("showPatientCountOnSearchParameter for searchType", function() {
	    it('should be true when searchType is selected and is a look up and has search results', function () {
	    	var searchType = {handler: "emrapi.sqlSearch.patientsToAdmit"};
	    	search.switchSearchType(searchType);
	    	search.updatePatientList(allActivePatients);
			search.searchParameter = "Gan";

			expect(search.showPatientCountOnSearchParameter(searchType)).toBeTruthy();
	    });

	    it('should be false when searchType is not selected', function () {
	    	var searchType = {handler: "emrapi.sqlSearch.patientsToAdmit"};
	    	var selectedSearchType = {handler: "emrapi.sqlSearch.patientsToDischarge"};
	    	search.switchSearchType(selectedSearchType);
	    	search.updatePatientList(allActivePatients);
			search.searchParameter = "Gan";
            
            expect(search.showPatientCountOnSearchParameter(searchType)).toBeFalsy();
	    });

	    it('should be false when searchType is a look up', function () {
	    	var searchType = {handler: null};
	    	search.switchSearchType(searchType);
	    	search.updatePatientList(allActivePatients);
			search.searchParameter = "Gan";
            
            expect(search.showPatientCountOnSearchParameter(searchType)).toBeFalsy();
	    });

		it('should be false when searchType is a look up', function () {
			var searchType = {handler: "emrapi.sqlSearch.patientsToAdmit"};
			search.switchSearchType(searchType);
			search.updatePatientList(allActivePatients);

			expect(search.showPatientCountOnSearchParameter(searchType)).toBeFalsy();
		});

	});
});