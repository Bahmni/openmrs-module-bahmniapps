Bahmni.LabResultsMapper = function () {
    this.map = function (encounterTransaction) {
        return getLabResults(getLabResultObs(encounterTransaction));
    };

    var getLabResults = function (observations) {
        return observations.map(function (obs) {
            var notes = getNotes(obs);
            //TODO:Need be revisited after the results structure in the encountertransaction contract is finalized
            var resultValue = obs.value; //getResultValue(obs);
            var members = isLeaf(obs) ? [] : getLabResults(obs.groupMembers);
            return new Bahmni.Clinical.LabResult(obs.concept.name, resultValue, obs.comments, null, null, null, notes, members);
        });
    };

    var isLeaf = function (obs) {
        //return notes.length > 0 || resultValue;
        return obs.groupMembers.length === 0 || obs.groupMembers[0].concept.name === "COMMENTS";
    }

    var getNotes = function (obs) {
        var notes = [];
        obs.groupMembers = obs.groupMembers || [];
        obs.groupMembers.forEach(function (member) {
            if (member.concept.name == "COMMENTS") {
                notes.push(member.value);
            }
        });
        return notes;
    };

    var getResultValue = function (obs) {
        obs.groupMembers = obs.groupMembers || [];
        var resultObs = obs.groupMembers.filter(function (member) {
            return member.concept.name == obs.concept.name;
        });
        return resultObs.length == 1 ? resultObs[0].value : null;
    };

    var getLabResultObs = function (encounterTransaction) {
        var labResultObs;
        encounterTransaction.observations.forEach(function (observation) {
            if (observation.concept.name == Bahmni.Clinical.Constants.labConceptSetName) {
                labResultObs = observation.groupMembers;
            }
            ;
        });
        return labResultObs || [];
    };
}
