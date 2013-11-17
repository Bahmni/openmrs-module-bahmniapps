Bahmni.Opd.Consultation.Observation = function () {

    this.displayName = function () {
        if (this.possibleAnswers) {
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

};