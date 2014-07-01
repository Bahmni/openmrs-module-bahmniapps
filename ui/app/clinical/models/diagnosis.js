Bahmni.Clinical.Diagnosis = function (codedAnswer, order, certainty, existingObsUuid, freeTextAnswer, diagnosisDateTime, voided) {
    var self = this;
    self.codedAnswer = codedAnswer;
    self.order = order;
    self.certainty = certainty;
    self.existingObs = existingObsUuid;
    self.freeTextAnswer = freeTextAnswer;
    self.diagnosisDateTime = diagnosisDateTime || new Date();
    self.diagnosisStatus = undefined;
    self.isNonCodedAnswer = false;
    if (self.codedAnswer) {
        self.conceptName = self.codedAnswer.name;
    }
    self.voided = voided;
    self.firstDiagnosis = null;

    self.getDisplayName = function () {
        if (self.freeTextAnswer) {
            return self.freeTextAnswer;
        }
        else {
            return self.codedAnswer.name;
        }
    };

    self.isPrimary = function () {
        return self.order == "PRIMARY";
    };

    self.isSecondary = function () {
        return self.order == "SECONDARY";
    };

    self.isRuledOut = function(){
        return self.diagnosisStatus == "RULED OUT";
    };

    self.answerNotFilled = function () {
        return !self.codedAnswer.name;
    };

    self.isValidAnswer = function () {
        return (self.codedAnswer.name && self.codedAnswer.uuid)
            || (self.codedAnswer.name && !self.codedAnswer.uuid && self.isNonCodedAnswer)
            || self.answerNotFilled();
    };
    self.isValidOrder = function () {
        return self.answerNotFilled() || self.order !== undefined;
    };

    self.isValidCertainty = function () {
        return self.answerNotFilled() || self.certainty !== undefined;
    };

    self.isEmpty = function () {
        return  self.getDisplayName() === undefined || self.getDisplayName().length === 0;
    };

    self.setDiagnosisStatus = function (statusConcept) {
        if (statusConcept) {
            for (var status in Bahmni.Clinical.Constants.diagnosisStatuses) {
                if (Bahmni.Clinical.Constants.diagnosisStatuses[status] === statusConcept.name) {
                    self.diagnosisStatus = status;
                }
            }
        }
    };

    self.setDiagnosisStatusConcept = function () {
        if (self.diagnosisStatus) {
            for (var status in Bahmni.Clinical.Constants.diagnosisStatuses) {
                if (status === self.diagnosisStatus) {
                    self.diagnosisStatusConcept = {
                        "name": Bahmni.Clinical.Constants.diagnosisStatuses[status]
                    }
                }
            }
        } else {
            self.diagnosisStatusConcept = undefined;
        }
    };

    self.getDiagnosisStatusConcept = function () {
        if (self.diagnosisStatus) {
            return {
                "name": Bahmni.Clinical.Constants.diagnosisStatuses[self.diagnosisStatus]
            }
        }
    };

    self.clearCodedAnswerUuid = function(){
        self.codedAnswer.uuid = undefined;
    };

    self.setAsNonCodedAnswer =  function() {
        self.isNonCodedAnswer = !self.isNonCodedAnswer;
    };
    //    self.hasBeenRevised = function() {
    //        return this.
    //    }

};
