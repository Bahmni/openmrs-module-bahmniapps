
Bahmni.Clinical.Constants = (function () {
    var orderTypes = {
        lab: "Lab Order",
        radiology: "Radiology Order"
    };
    var dosingTypes = {
        uniform: "uniform",
        variable: "variable"
    };
    var orderActions = {
        discontinue: 'DISCONTINUE',
        new: 'NEW',
        revise: 'REVISE'
    };
    var concepts = {
        age: "Age",
        weight: "Weight"
    };
    var errorMessages = {
        discontinuingAndOrderingSameDrug: "Discontinuing and ordering the same drug is not allowed. Instead, use edit",
        incompleteForm: "Please click on Add or Clear to continue",
        invalidItems: "Highlighted items in New Prescription section are incomplete. Please edit or remove them to continue",
        conceptNotNumeric: "Concept ':conceptName''s datatype is not Numeric. At :placeErrorAccurred."
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
        labConceptSetName: "Lab Samples",
        testConceptName: "LabTest",
        labSetConceptName: "LabSet",
        labDepartmentsConceptSetName: "Lab Departments",
        otherInvestigationsConceptSetName: "Other Investigations",
        otherInvestigationCategoriesConceptSetName: "Other Investigations Categories",
        commentConceptName: "COMMENTS",
        messageForNoLabOrders: "No lab orders.",
        messageForNoObservation: "No observations captured for this visit.",
        messageForNoActiveVisit: "No active visit.",
        dischargeSummaryConceptName: "Discharge Summary",
        flexibleDosingInstructionsClass: "org.openmrs.module.bahmniemrapi.drugorder.dosinginstructions.FlexibleDosingInstructions",
        reviseAction: 'REVISE',
        asDirectedInstruction: 'As directed',
        dosingTypes: dosingTypes,
        orderActions: orderActions,
        errorMessages: errorMessages,
        caseIntakeConceptClass:'Case Intake',
        dialog:'DIALOG',
        dashboard:'DASHBOARD',
        default:'DEFAULT',
        gender: 'Gender',
        concepts: concepts,
        otherActiveDrugOrders: "Other Active DrugOrders",
        dispensePrivilege: "bahmni:clinical:dispense",
        mandatoryVisitConfigUrl: "config/visitMandatoryTab.json",
        defaultExtensionName: "default"

    };
})();


