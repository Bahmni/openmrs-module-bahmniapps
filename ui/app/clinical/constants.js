var Bahmni = Bahmni || {};
Bahmni.Clinical = Bahmni.Clinical || {};

Bahmni.Clinical.Constants = (function () {
    var orderTypes = {
        lab: "Lab Order",
        radiology: "Radiology Order"
    };
    return {
        patientsListUrl: "/patient/search",
        diagnosisObservationConceptName: "Visit Diagnoses",
        orderConceptName: "Diagnosis order",                   //TODO : should be fetched from a config
        certaintyConceptName: "Diagnosis Certainty",           //TODO : should be fetched from a config
        nonCodedDiagnosisConceptName: "Non-coded Diagnosis",       //TODO : should be fetched from a config
        codedDiagnosisConceptName: "Coded Diagnosis",      //TODO : should be fetched from a config
        orderTypes: orderTypes,
        labOrderType: "Lab Order",
        drugOrderType: "Drug Order",
        labConceptSetName: "Laboratory",
        testConceptName: "Test",
        labSetConceptName: "LabSet",
        labDepartmentsConceptSetName: "Lab Departments",
        otherInvestigationsConceptSetName: "Other Investigations",
        otherInvestigationCategoriesConceptSetName: "Other Investigations Categories",
        commentConceptName: "COMMENTS",
        messageForNoLabOrders: "No lab orders.",
        messageForNoObservation: "No observations captured for this visit.",
        messageForNoActiveVisit: "No active visit.",
        diagnosisStatuses : {"RULED OUT" : "Ruled Out Diagnosis"},
        dischargeSummaryConceptName: "Discharge Summary",
        noDosingInstructionsClass: "org.openmrs.module.bahmniemrapi.drugorder.dosinginstructions.FlexibleDosingInstructions"
    };
})();


