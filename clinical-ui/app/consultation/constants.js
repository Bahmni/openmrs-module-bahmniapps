var Bahmni = Bahmni || {};
Bahmni.Opd = Bahmni.Opd || {};
Bahmni.Opd.Consultation = Bahmni.Opd.Consultation || {};

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
                labOrderType: "Lab Order",
                drugOrderType : "Drug Order",
                labConceptSetName: "Laboratory",
                testConceptName: "Test",
                labSetConceptName: "LabSet",
                labDepartmentsConceptSetName: "Lab Departments",
                otherInvestigationsConceptSetName: "Other Investigations",
                otherInvestigationCategoriesConceptSetName: "Other Investigations Categories",
                commentConceptName: "COMMENTS"
	};
})();


