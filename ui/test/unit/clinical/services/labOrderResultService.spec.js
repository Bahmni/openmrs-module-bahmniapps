'use strict';

describe("labOrderResultService", function() {
    var mockHttp, configurationService, labOrderResultService;

    beforeEach(module('bahmni.clinical'));

    var configurationServiceResponse = {
        allTestsAndPanelsConcept: {results: []}
    };

    var labOrderResults = {
        "results":[
            {"accessionUuid": "uuid1", "accessionDateTime":1401437955000, "testName": "ZN Stain(Sputum)"},
            {"accessionUuid": "uuid1", "accessionDateTime":1401437955000, "testName": "Gram Stain(Sputum)"},
            {"accessionUuid": "uuid1", "accessionDateTime":1401437955000, "testName": "Haemoglobin", "panelName": "Routine Blood"},
            {"accessionUuid": "uuid1", "accessionDateTime":1401437955000, "testName": "ESR", "panelName": "Routine Blood"},
            {"accessionUuid": "uuid2", "accessionDateTime":1401437956000, "testName": "ZN Stain(Sputum)"},
        ], "tabularResult": {
            "values":[
                {"testOrderIndex":0,"dateIndex":0,"abnormal":false,"result":"25.0"},
            ], "orders":[
                {"minNormal":0.0,"maxNormal":6.0,"testName":"ZN Stain(Sputum)","testUnitOfMeasurement":"%","index":0}
            ], "dates":[
                {"index":0,"date":"30-May-2014"}
            ]
        }
    };

    beforeEach(module(function ($provide) {
        mockHttp = jasmine.createSpyObj('$http', ['get']);
        mockHttp.get.and.callFake(function(param) {
            return specUtil.respondWith({"data": labOrderResults});
        });
        configurationService = jasmine.createSpyObj('configurationService', ['getConfigurations']);
        configurationService.getConfigurations.and.callFake(function() {
            return specUtil.respondWith(configurationServiceResponse);
        });

        $provide.value('$http', mockHttp);
        $provide.value('$q', Q);
        $provide.value('configurationService', configurationService);
    }));

    beforeEach(inject(['labOrderResultService', function (LabOrderResultServiceInjected) {
        labOrderResultService = LabOrderResultServiceInjected;
    }]));

    describe("getAllForPatient", function(){
        var params = {
            patientUuid: "123",
            numberOfVisits: 1
        };

        it("should fetch all Lab orders & results and group by accessions", function(done){
            labOrderResultService.getAllForPatient(params).then(function(results) {
                expect(mockHttp.get.calls.mostRecent().args[1].params.patientUuid).toBe("123");
                expect(results.labAccessions.length).toBe(2);
                expect(results.labAccessions[0].length).toBe(1);
                expect(results.labAccessions[1].length).toBe(5);
                done();
            });
        });
        it("should sort by accession date and group by panel", function(done){
            labOrderResultService.getAllForPatient(params).then(function(results) {
                expect(mockHttp.get.calls.mostRecent().args[1].params.patientUuid).toBe("123");
                expect(results.labAccessions[0][0].accessionUuid).toBe("uuid2");
                expect(results.labAccessions[1][0].accessionUuid).toBe("uuid1");
                done();
            });
        });

        it("should group accessions by panel", function(done){
            labOrderResultService.getAllForPatient(params).then(function(results) {
                expect(mockHttp.get.calls.mostRecent().args[1].params.patientUuid).toBe("123");

                expect(results.labAccessions[1][0].isPanel).toBeFalsy();
                expect(results.labAccessions[1][0].orderName).toBe("ZN Stain(Sputum)");
                expect(results.labAccessions[1][1].orderName).toBe("Gram Stain(Sputum)");
                expect(results.labAccessions[1][2].isPanel).toBeTruthy();
                expect(results.labAccessions[1][2].orderName).toBe("Routine Blood");
                expect(results.labAccessions[1][2].tests.length).toBe(2);
                done();
            });
        });
    });
});
