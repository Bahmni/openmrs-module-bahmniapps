Bahmni.Opd.Consultation.Diagnosis = function (concept) {
    var self = this;
    self.concept = concept;
    self.order = "PRIMARY";
    self.certainty = "PRESUMED";

    self.conceptName = function(){
        return concept.conceptName;
    };

    self.isPrimary = function(){
        return self.order == "PRIMARY";
    }
};