Bahmni.Opd.Consultation.Diagnosis = function (concept, order, certainty, existingObsUuid) {
    var self = this;
    self.concept = concept;
    self.order = order ? order : "PRIMARY";
    self.certainty = certainty ? certainty : "PRESUMED";
    self.existingObsUuid = existingObsUuid;

    self.conceptName = function(){
        return concept.conceptName;
    };

    self.isPrimary = function(){
        return self.order == "PRIMARY";
    }
};