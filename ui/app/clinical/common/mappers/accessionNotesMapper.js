'use strict';

Bahmni.Clinical.AccessionNotesMapper = function (encounterConfig) {
    var isValidationEncounter = function (encounterTransaction) {
        return encounterTransaction.encounterTypeUuid === encounterConfig.getValidationEncounterTypeUuid();
    };

    var addAccessionNote = function (accessions, accessionNote) {
        var accession = _.find(accessions, {accessionUuid: accessionNote.accessionUuid});
        if (accession) {
            accession.accessionNotes = accession.accessionNotes || [];
            accession.accessionNotes.push(accessionNote);
        }
    };

    this.map = function (encounters, accessions) {
        var validationEncounters = encounters.filter(isValidationEncounter);
        var accessionNotes = _(validationEncounters).map('accessionNotes').flatten().value();
        accessionNotes.forEach(function (accessionNote) { addAccessionNote(accessions, accessionNote); });
        accessions.forEach(function () {
            accessions.accessionNotes = _.sortBy(accessions.accessionNotes, 'dateTime').reverse();
        });
        return accessions;
    };
};
