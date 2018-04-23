'use strict';

describe("Search", function() {
	var search;
    var allActivePatients = [
        {identifier: 'GAN1234', name: 'Ram Singh', uuid: 'p-uuid-1', activeVisitUuid: 'v-uuid-1'},
        {identifier: 'BAM1234', name: 'Shyam Singh', uuid: 'p-uuid-2', activeVisitUuid: 'v-uuid-2'},
        {identifier: 'SEM1234', name: 'Ganesh Singh', uuid: 'p-uuid-3', activeVisitUuid: 'v-uuid-3'},
        {identifier: 'GAN1235', name: 'Gani Singh', uuid: 'p-uuid-4', activeVisitUuid: 'v-uuid-4'},
        {identifier: 'SIV-12-35', name: 'Krishna', uuid: 'p99uid-4', activeVisitUuid: 'v-ppuid-4'},
        {identifier: 'HIC-12\'89*', name: 'Krishna Goud', uuid: 'p99uid-8', activeVisitUuid: 'v-ppuid-7'}
    ];
        
	beforeEach(function() {
    	search = new Bahmni.Common.PatientSearch.Search();
	});

	describe("filterPatients", function() {
	    it('should search the patients by both identifier and name', function () {
	    	search.updatePatientList(allActivePatients);
            search.searchParameter = "Gan";
            
            search.filterPatients();
            
            expect(search.searchResults.length).toBe(3);
	    });
	});

	describe("filterPatientsByIdentifier", function() {
	    it('should search the patients by identifier', function () {
	    	search.updatePatientList(allActivePatients);
            search.searchParameter = "Gan";

            search.filterPatientsByIdentifier();

            expect(search.searchResults.length).toBe(2);
	    });
		it('should not fail if user search by any special characters', function () {
			search.updatePatientList(allActivePatients);
			search.searchParameter = ")G@a(n$";

			search.filterPatientsByIdentifier();

			expect(search.searchResults.length).toBe(0);
		});

		it('should return the patient, when identifier is having special characters', function(){
			search.updatePatientList(allActivePatients);
			search.searchParameter = "SIV-12-";

			search.filterPatientsByIdentifier();

			expect(search.searchResults.length).toBe(1);

			search.searchParameter = "-12\'";

			search.filterPatientsByIdentifier();

			expect(search.searchResults.length).toBe(1);
		});

	});

	describe("filterPatientsBySearchColumns", function(){
		it("should search the patients by uuid", function(){
			search.searchColumns = ["uuid"];
			search.searchParameter = "p-uuid-4";
			search.updatePatientList(allActivePatients);

			search.filterPatients();
			expect(search.searchResults.length).toBe(1);
			expect(search.searchResults[0].identifier).toBe("GAN1235");
			expect(search.searchResults[0].uuid).toBe("p-uuid-4");
			expect(search.searchResults[0].display).toBe("p-uuid-4");

		});

		it("should search the patients only by name", function(){
			search.searchColumns = ["name"];
			search.searchParameter = "Gan";
			search.updatePatientList(allActivePatients);

			search.filterPatients();
			expect(search.searchResults.length).toBe(2);
		});
		it("should return empty list when invalid column names are configured", function(){
			search.searchColumns = ["unknownColumn1","UnknownColumn2"];
			search.searchParameter = "Krishna";
			search.updatePatientList(allActivePatients);

			search.filterPatients();
			expect(search.searchResults.length).toBe(0);
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

	    it('should be true when searchType is selected', function () {
	    	var searchType = {handler: "emrapi.sqlSearch.patientsToAdmit"};
	    	var selectedSearchType = {handler: "emrapi.sqlSearch.patientsToDischarge"};
	    	search.switchSearchType(selectedSearchType);
	    	search.updatePatientList(allActivePatients);
			search.searchParameter = "Gan";
            
            expect(search.showPatientCountOnSearchParameter(searchType)).toBeTruthy();
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

        it('should update the searchColumns on switchSearchType', function () {
            var searchColumns = ["identifier", "name", "gender", "age"];
            var searchType = {handler: "emrapi.sqlSearch.patientsToAdmit", searchColumns: searchColumns};
            search.switchSearchType(searchType);
            search.updatePatientList(allActivePatients);

            expect(search.searchColumns).toBe(searchColumns);
        });

        it('should update the searchColumns on switchSearchType, default to identifier and name if no searchColumns are configured', function () {
            var searchColumns = ["identifier", "name"];
            var searchType = {handler: "emrapi.sqlSearch.patientsToAdmit"};
            search.switchSearchType(searchType);
            search.updatePatientList(allActivePatients);

            expect(search.searchColumns).toEqual(searchColumns);
        });

        it('should update the search links on switchSearchType', function () {
            var links = [{url : "#/programs/patient/{{patientUuid}}/consultationContext", linkColumn : "status"}];
            var searchType = {handler: "emrapi.sqlSearch.patientsToAdmit", links: links};
            search.switchSearchType(searchType);

            expect(search.links).toBe(links);
        });

	});
});