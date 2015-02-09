'use strict';

Bahmni.ADT.dispositionNote = function (visit) {
    var encounters = visit.encounters,
        dispositionSets = [];

    encounters.forEach(function (encounter) {
        encounter.obs.forEach(function (observation) {
            if (observation.concept.name.name === "Disposition Set") {
                dispositionSets.push(observation);
            }
        });
    });

    if (dispositionSets && dispositionSets.length > 0) {
        var dispositionNoteObs = [];

        dispositionSets.forEach(function (dispositionSet) {
            dispositionNoteObs = dispositionNoteObs.concat(dispositionSet.groupMembers);
        });

        dispositionNoteObs = dispositionNoteObs.filter(function (groupMember) {
            return groupMember.concept.name.name === "Disposition Note";
        });

        if (dispositionNoteObs && dispositionNoteObs.length > 0) {
            return dispositionNoteObs[0].value;
        }
    }
    return null;
};