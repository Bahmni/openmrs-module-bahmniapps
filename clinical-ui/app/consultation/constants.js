Bahmni.Opd.Consultation.Constants = (function() {
	var orderTypes = {
	    	lab: "Lab Order",
	    	radiology: "Radiology Order"
	};
	return {
        activePatientsListUrl: "../patients/#/clinical",
        dispositionConcept : "Disposition",
        dispositionGroupConcept : "Disposition Set",
        dispositionNoteConcept : "Disposition Note",
        emrapiConceptMappingSource :"org.openmrs.module.emrapi",
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


