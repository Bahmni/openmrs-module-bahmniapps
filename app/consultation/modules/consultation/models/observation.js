Bahmni.Opd.Consultation.Observation = function () {

    this.displayValue = function () {
        if (this.possibleAnswers.length > 0) {
            for (var i = 0; i < this.possibleAnswers.length; i++) {
                if (this.possibleAnswers[i].uuid === this.value) {
                    return this.possibleAnswers[i].display;
                }
            }
        }
        else {
            return this.value;
        }
    };

    this.isGroup = function () {
        if (this.groupMembers)
            return this.groupMembers.length > 0;
        return false;
    }

};