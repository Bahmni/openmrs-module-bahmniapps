'use strict';

Bahmni.Clinical.CompoundObservation = function (observations) {
    this.tree = this.treeView(observations);
    this.list = this.listView(observations);
};

Bahmni.Clinical.CompoundObservation.prototype.treeView = function (observations) {
    var compoundObservationName = Bahmni.Common.Constants.compoundObservationConceptName,
        flattenMember = function (memberObservations) {
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
                    flattenedObservation.groupMembers = flatten(member.groupMembers);
                }
            });
            return flattenedObservation;
        }, flatten = function (observations) {
            var flattenedObservations = [];
            observations.forEach(function (observation) {
                if (observation.concept.name == compoundObservationName) {
                    flattenedObservations.push(flattenMember(observation.groupMembers));
                }
            });
            return flattenedObservations;
        };

    return flatten(observations);
};

Bahmni.Clinical.CompoundObservation.prototype.listView = function (observations) {
    var flatten = function (observations) {
        var flattenedObservations = [];
        observations.forEach(function (observation) {
            if (observation.groupMembers && observation.groupMembers.length == 0) {
                if(observation.value.name){
                    observation.value = observation.value.name;
                }
                flattenedObservations.push(observation);
            } else {
                flattenedObservations = flattenedObservations.concat(flatten(observation.groupMembers));
            }
        });
        return flattenedObservations;
    };

    return flatten(observations);
};