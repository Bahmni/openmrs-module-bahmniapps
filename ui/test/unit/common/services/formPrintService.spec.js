'use strict';

describe('FormPrintService', function () {
    var formPrintService, scope, q, printer, diagnosisService, observationsService, encounterService, visitService, allergyService;

    beforeEach(function () {
        module('bahmni.common.util');
        module(function ($provide) {
            printer = jasmine.createSpyObj('printer', ['print']);
            diagnosisService = jasmine.createSpyObj('diagnosisService', ['getPatientDiagnosis']);
            observationsService = jasmine.createSpyObj('observationsService', ['fetch']);
            encounterService = jasmine.createSpyObj('encounterService', ['findByEncounterUuid']);
            visitService = jasmine.createSpyObj('visitService', ['getVisitSummary']);
            allergyService = jasmine.createSpyObj('allergyService', ['getAllergyForPatient']);
            $provide.value('printer', printer);
            $provide.value('diagnosisService', diagnosisService);
            $provide.value('observationsService', observationsService);
            $provide.value('encounterService', encounterService);
            $provide.value('visitService', visitService);
            $provide.value('allergyService', allergyService);
        });

        inject(['formPrintService', function (formPrintServiceInjected) {
            formPrintService = formPrintServiceInjected;
        }]);
    });

    beforeEach(inject(function ($rootScope, $q) {
        scope = $rootScope.$new();
        q = $q;
    }));

    var mockDiagnosisService = function (data) {
        diagnosisService.getPatientDiagnosis.and.callFake(function () {
            return q.when(data);
        });
    };

    var mockObservationsService = function (data) {
        observationsService.fetch.and.callFake(function () {
            return q.when(data);
        });
    };

    var mockEncounterService = function (data) {
        encounterService.findByEncounterUuid.and.callFake(function () {
            return q.when(data);
        });
    };

    var mockVisitService = function (data) {
        visitService.getVisitSummary.and.callFake(function () {
            return q.when(data);
        });
    };

    var mockAllergyService = function (data) {
        allergyService.getAllergyForPatient.and.callFake(function () {
            return q.when(data);
        });
    };

    it('should handle print for the given print data', function () {
        var printData = {};
        printData.bahmniObservations = [{
                "encounterDateTime": 1700558615000,
                "encounterUuid": "encounterUuid",
                "conceptNameToDisplay": "HEIGHT",
                "valueAsString": "180.0"
            },{
                "encounterDateTime": 1700558615000,
                "encounterUuid": "encounterUuid",
                "conceptNameToDisplay": "WEIGHT",
                "valueAsString": "72.0"
            }];
        printData.title = "Form";
        printData.printConfig = { 
                                    templateUrl: 'common/views/formPrint.html',
                                    header: 'Form',
                                    title: 'Bahmni Hospital',
                                    observationsConcepts: ["WEIGHT"],
                                    printDiagnosis:{
                                        "order": "PRIMARY",
                                        "certainity": "CONFIRMED"
                                    },
                                }
        printData.patient = {
            uuid:'patientUuid',
            givenName: 'Patient',
            familyName: 'One',
            identifier: 'BAH0001'
        };
        var location = {uuid: 'locationUuid', name: 'Bahmni'};
        var encounterUuid = 'encounterUuid';
        var diagnosesResponse = { data: [{ order: 'PRIMARY', certainty: 'CONFIRMED', codedAnswer : { name: 'Diagnosis', mappings: [{code: 'M12.9'}]} }]};
        var obsResponse = { data: [{
            "encounterDateTime": 1700558615000,
            "encounterUuid": "encounterUuid",
            "conceptNameToDisplay": "WEIGHT",
            "valueAsString": "72.0"
        }]}
        var allergyResponse = { data: [{}] };
        var encounterResponse = { data: { encounterUuid: 'encounterUuid', visitUuid: 'visitUuid' }};
        var visitSummaryResponse = { data: {visitUuid: 'visitUuid', visitType: 'OPD'}}
        
        mockDiagnosisService(diagnosesResponse);
        mockObservationsService(obsResponse);
        mockEncounterService(encounterResponse);
        mockAllergyService(allergyResponse);
        mockVisitService(visitSummaryResponse);
       
        formPrintService.printForm(printData, encounterUuid, location);
        scope.$digest();
        scope.$apply();
        expect(diagnosisService.getPatientDiagnosis).toHaveBeenCalledWith('patientUuid');
        expect(observationsService.fetch).toHaveBeenCalledWith('patientUuid', ["WEIGHT"], "latest", null, null, null, null, null);
        expect(encounterService.findByEncounterUuid).toHaveBeenCalledWith('encounterUuid');
        expect(allergyService.getAllergyForPatient).toHaveBeenCalledWith('patientUuid');
    });

    it('should handle print for the given print data for non coded diagnosis', function () {
        var printData = {};
        printData.bahmniObservations = [{
                "encounterDateTime": 1700558615000,
                "encounterUuid": "encounterUuid",
                "conceptNameToDisplay": "HEIGHT",
                "valueAsString": "180.0"
            },{
                "encounterDateTime": 1700558615000,
                "encounterUuid": "encounterUuid",
                "conceptNameToDisplay": "WEIGHT",
                "valueAsString": "72.0"
            }];
        printData.title = "Form";
        printData.printConfig = { 
                                    templateUrl: 'common/views/formPrint.html',
                                    header: 'Form',
                                    title: 'Bahmni Hospital',
                                    observationsConcepts: ["WEIGHT"],
                                    printDiagnosis:{
                                        "order": "PRIMARY",
                                        "certainity": "CONFIRMED"
                                    },
                                }
        printData.patient = {
            uuid:'patientUuid',
            givenName: 'Patient',
            familyName: 'One',
            identifier: 'BAH0001'
        };
        var location = {uuid: 'locationUuid', name: 'Bahmni'};
        var encounterUuid = 'encounterUuid';
        var diagnosesResponse = { data: [{ order: 'PRIMARY', certainty: 'CONFIRMED', codedAnswer :  null, freeTextAnswer : 'Test' }]};
        var obsResponse = { data: [{
            "encounterDateTime": 1700558615000,
            "encounterUuid": "encounterUuid",
            "conceptNameToDisplay": "WEIGHT",
            "valueAsString": "72.0"
        }]}
        var allergyResponse = { data: [{}] };
        var encounterResponse = { data: { encounterUuid: 'encounterUuid', visitUuid: 'visitUuid' }};
        var visitSummaryResponse = { data: {visitUuid: 'visitUuid', visitType: 'OPD'}}

        mockDiagnosisService(diagnosesResponse);
        mockObservationsService(obsResponse);
        mockEncounterService(encounterResponse);
        mockAllergyService(allergyResponse);
        mockVisitService(visitSummaryResponse);

        formPrintService.printForm(printData, encounterUuid, location);
        scope.$digest();
        scope.$apply();
        expect(diagnosisService.getPatientDiagnosis).toHaveBeenCalledWith('patientUuid');
        expect(observationsService.fetch).toHaveBeenCalledWith('patientUuid', ["WEIGHT"], "latest", null, null, null, null, null);
        expect(encounterService.findByEncounterUuid).toHaveBeenCalledWith('encounterUuid');
        expect(allergyService.getAllergyForPatient).toHaveBeenCalledWith('patientUuid');
    });

    it('should handle print for the given print data for coded diagnosis without mappings', function () {
        var printData = {};
        printData.bahmniObservations = [{
                "encounterDateTime": 1700558615000,
                "encounterUuid": "encounterUuid",
                "conceptNameToDisplay": "HEIGHT",
                "valueAsString": "180.0"
            },{
                "encounterDateTime": 1700558615000,
                "encounterUuid": "encounterUuid",
                "conceptNameToDisplay": "WEIGHT",
                "valueAsString": "72.0"
            }];
        printData.title = "Form";
        printData.printConfig = { 
                                    templateUrl: 'common/views/formPrint.html',
                                    header: 'Form',
                                    title: 'Bahmni Hospital',
                                    observationsConcepts: ["WEIGHT"],
                                    printDiagnosis:{
                                        "order": "PRIMARY",
                                        "certainity": "CONFIRMED"
                                    },
                                }
        printData.patient = {
            uuid:'patientUuid',
            givenName: 'Patient',
            familyName: 'One',
            identifier: 'BAH0001'
        };
        var location = {uuid: 'locationUuid', name: 'Bahmni'};
        var encounterUuid = 'encounterUuid';
        var diagnosesResponse = { data: [{ order: 'PRIMARY', certainty: 'CONFIRMED', codedAnswer : { name: 'Diagnosis', mappings: []} }]};
        var obsResponse = { data: [{
            "encounterDateTime": 1700558615000,
            "encounterUuid": "encounterUuid",
            "conceptNameToDisplay": "WEIGHT",
            "valueAsString": "72.0"
        }]}
        var allergyResponse = { data: [{}] };
        var encounterResponse = { data: { encounterUuid: 'encounterUuid', visitUuid: 'visitUuid' }};
        var visitSummaryResponse = { data: {visitUuid: 'visitUuid', visitType: 'OPD'}}

        mockDiagnosisService(diagnosesResponse);
        mockObservationsService(obsResponse);
        mockEncounterService(encounterResponse);
        mockAllergyService(allergyResponse);
        mockVisitService(visitSummaryResponse);

        formPrintService.printForm(printData, encounterUuid, location);
        scope.$digest();
        scope.$apply();
        expect(diagnosisService.getPatientDiagnosis).toHaveBeenCalledWith('patientUuid');
        expect(observationsService.fetch).toHaveBeenCalledWith('patientUuid', ["WEIGHT"], "latest", null, null, null, null, null);
        expect(encounterService.findByEncounterUuid).toHaveBeenCalledWith('encounterUuid');
        expect(allergyService.getAllergyForPatient).toHaveBeenCalledWith('patientUuid');
    });

    it('should handle print for the given print data for multiple diagnosis', function () {
        var printData = {};
        printData.bahmniObservations = [{
                "encounterDateTime": 1700558615000,
                "encounterUuid": "encounterUuid",
                "conceptNameToDisplay": "HEIGHT",
                "valueAsString": "180.0"
            },{
                "encounterDateTime": 1700558615000,
                "encounterUuid": "encounterUuid",
                "conceptNameToDisplay": "WEIGHT",
                "valueAsString": "72.0"
            }];
        printData.title = "Form";
        printData.printConfig = { 
                                    templateUrl: 'common/views/formPrint.html',
                                    header: 'Form',
                                    title: 'Bahmni Hospital',
                                    observationsConcepts: ["WEIGHT"],
                                    printDiagnosis:{
                                        "order": "PRIMARY",
                                        "certainity": "CONFIRMED"
                                    },
                                }
        printData.patient = {
            uuid:'patientUuid',
            givenName: 'Patient',
            familyName: 'One',
            identifier: 'BAH0001'
        };
        var location = {uuid: 'locationUuid', name: 'Bahmni'};
        var encounterUuid = 'encounterUuid';
        var diagnosesResponse = { data: [{ order: 'PRIMARY', certainty: 'CONFIRMED', codedAnswer : { name: 'Diagnosis', mappings: []} }, { order: 'PRIMARY', certainty: 'CONFIRMED', codedAnswer :  null, freeTextAnswer : 'Test' }]};
        var obsResponse = { data: [{
            "encounterDateTime": 1700558615000,
            "encounterUuid": "encounterUuid",
            "conceptNameToDisplay": "WEIGHT",
            "valueAsString": "72.0"
        }]}
        var allergyResponse = { status: 200, data: { "entry":[
            { 
              "fullUrl": "http://gcp-dev-ug.emr.cure.org/openmrs/ws/fhir2/R4/AllergyIntolerance/a4161c4d-c470-4180-b8bf-ca2e9a51a371",
              "resource": {
                "resourceType": "AllergyIntolerance",
                "id": "a4161c4d-c470-4180-b8bf-ca2e9a51a371",
                "meta": {
                  "lastUpdated": "2024-03-26T17:54:31.000+05:30",
                  "tag": [
                    {
                      "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationValue",
                      "code": "SUBSETTED",
                      "display": "Resource encoded in summary mode"
                    }
                  ]
                },
                "clinicalStatus": {
                  "coding": [
                    {
                      "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                      "code": "active",
                      "display": "Active"
                    }
                  ],
                  "text": "Active"
                },
                "verificationStatus": {
                  "coding": [
                    {
                      "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
                      "code": "confirmed",
                      "display": "Confirmed"
                    }
                  ],
                  "text": "Confirmed"
                },
                "type": "allergy",
                "category": [
                  "food"
                ],
                "criticality": "unable-to-assess",
                "code": {
                  "coding": [
                    {
                      "code": "98696a68-5d73-48a4-b860-7f870168359f",
                      "display": "Chocolate"
                    }
                  ]
                },
                "patient": {
                  "reference": "Patient/86df1201-a806-4d26-a03b-e7a9bcc94e4a",
                  "type": "Patient",
                  "display": "Riya Test (Patient Identifier: UG240269)"
                },
                "recordedDate": "2024-03-26T17:54:31+05:30",
                "recorder": {
                  "reference": "Practitioner/c1c21e11-3f10-11e4-adec-0800271c1b75",
                  "type": "Practitioner",
                  "display": "superman Man"
                },
                "reaction": [
                  {
                    "substance": {
                      "coding": [
                        {
                          "code": "98696a68-5d73-48a4-b860-7f870168359f",
                          "display": "Chocolate"
                        }
                      ]
                    },
                    "manifestation": [
                      {
                        "coding": [
                          {
                            "code": "1171f21f-1810-496f-b8db-ea8dc9d05940",
                            "display": "Mental status change"
                          }
                        ]
                      }
                    ],
                    "severity": "moderate"
                  }
                ]
              }
            }
          ]} };
        var encounterResponse = { data: { encounterUuid: 'encounterUuid', visitUuid: 'visitUuid' }};
        var visitSummaryResponse = { data: {visitUuid: 'visitUuid', visitType: 'OPD'}}

        mockDiagnosisService(diagnosesResponse);
        mockObservationsService(obsResponse);
        mockEncounterService(encounterResponse);
        mockAllergyService(allergyResponse);
        mockVisitService(visitSummaryResponse);

        formPrintService.printForm(printData, encounterUuid, location);
        scope.$digest();
        scope.$apply();
        expect(diagnosisService.getPatientDiagnosis).toHaveBeenCalledWith('patientUuid');
        expect(observationsService.fetch).toHaveBeenCalledWith('patientUuid', ["WEIGHT"], "latest", null, null, null, null, null);
        expect(encounterService.findByEncounterUuid).toHaveBeenCalledWith('encounterUuid');
        expect(allergyService.getAllergyForPatient).toHaveBeenCalledWith('patientUuid');
    });
});
