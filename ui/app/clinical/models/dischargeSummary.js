(function(){
	var getObservationByName = function(observations, name){
		for (var i = 0; i < observations.length; i++) {
			var observation = observations[i];
			if(observation.concept.name === name) return observation;
			var observationMember = getObservationByName(observation.groupMembers, name);
			if(observationMember) return observationMember;
		};
	}

	Bahmni.Clinical.DischargeSummary = function(patient, visit){
		this.patient = patient;
		this.visit = visit;
	}

	Bahmni.Clinical.DischargeSummary.prototype = {
		getObservationValue: function(name) { 
			var observation = getObservationByName(this.visit.observations, name);
			return observation ? observation.value : null;
		},

		getTreatmentRecieved: function() {
			return this.visit.ipdDrugSchedule.drugOrders;
		},
		
		getTreatmentAdviced: function() {
			var DateUtil = Bahmni.Common.Util.DateUtil;
			var dischargeDate = this.visit.getDischargeDispositionEncounterDate();
			if(!dischargeDate) return [];
			return this.visit.drugOrders.filter(function(drugOrder) {
				return DateUtil.parse(drugOrder.startDate) >= dischargeDate;
			});
		}
	}
})();


