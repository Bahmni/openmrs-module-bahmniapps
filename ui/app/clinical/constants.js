'use strict';

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
        discontinuingAndOrderingSameDrug: "DISCONTINUING_AND_ORDERING_SAME_DRUG_NOT_ALLOWED",
        incompleteForm: "INCOMPLETE_FORM_ERROR_MESSAGE",
        invalidItems: "Highlighted items in New Prescription section are incomplete. Please edit or remove them to continue",
        conceptNotNumeric: "CONCEPT_NOT_NUMERIC"
    };
    var bacteriologyConstants = {
        otherSampleType: "Other",
        specimenSampleSourceConceptName: "Specimen Sample Source"

    };
    return {
        patientsListUrl: "/patient/search",
        diagnosisObservationConceptName: "Visit Diagnoses",
        orderConceptName: "Diagnosis order",                   // TODO : should be fetched from a config
        certaintyConceptName: "Diagnosis Certainty",           // TODO : should be fetched from a config
        nonCodedDiagnosisConceptName: "Non-coded Diagnosis",       // TODO : should be fetched from a config
        codedDiagnosisConceptName: "Coded Diagnosis",      // TODO : should be fetched from a config
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
        messageForNoLabOrders: "NO_LAB_ORDERS_MESSAGE",
        messageForNoObservation: "NO_OBSERVATIONS_CAPTURED",
        messageForNoActiveVisit: "NO_ACTIVE_VISIT_MESSAGE",
        dischargeSummaryConceptName: "Discharge Summary",
        flexibleDosingInstructionsClass: "org.openmrs.module.bahmniemrapi.drugorder.dosinginstructions.FlexibleDosingInstructions",
        reviseAction: 'REVISE',
        asDirectedInstruction: 'As directed',
        dosingTypes: dosingTypes,
        orderActions: orderActions,
        errorMessages: errorMessages,
        caseIntakeConceptClass: 'Case Intake',
        dialog: 'DIALOG',
        dashboard: 'DASHBOARD',
        default: 'DEFAULT',
        gender: 'Gender',
        concepts: concepts,
        otherActiveDrugOrders: "Other Active DrugOrders",
        dispensePrivilege: "bahmni:clinical:dispense",
        mandatoryVisitConfigUrl: "config/visitMandatoryTab.json",
        defaultExtensionName: "default",
        bacteriologyConstants: bacteriologyConstants,
        globalPropertyToFetchActivePatients: 'emrapi.sqlSearch.activePatients'

    };
})();

