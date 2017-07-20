'use strict';

Bahmni.ConceptSet.SpecimenTypeObservation = function (observation, allSamples) {
    angular.extend(this, observation);
    this.allSamples = allSamples;

    this.getPossibleAnswers = function () {
        return this.allSamples;
    };

    this.hasValueOf = function (answer) {
        return observation.type && observation.type.uuid === answer.uuid;
    };

    this.toggleSelection = function (answer) {
        if (this.hasValueOf(answer)) {
            observation.type = null;
        } else {
            observation.type = answer;
        }
    };
};
