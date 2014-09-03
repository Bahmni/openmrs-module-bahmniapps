Bahmni.Common.PatientSearch.Search = function(searchTypes) {
	var self = this;
    self.searchTypes = searchTypes || [];
    self.searchType = this.searchTypes[0];
    self.searchParameter = '';
    self.noResultsMessage = null;
    self.searchResults = [];

    self.switchSearchType = function (searchType) {
        self.searchParameter = '';
        self.searchType = searchType;
        self.activePatients = [];
        self.searchResults = [];
    };

    self.updatePatientList = function (patientList) {
        self.activePatients = patientList.map(mapPatient);
        self.searchResults = self.activePatients;
    };

    self.updateSearchResults = function (patientList) {
        self.updatePatientList(patientList);
        if (self.activePatients.length === 0 && self.searchParameter != '') {
            self.noResultsMessage = "No results found";
        } else {
            self.noResultsMessage = null;
        }
    };

    self.hasSingleActivePatient = function () {
        return self.activePatients.length === 1;
    };

    self.filterPatients = function () {
        self.searchResults = self.searchParameter ? self.activePatients.filter(matchesNameOrId) : self.activePatients;
    };

	self.isSelectedSearch = function(searchType) {
        return self.searchType == searchType;
    }

    self.showPatientCount = function(searchType) {
        return self.isSelectedSearch(searchType) && self.isCurrentSearchLookUp() && self.searchResults.length > 0;
    }

    self.isCurrentSearchLookUp = function() {
        return self.searchType && self.searchType.handler;
    }

    function mapPatient(patient) {
        patient.name = patient.name || (patient.givenName + ' ' + patient.familyName);
        patient.display = patient.identifier + " - " + patient.name;
        patient.image = Bahmni.Common.Constants.patientImageUrl + patient.uuid + ".jpeg";
        return  patient;
    }

    var matchesNameOrId = function (patient) {
        return patient.display.toLowerCase().search(self.searchParameter.toLowerCase()) !== -1;
    };
}