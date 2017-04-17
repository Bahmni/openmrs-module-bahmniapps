'use strict';

(function () {
    Bahmni.Common.Domain.ObservationFilter = function () {
        var self = this;

        var voidExistingObservationWithOutValue = function (observations) {
            observations.forEach(function (observation) {
                voidExistingObservationWithOutValue(observation.groupMembers);
                observation.voided = observation.voided || observation.canBeVoided();

                if (observation.voided) {
                    voidAllChildren(observation);
                }
            });
        };

        var voidAllChildren = function (voidedObservation) {
            voidedObservation.groupMembers.forEach(function (childWithVoidedParent) {
                childWithVoidedParent.voided = true;

                voidAllChildren(childWithVoidedParent);
            });
        };

        var removeNewObservationsWithoutValue = function (observations) {
            observations.forEach(function (observation) {
                observation.groupMembers = removeNewObservationsWithoutValue(observation.groupMembers);
            });
            return observations.filter(function (observation) {
                var validObs = observation.isExisting() || observation.hasValue() || observation.hasMemberWithValue();
                return (validObs && !observation.voided) || (observation.isExisting() && observation.voided);
            });
        };

        var removeNewObservationsWhichAreVoided = function (observations) {
            observations.forEach(function (observation) {
                observation.groupMembers = removeNewObservationsWhichAreVoided(observation.groupMembers);
            });
            return _.reject(observations, function (observation) {
                return observation.isNew() && observation.voided;
            });
        };

        self.filter = function (observations) {
            var wrappedObservations = observations.map(Observation.wrap);
            var filteredObservations = removeNewObservationsWithoutValue(wrappedObservations);
            filteredObservations = removeNewObservationsWhichAreVoided(filteredObservations);
            voidExistingObservationWithOutValue(filteredObservations);
            return filteredObservations;
        };
    };

    var Observation = function (observationData) {
        angular.extend(this, observationData);

        this.isNew = function () {
            return !this.uuid;
        };

        this.isExisting = function () {
            return !this.isNew();
        };

        this.hasValue = function () {
            return this.value !== undefined && this.value !== null && this.value !== '';
        };

        this.hasMemberWithValue = function () {
            return this.groupMembers.some(function (groupMember) {
                return groupMember.hasValue() || groupMember.hasMemberWithValue();
            });
        };

        this.isGroup = function () {
            return this.groupMembers.length > 0;
        };

        this.isLeaf = function () {
            return !this.isGroup();
        };

        this.isGroupWithOnlyVoidedMembers = function () {
            return this.isGroup() && this.groupMembers.every(function (groupMember) {
                return groupMember.voided;
            });
        };

        this.isLeafNodeWithOutValue = function () {
            return this.isLeaf() && !this.hasValue();
        };

        this.canBeVoided = function () {
            return this.isExisting() && (this.isLeafNodeWithOutValue() || this.isGroupWithOnlyVoidedMembers());
        };
    };

    Observation.wrap = function (observationData) {
        var observation = new Observation(observationData);
        observation.groupMembers = observation.groupMembers ? observation.groupMembers.map(Observation.wrap) : [];
        return observation;
    };
})();

