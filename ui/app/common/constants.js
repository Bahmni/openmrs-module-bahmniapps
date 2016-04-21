'use strict';

var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};

(function(){
    var hostUrl = localStorage.getItem('host') ? ("https://" + localStorage.getItem('host'))  : "";
    var offlineRootDir = localStorage.getItem('offlineRootDir') || "";
    var RESTWS = hostUrl + "/openmrs/ws/rest";
    var RESTWS_V1 = hostUrl + "/openmrs/ws/rest/v1";
    var BAHMNI_CORE = RESTWS_V1 + "/bahmnicore";
    var EMRAPI = RESTWS + "/emrapi";
    var BACTERIOLOGY = RESTWS_V1;
    var BASE_URL = hostUrl + "/bahmni_config/openmrs/apps/";
    var CUSTOM_URL = hostUrl + "/implementation_config/openmrs/apps/";
    var CUSTOM_LOCALE_URL = hostUrl + "/bahmni_config/openmrs/i18n/";

    var serverErrorMessages = [
        {
            serverMessage: "Cannot have more than one active order for the same orderable and care setting at same time",
            clientMessage: "One or more drugs you are trying to order are already active. Please change the start date of the conflicting drug or remove them from the new prescription."
        }
    ];

    var representation = "custom:(uuid,name,names,conceptClass," +
        "setMembers:(uuid,name,names,conceptClass," +
        "setMembers:(uuid,name,names,conceptClass," +
        "setMembers:(uuid,name,names,conceptClass))))";

    var unAuthenticatedReferenceDataMap = {
        "/openmrs/ws/rest/v1/location?tags=Login+Location&s=byTags&v=default": "LoginLocations",
        "/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=locale.allowed.list": "LocaleList"
    };

    var authenticatedReferenceDataMap = {
        "/openmrs/ws/rest/v1/idgen/identifiersources": "IdentifierSources",
        "/openmrs/module/addresshierarchy/ajax/getOrderedAddressHierarchyLevels.form": "AddressHierarchyLevels",
        "/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=mrs.genders": "Genders",
        "/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=bahmni.relationshipTypeMap": "RelationshipTypeMap",
        "/openmrs/ws/rest/v1/bahmnicore/config/bahmniencounter?callerContext=REGISTRATION_CONCEPTS": "RegistrationConcepts",
        "/openmrs/ws/rest/v1/relationshiptype?v=custom:(aIsToB,bIsToA,uuid)": "RelationshipType",
        "/openmrs/ws/rest/v1/personattributetype?v=custom:(uuid,name,sortWeight,description,format,concept)" : "PersonAttributeType",
        "/openmrs/ws/rest/v1/entitymapping?mappingType=loginlocation_visittype&s=byEntityAndMappingType": "LoginLocationToVisitTypeMapping",
        "/openmrs/ws/rest/v1/bahmnicore/config/patient": "PatientConfig",
        //"/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=Consultation+Note&v=custom:(uuid,name,answers)": "ConsultationNote",
        //"/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=Lab+Order+Notes&v=custom:(uuid,name)": "LabOrderNotes",
        //"/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=Impression&v=custom:(uuid,name)":"RadiologyImpressionConfig",
        //"/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=All_Tests_and_Panels&v=custom:(uuid,name:(uuid,name),setMembers:(uuid,name:(uuid,name)))":"AllTestsAndPanelsConcept",
        //"/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=Dosage+Frequency&v=custom:(uuid,name,answers)": "DosageFrequencyConfig",
        //"/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=Dosage+Instructions&v=custom:(uuid,name,answers)": "DosageInstructionConfig",
        "/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty?property=bahmni.encounterType.default":"DefaultEncounterType",
        //"/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=Stopped+Order+Reason&v=custom:(uuid,name,answers)":"StoppedOrderReasonConfig",
        "/openmrs/ws/rest/v1/ordertype": "OrderType"
    };

    Bahmni.Common.Constants = {
        hostURL: hostUrl,
        dateFormat: "dd/mm/yyyy",
        dateDisplayFormat: "DD-MMM-YYYY",
        timeDisplayFormat: "hh:mm",
        emrapiDiagnosisUrl : EMRAPI + "/diagnosis",
        bahmniDiagnosisUrl :BAHMNI_CORE + "/diagnosis/search",
        bahmniDeleteDiagnosisUrl :BAHMNI_CORE + "/diagnosis/delete",
        diseaseTemplateUrl :BAHMNI_CORE + "/diseaseTemplates",
        AllDiseaseTemplateUrl : BAHMNI_CORE + "/diseaseTemplate",
        emrapiConceptUrl :EMRAPI + "/concept",
        encounterConfigurationUrl: BAHMNI_CORE + "/config/bahmniencounter",
        patientConfigurationUrl:BAHMNI_CORE + "/config/patient",
        drugOrderConfigurationUrl:BAHMNI_CORE + "/config/drugOrders",
        emrEncounterUrl: EMRAPI + "/encounter",
        encounterUrl: RESTWS_V1 + "/encounter",
        locationUrl: RESTWS_V1 + "/location",
        bahmniOrderUrl: BAHMNI_CORE + "/orders",
        bahmniDrugOrderUrl: BAHMNI_CORE + "/drugOrders",
        bahmniDispositionByVisitUrl: BAHMNI_CORE + "/disposition/visit",
        bahmniDispositionByPatientUrl: BAHMNI_CORE + "/disposition/patient",
        bahmniSearchUrl:BAHMNI_CORE + "/search",
        bahmniLabOrderResultsUrl: BAHMNI_CORE + "/labOrderResults",
        bahmniEncounterUrl: BAHMNI_CORE + "/bahmniencounter",
        conceptUrl: RESTWS_V1 + "/concept",
        bahmniConceptAnswerUrl: RESTWS_V1 + "/bahmniconceptanswer",
        conceptSearchByFullNameUrl: RESTWS_V1 + "/concept?s=byFullySpecifiedName",
        visitUrl: RESTWS_V1 + "/visit",
        endVisitUrl: BAHMNI_CORE + "/visit/endVisit",
        visitTypeUrl: RESTWS_V1 + "/visittype",
        patientImageUrl: "/patient_images/",
        labResultUploadedFileNameUrl: "/uploaded_results/",
        visitSummaryUrl: BAHMNI_CORE + "/visit/summary",
        encounterModifierUrl: BAHMNI_CORE + "/bahmniencountermodifier",
        openmrsUrl: hostUrl + "/openmrs",
        idgenConfigurationURL: RESTWS_V1 + "/idgen/identifiersources",
        bahmniRESTBaseURL: BAHMNI_CORE + "",
        observationsUrl: BAHMNI_CORE + "/observations",
        obsRelationshipUrl: BAHMNI_CORE + "/obsrelationships",
        encounterImportUrl: BAHMNI_CORE + "/admin/upload/encounter",
        programImportUrl: BAHMNI_CORE + "/admin/upload/program",
        conceptImportUrl: BAHMNI_CORE + "/admin/upload/concept",
        conceptSetImportUrl: BAHMNI_CORE + "/admin/upload/conceptset",
        drugImportUrl: BAHMNI_CORE + "/admin/upload/drug",
        labResultsImportUrl: BAHMNI_CORE + "/admin/upload/labResults",
        referenceTermsImportUrl: BAHMNI_CORE + "/admin/upload/referenceterms",
        relationshipImportUrl: BAHMNI_CORE + "/admin/upload/relationship",
        conceptSetExportUrl: BAHMNI_CORE + "/admin/export/conceptset?conceptName=:conceptName",
        patientImportUrl: BAHMNI_CORE + "/admin/upload/patient",
        adminImportStatusUrl: BAHMNI_CORE + "/admin/upload/status",
        dhisAllTasksUrl: RESTWS_V1 + "/dhis/tasks",
        programUrl: RESTWS_V1 + "/program",
        programEnrollPatientUrl: RESTWS_V1 + "/bahmniprogramenrollment",
        programStateDeletionUrl: RESTWS_V1 + "/programenrollment",
        programEnrollmentDefaultInformation: "default",
        programEnrollmentFullInformation: "full",
        programAttributeTypes: RESTWS_V1 + "/programattributetype",
        dhisTaskUrl: RESTWS_V1 + "/dhis/task/",
        dhisFireQueriesUrl: RESTWS_V1 + "/dhis/fireQueries",
        relationshipTypesUrl: RESTWS_V1 + "/relationshiptype",
        personAttributeTypeUrl: RESTWS_V1 + "/personattributetype",
        diseaseSummaryPivotUrl: BAHMNI_CORE + "/diseaseSummaryData",
        allTestsAndPanelsConceptName : 'All_Tests_and_Panels',
        dosageFrequencyConceptName : 'Dosage Frequency',
        dosageInstructionConceptName : 'Dosage Instructions',
        stoppedOrderReasonConceptName :'Stopped Order Reason',
        consultationNoteConceptName : 'Consultation Note',
        diagnosisConceptSet : 'Diagnosis Concept Set',
        radiologyOrderType : 'Radiology Order',
        radiologyResultConceptName :"Radiology Result",
        investigationEncounterType:"INVESTIGATION",
        validationNotesEncounterType: "VALIDATION NOTES",
        labOrderNotesConcept: "Lab Order Notes",
        impressionConcept: "Impression",
        qualifiedByRelationshipType: "qualified-by",
        dispositionConcept : "Disposition",
        dispositionGroupConcept : "Disposition Set",
        dispositionNoteConcept : "Disposition Note",
        ruledOutDiagnosisConceptName : 'Ruled Out Diagnosis',
        emrapiConceptMappingSource :"org.openmrs.module.emrapi",
        abbreviationConceptMappingSource: "Abbreviation",
        includeAllObservations: false,
        openmrsObsUrl :RESTWS_V1 + "/obs",
        openmrsObsRepresentation :"custom:(uuid,obsDatetime,value:(uuid,name:(uuid,name)))" ,
        admissionCode: 'ADMIT',
        dischargeCode: 'DISCHARGE',
        transferCode: 'TRANSFER',
        undoDischargeCode: 'UNDO_DISCHARGE',
        vitalsConceptName: "Vitals",
        heightConceptName: "HEIGHT",
        weightConceptName: "WEIGHT",
        bmiConceptName: "BMI", // TODO : shruthi : revove this when this logic moved to server side
        bmiStatusConceptName: "BMI STATUS", // TODO : shruthi : revove this when this logic moved to server side
        abnormalObservationConceptName: "IS_ABNORMAL",
        documentsPath: '/document_images',
        documentsConceptName: 'Document',
        miscConceptClassName: 'Misc',
        abnormalConceptClassName: 'Abnormal',
        unknownConceptClassName: 'Unknown',
        durationConceptClassName: 'Duration',
        conceptDetailsClassName: 'Concept Details',
        admissionEncounterTypeName: 'ADMISSION',
        dischargeEncounterTypeName: 'DISCHARGE',
        imageClassName: 'Image',
        locationCookieName: 'bahmni.user.location',
        retrospectiveEntryEncounterDateCookieName: 'bahmni.clinical.retrospectiveEncounterDate',
        rootScopeRetrospectiveEntry: 'retrospectiveEntry.encounterDate',
        patientFileConceptName: 'Patient file',
        serverErrorMessages: serverErrorMessages,
        currentUser:'bahmni.user',
        retrospectivePrivilege:'app:clinical:retrospective',
        nutritionalConceptName:'Nutritional Values',
        messageForNoObservation: "No observations captured for this visit.",
        messageForNoDisposition: "NO_DISPOSTIONS_AVAILABLE_MESSAGE_KEY",
        messageForNoFulfillment: "No observations captured for this order.",
        reportsUrl: "/bahmnireports/report",
        uploadReportTemplateUrl: "/bahmnireports/upload",
        ruledOutdiagnosisStatus : "Ruled Out Diagnosis",
        registartionConsultationPrivilege:'app:common:registration_consultation_link',
        manageIdentifierSequencePrivilege:"Manage Identifier Sequence",
        closeVisitPrivilege:'app:common:closeVisit',
        deleteDiagnosisPrivilege:'app:clinical:deleteDiagnosis',
        viewPatientsPrivilege: 'View Patients',
        editPatientsPrivilege: 'Edit Patients',
        addVisitsPrivilege: 'Add Visits',
        deleteVisitsPrivilege: 'Delete Visits',
        grantProviderAccess: "app:clinical:grantProviderAccess",
        grantProviderAccessDataCookieName: "app:clinical:grantProviderAccessData",
        globalPropertyUrl: BAHMNI_CORE + "/sql/globalproperty",
        fulfillmentConfiguration: "fulfillment",
        fulfillmentFormSuffix:" Fulfillment Form",
        noNavigationLinksMessage: "No navigation links available.",
        conceptSetRepresentationForOrderFulfillmentConfig: representation,
        entityMappingUrl: RESTWS_V1 + "/entitymapping",
        encounterTypeUrl: RESTWS_V1+"/encountertype",
        defaultExtensionName: "default",
        orderSetMemberAttributeTypeUrl: RESTWS_V1 + "/ordersetmemberattributetype",
        orderSetUrl: RESTWS_V1 + "/bahmniorderset",
        primaryOrderSetMemberAttributeTypeName: "Primary",
        bahmniBacteriologyResultsUrl: BACTERIOLOGY + "/specimen",
        bedFromVisit: RESTWS_V1+ "/beds",
        ordersUrl: RESTWS_V1+ "/order",
        formDataUrl: RESTWS_V1 + "/obs",
        providerUrl: RESTWS_V1 + "/provider",
        drugUrl : RESTWS_V1 + "/drug",
        orderTypeUrl : RESTWS_V1 +  "/ordertype",
        userUrl : RESTWS_V1 + "/user",
        sqlUrl : BAHMNI_CORE + "/sql",
        patientAttributeDateFieldFormat: "org.openmrs.util.AttributableDate",
        platform:"user.platform",
        RESTWS_V1 : RESTWS_V1,
        baseUrl :  BASE_URL,
        customUrl : CUSTOM_URL,
        customLocaleUrl : CUSTOM_LOCALE_URL,
        eventLogServiceUrl : hostUrl + "/event-log-service/rest/eventlog/getevents",
        faviconUrl : hostUrl + "/bahmni/favicon.ico",
        platformType: {
            chrome: 'chrome',
            android: 'android',
            chromeApp: 'chrome-app',
            other: 'other'
        },
        numericDataType:"Numeric",
        encryptionType: {
            SHA3: 'SHA3'
        },
        LoginInformation: 'LoginInformation',
        orderSetSpecialUnits:["mg/kg","mg/m2"],
        ServerDateTimeFormat: 'YYYY-MM-DDTHH:mm:ssZZ',
        calculateDose: BAHMNI_CORE+ "/calculateDose",
        unAuthenticatedReferenceDataMap: unAuthenticatedReferenceDataMap,
        authenticatedReferenceDataMap: authenticatedReferenceDataMap,
        offlineRootDir: offlineRootDir,
        dischargeUrl: BAHMNI_CORE + "/discharge"
    };
})();

