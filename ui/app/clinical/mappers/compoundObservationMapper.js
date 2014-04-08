Bahmni.Clinical.CompoundObservationMapper = function () {
    var self = this;
    var compoundObservationName = Bahmni.Common.Constants.compoundObservationConceptName
    var abnormalConceptName = Bahmni.Common.Constants.abnormalObservationConceptName

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
            if (member.groupMembers.length == 0) {
                flattenedObservation.value = member.value;
                flattenedObservation.is_abnormal = member.is_abnormal;
                flattenedObservation.groupMembers = [];
                flattenedObservation.observationDateTime = moment(member.observationDateTime).format(Bahmni.Common.Constants.dateDisplayFormat);
            }
            else {
                flattenedObservation.groupMembers = self.flatten(member.groupMembers);
            }
        });
        return flattenedObservation;
    };

};