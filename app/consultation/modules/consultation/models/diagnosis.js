Bahmni.Opd.Consultation.Diagnosis = function (concept) {
    var self = this;
    self.concept = concept;

    self.certaintyDisplayValue = function () {
        if (self.isConfirmed === true) {
            return "CONFIRMED";
        }
        else {
            return "PRESUMED";
        }
    };

    self.orderDisplayValue = function () {
        if (self.isPrimary === true) {
            return "PRIMARY";
        }
        else {
            return "SECONDARY";
        }
    };

    self.conceptName = function(){
        return concept.conceptName;
    };
};