Bahmni.Opd.Consultation.VisitDay = function(visitDate, drugOrders, consultationNotes, labTestOrders, otherTestOrders, observations) {
	this.visitDate = visitDate;
    this.drugOrders = drugOrders;
    this.consultationNotes = consultationNotes;
    this.labTestOrders = labTestOrders;
    this.otherTestOrders = otherTestOrders;
	this.observations = observations;
}

Bahmni.Opd.Consultation.VisitDay.prototype = {
    hasDrugOrders : function() {
        return this.drugOrders.length > 0;
    },

    hasLabTestOrders : function() {
        return this.labTestOrders.length > 0;
    },

    hasOtherTestOrders : function() {
        return this.otherTestOrders.length > 0;
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

Bahmni.Opd.Consultation.VisitDay.create = function(visitDate, encounterTransactions, consultationNoteConcept) {
	var drugOrders = [];
	var observations = [];
	var consultationNotes = [];
	var labTestOrders = [];
	var otherTestOrders = [];
	angular.forEach(encounterTransactions, function(encounterTransaction) {
        angular.forEach(encounterTransaction.drugOrders, function(drugOrder){
            if(!drugOrder.voided) {
                drugOrder.provider = encounterTransaction.providers[0];
                drugOrders.push(drugOrder);                    
            }
        });
	
		// angular.forEach(encounterTransaction.testOrders, function(testOrder){
		// });

        angular.forEach(encounterTransaction.observations, function(observation){
            if(!observation.voided && observation.value) {                    
                observation.provider = encounterTransaction.providers[0];
                if(observation.concept.uuid === consultationNoteConcept.uuid) {
                    consultationNotes.push(observation)
                } else {
                    observations.push(observation);
                }
            }
        });
	});

   return new this(visitDate, drugOrders, consultationNotes, labTestOrders, otherTestOrders, observations);     
}