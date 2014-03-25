Bahmni.Clinical.VisitDay = function(dayNumber, visitDate, drugOrders, consultationNotes, labTestOrders, otherTestOrders, observations) {
    this.dayNumber = dayNumber;
	this.visitDate = visitDate;
    this.drugOrders = drugOrders;
    this.consultationNotes = consultationNotes;
    this.labTestOrders = labTestOrders;
    this.otherInvestigations = otherTestOrders;
	this.observations = observations;
}

Bahmni.Clinical.VisitDay.prototype = {
    hasDrugOrders : function() {
        return this.drugOrders.length > 0;
    },

    hasLabTestOrders : function() {
        return this.labTestOrders.length > 0;
    },

    hasOtherTestOrders : function() {
        return this.otherInvestigations.length > 0;
    },

    hasObservations: function() {
        return this.observations.length > 0;
    },

    hasConsultationNotes: function() {
        return this.consultationNotes.length > 0;
    },

    hasData: function() {
        return this.hasDrugOrders() || this.hasObservations() || this.hasConsultationNotes() || this.hasLabTestOrders() || this.hasOtherTestOrders();
    }
};

Bahmni.Clinical.VisitDay.create = function(dayNumber, visitDate, encounterTransactions, consultationNoteConcept, labOrderNoteConcept, orderTypes) {
	var drugOrders = [];
	var observations = [];
	var consultationNotes = [];
	var labTestOrders = [];
	var otherTestOrders = [];

	var labTestOrderTypeUuid = orderTypes[Bahmni.Clinical.Constants.labOrderType];

    angular.forEach(encounterTransactions, function(encounterTransaction) {
        var provider = encounterTransaction.providers[0];
        angular.forEach(encounterTransaction.drugOrders, function(drugOrder){
            if(!drugOrder.voided) {
                drugOrder.provider = provider;
                drugOrders.push(drugOrder);                    
            }
        });
	
		angular.forEach(encounterTransaction.testOrders, function(testOrder){
            if(!testOrder.voided) {
                testOrder.provider = provider;
                if(testOrder.orderTypeUuid === labTestOrderTypeUuid) {
                    labTestOrders.push(testOrder);
                } else {
                    otherTestOrders.push(testOrder);
                }
            }
		});

        var validObservation = function(observation) {
            if(observation.voided) return false;
            if(observation.value && !isObservationAgroup(observation)) return true;
            return isObservationAgroup(observation) && observation.groupMembers.some(validObservation);
        }

        var isObservationAgroup = function(observation) {
            return observation.groupMembers && observation.groupMembers.length > 0;
        }

        var removeInvalidGroupMembers = function(observation) {
            angular.forEach(observation.groupMembers, removeInvalidGroupMembers);
            if(observation.groupMembers)
                observation.groupMembers = observation.groupMembers.filter(validObservation);
        }

        var setProviderToObservation = function(observation) {
            observation.provider = provider;
            angular.forEach(observation.groupMembers, setProviderToObservation);
        }

        var validObservations = encounterTransaction.observations.filter(validObservation);
        angular.forEach(validObservations, setProviderToObservation);

        angular.forEach(validObservations, function(observation){
            if(observation.concept.uuid === consultationNoteConcept.uuid) {
                consultationNotes.push(observation)
            }
            else if(observation.concept.uuid != labOrderNoteConcept.uuid) {
                var observationClone = angular.copy(observation);
                removeInvalidGroupMembers(observationClone);
                observations.push(observationClone);
           }
        });
	});
    

   return new this(dayNumber, visitDate, drugOrders, consultationNotes, labTestOrders, otherTestOrders, observations);     
}