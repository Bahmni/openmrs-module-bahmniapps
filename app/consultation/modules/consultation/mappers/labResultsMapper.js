Bahmni.Opd.LabResultsMapper = function() {
    this.map = function (encounter) {
        return getLabResults(getLabResultObs(encounter));
    };

    var getLabResults = function(observations) {
        return observations.map(function(obs){
            var notes = getNotes(obs);
            var resultValue = getResultValue(obs);
            var members = isLeaf(notes, resultValue) ? [] : getLabResults(obs.groupMembers);
            return new Bahmni.Opd.Consultation.LabResult(obs.concept.name.name, resultValue, obs.comments, null, null, null, notes, members);
        });
    };

    var isLeaf = function(notes, resultValue) {
        return notes.length > 0 || resultValue;
    }

    var getNotes = function (obs) {
        var notes = [];
        obs.groupMembers = obs.groupMembers || [];
        obs.groupMembers.forEach(function(member) {
            if(member.concept.name.name == "COMMENTS") {
                notes.push(member.value);
            }
        });
        return notes;
    };

    var getResultValue = function (obs) {
        obs.groupMembers = obs.groupMembers || [];
        var resultObs = obs.groupMembers.filter(function(member) {
            return member.concept.name.name == obs.concept.name.name;
        });
        return resultObs.length == 1 ? resultObs[0].value : null;
    };

    var getLabResultObs = function (encounter) {
        var labResultObs;
        encounter.obs.forEach(function(observation) {
            if(observation.concept.name.name == "Laboratory") {
                labResultObs = observation.groupMembers;
            };
        });
        return labResultObs || [];
    };
}