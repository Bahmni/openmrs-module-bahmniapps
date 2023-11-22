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
       
        console.log("*********** formPrintService **************")
        formPrintService.printForm(printData, encounterUuid, location);
        scope.$digest();
        scope.$apply();
        // expect(printer.print).toHaveBeenCalled();
        // expect(printer.print).toHaveBeenCalledWith('common/views/formPrint.html', printData);
    });
});
