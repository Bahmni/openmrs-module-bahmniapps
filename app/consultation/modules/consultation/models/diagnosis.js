Bahmni.Opd.Consultation.Diagnosis = function (concept, order, certainty, existingObsUuid) {
    var self = this;
    self.concept = concept;
    self.order = order ? order : "PRIMARY";
    self.certainty = certainty ? certainty : "PRESUMED";
    self.existingObsUuid = existingObsUuid;
    self.displayName = self.concept.conceptName

    self.conceptName = function(){
        return concept.conceptName;
    };

    self.isPrimary = function(){
        return self.order == "PRIMARY";
    }

    self.isValid = function(){
        return (self.displayName !== undefined && self.concept.conceptUuid !== undefined)
            || (self.displayName === undefined && self.concept.conceptUuid === undefined);
    }
};