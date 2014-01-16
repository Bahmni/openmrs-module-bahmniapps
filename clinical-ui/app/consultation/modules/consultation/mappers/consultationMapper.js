Bahmni.Opd.ConsultationMapper = function (encounterConfig, dosageFrequencies, dosageInstructions, consultationNoteConcept) {
    this.map = function (encounterTransaction) {
        var specilaObservationConceptUuids = [consultationNoteConcept.uuid];
        var investigations = encounterTransaction.testOrders.filter(function(testOrder) { return !testOrder.voided });
        var labResults = new Bahmni.Opd.LabResultsMapper().map(encounterTransaction);
        var treatmentDrugs = encounterTransaction.drugOrders.map(function(drugOrder) {
            var treatmentDrug = new Bahmni.Opd.Consultation.TreatmentDrug();
            treatmentDrug.concept = drugOrder.concept;
            treatmentDrug.uuid = drugOrder.uuid;
            treatmentDrug.name = drugOrder.drugName;
            treatmentDrug.originalName = "";
            treatmentDrug.strength = drugOrder.doseStrength + ' ' + drugOrder.drugUnits;
            treatmentDrug.dosageForm = drugOrder.dosageForm;
            treatmentDrug.prn = drugOrder.prn;
            treatmentDrug.numberPerDosage = drugOrder.numberPerDosage;
            treatmentDrug.dosageFrequency = drugOrder.dosageFrequency;
            treatmentDrug.dosageInstruction = drugOrder.dosageInstruction;
            treatmentDrug.setNumberOfDosageDays(drugOrder.startDate,drugOrder.endDate) ;
            treatmentDrug.notes = drugOrder.notes;
            treatmentDrug.empty = false;
            treatmentDrug.savedDrug = true;
            return treatmentDrug;
        });
        var diagnoses = encounterTransaction.diagnoses.map(function(diagnosis){
            return new Bahmni.Opd.Consultation.Diagnosis(diagnosis.codedAnswer,diagnosis.order,diagnosis.certainty,diagnosis.existingObs,diagnosis.freeTextAnswer,diagnosis.diagnosisDateTime );
        });
        var consultationNote = mapConsultationNote(encounterTransaction.observations)
        var observations = encounterTransaction.observations.filter(function(observation){
            return !observation.voided && specilaObservationConceptUuids.indexOf(observation.concept.uuid) === -1;
        });
        return {
            visitUuid: encounterTransaction.visitUuid,
            investigations: investigations,
            treatmentDrugs: treatmentDrugs,
            diagnoses: diagnoses,
            labResults: labResults,
            consultationNote: consultationNote || emptyConsultationNote(),
            observations: observations,
            encounterDateTime: encounterTransaction.encounterDateTime
        };
    };


    var emptyConsultationNote = function() {
        return { concept: { uuid: consultationNoteConcept.uuid }};
    }
    
    var mapConsultationNote = function(encounterObservations) {
        var consultationNote = emptyConsultationNote();
        var consultationNoteObservation = encounterObservations.filter(function(obs) {        
            return (obs.concept && obs.concept.uuid === consultationNoteConcept.uuid);
        })[0];
        if(consultationNoteObservation) {
            consultationNote.value = consultationNoteObservation.value;
            consultationNote.uuid = consultationNoteObservation.uuid;
        }
        return consultationNote;
    };
};
