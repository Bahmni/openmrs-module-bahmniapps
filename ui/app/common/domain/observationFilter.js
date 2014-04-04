Bahmni.Common.Domain.ObservationFilter = function () {
	var self = this;

	var Observation = function(observationData) {
		angular.extend(this, observationData);

		this.isNew = function() {
			return !this.uuid;
		}

		this.isExisting = function() {
			return !this.isNew();
		}

		this.hasValue = function() {
			return this.value !== undefined && this.value !== null && this.value !== '';
		}

		this.hasMemberWithValue = function() {
			return this.groupMembers.some(function(groupMember){
				return groupMember.hasValue() || groupMember.hasMemberWithValue();
			})
		}

		this.isGroup = function() {
			return this.groupMembers.length > 0;
		}

		this.isLeaf = function() {
			return !this.isGroup();
		}

		this.isGroupWithOnlyVoidedMembers = function() {
			return this.isGroup() && this.groupMembers.every(function(groupMember) {
				return groupMember.voided;
			})
		}

		this.isLeafNodeWithOutValue = function() {
			return this.isLeaf() && !this.hasValue();
		}
	}

	Observation.wrap = function(observationData) {
		var observation = new Observation(observationData);
		observation.groupMembers = observation.groupMembers.map(Observation.wrap);
		return observation;
	}

	var voidExistingObservationWithOutValue = function(observations) {
		observations.forEach(function(observation){
			voidExistingObservationWithOutValue(observation.groupMembers);
			observation.voided = observation.isExisting() && (observation.isLeafNodeWithOutValue() || observation.isGroupWithOnlyVoidedMembers());
		});
	}

	var removeNewObservationsWithoutValue = function(observations) {
		observations.forEach(function(observation){
			observation.groupMembers = removeNewObservationsWithoutValue(observation.groupMembers);
		});
		return observations.filter(function(observation) {
			return observation.isExisting() || observation.hasValue() || observation.hasMemberWithValue();
		});
	}

	self.filter = function(observations) {
		var wrappedObservations = observations.map(Observation.wrap);
		voidExistingObservationWithOutValue(wrappedObservations);
		var filteredObservations = removeNewObservationsWithoutValue(wrappedObservations);
		return filteredObservations;
	}
}

