Bahmni.Opd.LabResultsMapper = function() {
    this.map = function (encounter) {
        return getLabResults(getLabResultObs(encounter));
    };

    var getLabResults = function(observations) {
        return observations.map(function(obs){
            var notes = getNotes(obs);
            var members = notes.length > 0 ? [] : getLabResults(obs.groupMembers);
            return new Bahmni.Opd.Consultation.LabResult(obs.concept.name.name, obs.value, obs.comments, null, null, null, notes, members);
        });
    };

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