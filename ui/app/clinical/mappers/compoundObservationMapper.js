Bahmni.Clinical.CompoundObservationMapper = function () {
    var self = this;
    var compoundObservationName = Bahmni.Common.Constants.compoundObservationConceptName;

    self.flatten = function (observations) {
        var flattenedObservations = [];
        observations.forEach(function (observation) {
            if (observation.concept.name == compoundObservationName) {
                flattenedObservations.push(flattenMember(observation.groupMembers));
            }
        });
        return flattenedObservations;

    };

    var flattenMember = function (memberObservations) {
        var flattenedObservation = {};
        memberObservations.forEach(function (member) {
            flattenedObservation.concept = member.concept;
            flattenedObservation.observationDateTime = moment(member.observationDateTime).format(Bahmni.Common.Constants.dateDisplayFormat);
            flattenedObservation.time = moment(member.observationDateTime).format(Bahmni.Common.Constants.timeDisplayFormat);
            if (member.groupMembers.length == 0) {
                flattenedObservation.value = member.value;
                flattenedObservation.is_abnormal = member.is_abnormal;
                flattenedObservation.groupMembers = [];
            }
            else {
                flattenedObservation.groupMembers = self.flatten(member.groupMembers);
            }
        });
        return flattenedObservation;
    };

};