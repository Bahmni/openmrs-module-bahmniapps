var Bahmni = Bahmni || {};
Bahmni.Opd = Bahmni.Opd || {};

Bahmni.Opd.Constants = (function() {
	var orderTypes = {
	    	lab: "Lab Order",
	    	radiology: "Radiology Order"
	};
	return {
	    activePatientsListUrl: "../patients",
	    dispositionConcept : "DispositionOptions",
	    dispositionNoteConcept : "disposition note",
	    dispositionOrderType : "Disposition Order",
        diagnosisObservationConceptName : "Visit Diagnoses",
        orderConceptName : "Diagnosis order",                   //TODO : should be fetched from a config
        certaintyConceptName : "Diagnosis Certainty",           //TODO : should be fetched from a config
        nonCodedDiagnosisConceptName : "Non-coded Diagnosis",       //TODO : should be fetched from a config
        codedDiagnosisConceptName : "Coded Diagnosis",      //TODO : should be fetched from a config
	    orderTypes : orderTypes,
	    testOrderTypes: [orderTypes.lab, orderTypes.radiology],
        drugOrderType : "Drug Order"
	};
})();



