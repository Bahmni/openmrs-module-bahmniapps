/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

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
        ], 
        "tabularResult": {
            "values":[
                {"testOrderIndex": 0, "dateIndex": 0, "abnormal": false, "result": "25.0"},
                {"testOrderIndex": 1, "dateIndex": 0, "abnormal": false, "result": "55.0"},
                {"testOrderIndex": 2, "dateIndex": 0, "abnormal": false, "result": "85.0"}
            ], "orders":[
                {"index":0, "minNormal": 0.0, "maxNormal": 0.0, "testName": "ZN Stain(Sputum)", "testUnitOfMeasurement":"%", "panelName": "Routine Blood"},
                {"index":1, "minNormal": 0.0, "maxNormal": 0.0, "testName": "CD4 Test", "testUnitOfMeasurement":"%"},
                {"index":2, "minNormal": 0.0, "maxNormal": 0.0, "testName": "Platelets", "testUnitOfMeasurement":"%", "panelName": "Routine Blood"}
            ], "dates":[
                {"index":0, "date": "30-May-2014"}
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
            numberOfVisits: 1,
            groupOrdersByPanel: true
        };

        it("should group tabularResult by panel", function(done){
            labOrderResultService.getAllForPatient(params).then(function(results) {
                expect(mockHttp.get.calls.mostRecent().args[1].params.patientUuid).toBe("123");

                expect(results.tabular.tabularResult.orders[0].isPanel).toBeFalsy();
                expect(results.tabular.tabularResult.orders[0].orderName).toBe("CD4 Test");
                expect(results.tabular.tabularResult.orders[1].isPanel).toBeTruthy();
                expect(results.tabular.tabularResult.orders[1].orderName).toBe("Routine Blood");
                expect(results.tabular.tabularResult.orders[1].tests.length).toBe(2);
                done();
            });
        });
        
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

    describe("getReferredOutPrintableLabOrders", function () {

        it("should return empty array when no lab orders are provided", function () {
            expect(labOrderResultService.getReferredOutPrintableLabOrders([])).toEqual([]);
        });

        it("should include individual test that is referred out", function () {
            var labOrders = [
                { testName: 'Sodium', orderName: 'Sodium', referredOut: true, commentToFulfiller: 'Urgent' }
            ];
            var result = labOrderResultService.getReferredOutPrintableLabOrders(labOrders);
            expect(result.length).toBe(1);
            expect(result[0].name).toBe('Sodium');
            expect(result[0].notes).toBe('Urgent');
            expect(result[0].isSubTest).toBe(false);
        });

        it("should exclude individual test that is not referred out", function () {
            var labOrders = [
                { testName: 'Sodium', orderName: 'Sodium', referredOut: false }
            ];
            var result = labOrderResultService.getReferredOutPrintableLabOrders(labOrders);
            expect(result.length).toBe(0);
        });

        it("should show panel with count of only referred out sub-tests", function () {
            var labOrders = [
                {
                    isPanel: true,
                    orderName: 'CBC',
                    tests: [
                        { testName: 'Haemoglobin', referredOut: true, commentToFulfiller: 'Check levels' },
                        { testName: 'Platelets', referredOut: false }
                    ]
                }
            ];
            var result = labOrderResultService.getReferredOutPrintableLabOrders(labOrders);
            expect(result.length).toBe(2);
            expect(result[0].name).toBe('CBC (1)');
            expect(result[0].notes).toBe('Check levels');
            expect(result[0].isSubTest).toBe(false);
            expect(result[1].name).toBe('Haemoglobin');
            expect(result[1].isSubTest).toBe(true);
        });

        it("should include all sub-tests of a panel when all are referred out", function () {
            var labOrders = [
                {
                    isPanel: true,
                    orderName: 'Electrolyte',
                    tests: [
                        { testName: 'Sodium', referredOut: true, commentToFulfiller: 'testing electrolyte' },
                        { testName: 'Potassium', referredOut: true, commentToFulfiller: 'testing electrolyte' }
                    ]
                }
            ];
            var result = labOrderResultService.getReferredOutPrintableLabOrders(labOrders);
            expect(result.length).toBe(3);
            expect(result[0].name).toBe('Electrolyte (2)');
            expect(result[1].name).toBe('Sodium');
            expect(result[1].isSubTest).toBe(true);
            expect(result[2].name).toBe('Potassium');
            expect(result[2].isSubTest).toBe(true);
        });

        it("should exclude panel entirely when none of its sub-tests are referred out", function () {
            var labOrders = [
                {
                    isPanel: true,
                    orderName: 'CBC',
                    tests: [
                        { testName: 'Haemoglobin', referredOut: false },
                        { testName: 'Platelets', referredOut: false }
                    ]
                }
            ];
            var result = labOrderResultService.getReferredOutPrintableLabOrders(labOrders);
            expect(result.length).toBe(0);
        });

        it("should exclude sub-tests appearing as individual items (duplicates from flattened accession)", function () {
            var labOrders = [
                {
                    isPanel: true,
                    orderName: 'Electrolyte',
                    tests: [
                        { testName: 'Sodium', referredOut: true, commentToFulfiller: 'testing electrolyte' }
                    ]
                },
                { testName: 'Sodium', orderName: 'Sodium', panelName: 'Electrolyte', referredOut: true }
            ];
            var result = labOrderResultService.getReferredOutPrintableLabOrders(labOrders);
            expect(result.length).toBe(2);
            expect(result[0].name).toBe('Electrolyte (1)');
            expect(result[1].name).toBe('Sodium');
            expect(result[1].isSubTest).toBe(true);
        });

        it("should handle mix of individual tests and panels correctly", function () {
            var labOrders = [
                { testName: 'Blood Sugar', orderName: 'Blood Sugar', referredOut: true, commentToFulfiller: 'Fasting' },
                { testName: 'Urine Routine', orderName: 'Urine Routine', referredOut: false },
                {
                    isPanel: true,
                    orderName: 'CBC',
                    tests: [
                        { testName: 'Haemoglobin', referredOut: true, commentToFulfiller: 'Correlate' },
                        { testName: 'Platelets', referredOut: false }
                    ]
                }
            ];
            var result = labOrderResultService.getReferredOutPrintableLabOrders(labOrders);
            expect(result.length).toBe(3);
            expect(result[0].name).toBe('Blood Sugar');
            expect(result[1].name).toBe('CBC (1)');
            expect(result[2].name).toBe('Haemoglobin');
            expect(result[2].isSubTest).toBe(true);
        });

        it("should use empty string for notes when commentToFulfiller is absent", function () {
            var labOrders = [
                { testName: 'Sodium', orderName: 'Sodium', referredOut: true }
            ];
            var result = labOrderResultService.getReferredOutPrintableLabOrders(labOrders);
            expect(result[0].notes).toBe('');
        });

    });
});
