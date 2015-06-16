Bahmni.Common.PatientSearch.Search = function(searchTypes) {
	var self = this;
    self.searchTypes = searchTypes || [];
    self.searchType = this.searchTypes[0];
    self.searchParameter = '';
    self.noResultsMessage = null;
    self.searchResults = [];
    self.activePatients = [];

    self.switchSearchType = function (searchType) {
        self.noResultsMessage = null;
        if (self.searchType != searchType)
        {
            self.searchParameter = '';
            self.searchType = searchType;
            self.activePatients = [];
            self.searchResults = [];
        }
        self.markPatientEntry();
    };

    self.markPatientEntry = function () {
        self.startPatientSearch = true;
        window.setTimeout(function () {
            self.startPatientSearch = false;
        });
    };

    self.fetchActivePatientList = function(){
        return self.activePatients.length;
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
    };

    self.isCurrentSearchLookUp = function() {
        return self.searchType && self.searchType.handler;
    };

    self.isTileView = function(){
      return self.searchType && self.searchType.view === Bahmni.Common.PatientSearch.Constants.searchExtensionTileViewType;
    };

    self.isTabularView = function(){
        return  self.searchType &&  self.searchType.view === Bahmni.Common.PatientSearch.Constants.searchExtensionTabularViewType;
    };

    self.showPatientCountOnSearchParameter = function(searchType){
        return showPatientCount(searchType) && self.searchParameter;
    };

    function mapPatient(patient) {
        patient.name = patient.name || (patient.givenName + ' ' + patient.familyName);
        patient.display = patient.identifier + " - " + patient.name;
        patient.image = Bahmni.Common.Constants.patientImageUrl + patient.uuid + ".jpeg";
        return  patient;
    }

    var matchesNameOrId = function (patient) {
        return patient.display.toLowerCase().search(self.searchParameter.toLowerCase()) !== -1;
    };

    var showPatientCount = function(searchType) {
        return self.isSelectedSearch(searchType) && self.isCurrentSearchLookUp();
    };
};
