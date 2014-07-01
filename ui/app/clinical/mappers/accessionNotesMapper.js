Bahmni.Clinical.AccessionNotesMapper = function(encounterConfig) {
    var ArrayUtil = Bahmni.Common.Util.ArrayUtil;
    
    var isValidationEncounter = function (encounterTransaction) {
        return encounterTransaction.encounterTypeUuid === encounterConfig.getValidationEncounterTypeUuid();
    };

	var addAccessionNote = function(accessions, accessionNote){
	    var accession = accessions.filter(function (accession) { return accession.accessionUuid === accessionNote.accessionUuid })[0];
	    if (accession) {
	        accession.accessionNotes = accession.accessionNotes || [];
	        accession.accessionNotes.push(accessionNote);
	    }
    };

    this.map = function(encounters, accessions){
        var validationEncounters = encounters.filter(isValidationEncounter);
        var accessionNotes = _.flatten(validationEncounters, 'accessionNotes');
        accessionNotes.forEach(function (accessionNote) { addAccessionNote(accessions, accessionNote); });
        accessions.forEach(function(accession){ 
            accessions.accessionNotes = _.sortBy(accessions.accessionNotes, 'dateTime').reverse(); 
        });
        return accessions;
    };
};