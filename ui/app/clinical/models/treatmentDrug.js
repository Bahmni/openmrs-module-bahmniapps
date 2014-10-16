'use strict';

Bahmni.Clinical.TreatmentDrug = function () {
    this.uuid = "";
    this.name = "";
    this.originalName = "";
    this.strength = '';
    this.dosageForm = '';
    this.prn = false;
    this.numberPerDosage = "";
    this.dosageFrequency = "";
    this.dosageInstruction = "";
    this.numberOfDosageDays = "";
    this.notes = "";
    this.concept = {uuid: ""};
    this.notesVisible = false;
    this.empty = true;
    this.savedDrug = false;
    var DateUtil = Bahmni.Common.Util.DateUtil;


    this.setNumberOfDosageDays = function(startDate,endDate){
        this.numberOfDosageDays = DateUtil.diffInDays(DateUtil.parse(startDate), DateUtil.parse(endDate));
    }

    this.requestFormat = function(startDate) {
        var endDate = DateUtil.parse(startDate);
        endDate.setDate(endDate.getDate() + this.numberOfDosageDays);
        return {
            uuid: this.uuid,
            concept: {uuid: this.concept.uuid },
            notes: this.notes,
            startDate: startDate,
            endDate: endDate,
            numberPerDosage: this.numberPerDosage,
            dosageInstruction: this.dosageInstruction ? { uuid: this.dosageInstruction.uuid }    : null,
            dosageFrequency: this.dosageFrequency ? {uuid: this.dosageFrequency.uuid } : null,
            prn: this.prn
        };
    }
};
