'use strict';

describe("DocumentController", function () {

    var scope;
    var documentController;
    var encounterService;
    var stateParams = {patientUuid: 'pat-uuid', visitUuid: "abc"};
    var spinner;
    var encounterConfig;
    var appConfig;
    var visitDocumentService;
    var visit1, visit2;
    var visitDocument;
    var sessionService;

    var createVisit = function (startDateTime, stopDateTime, uuid) {
        var visit = new Bahmni.DocumentUpload.Visit();
        visit.startDatetime = startDateTime;
        visit.stopDatetime = stopDateTime;
        visit.uuid = uuid;
        visit.images = [

            {
                "encodedValue": "/document_images/157100/157051-RADIOLOGY-5f5e8a60-eecf-40f9-b760-ed7c89f54f3e.jpeg",
                "new": true,
                "title": "",
                "concept": {
                    "editableName": "LEG Foot AP",
                    "uuid": "concept uuid"
                },
                "changed": true
            }
            ,
            {
                "id": 642124,
                "obsUuid": "dd24732d-a4f9-49be-af7f-6fc2c2c39f0c",
                "encodedValue": "/document_images/157100/157051-RADIOLOGY-e9d1f0cc-9af9-431b-a178-a5d05d7f16b2.jpeg",
                "visitUuid": "c0eb6a75-a427-45ea-a911-06684bb45e30",
                "encounterUuid": "ef2386a7-8108-49cc-811e-0e2fc40eeaf4",
                "providerUuid": "8af2380e-21fb-45cb-8af5-5247b819291b",
                "changed": true,
                "concept": {
                    "uuid": "4553bd77-9bcd-11e3-b8ce-43d3573b23fb",
                    "editableName": "Foot - Left, 2 views (X-ray)",
                    "name": "Foot - Left, 2 views (X-ray)"
                },
                "title": "Foot - Left, 2 views (X-ray)"
            },
            {
                "id": 642122,
                "obsUuid": "c6cec9e3-a37a-4c62-99ec-8b523fd3c1d6",
                "encodedValue": "/document_images/157100/157051-RADIOLOGY-e9d1f0cc-9af9-431b-a178-a5d05d7f16b2.jpeg",
                "visitUuid": "c0eb6a75-a427-45ea-a911-06684bb45e30",
                "encounterUuid": "ef2386a7-8108-49cc-811e-0e2fc40eeaf4",
                "providerUuid": "8af2380e-21fb-45cb-8af5-5247b819291b",
                "concept": {
                    "uuid": "8207faff-9bcd-11e3-b8ce-43d3573b23fb",
                    "editableName": "HEAD Skull PA",
                    "name": "HEAD Skull PA"
                },
                "title": "HEAD Skull PA"
            }
        ];

        visit.encounters = [
            {
                "uuid": "7e5d3cdb-9172-4f23-966c-c05780d26ad6",
                "provider": {
                    "uuid": "8af2380e-21fb-45cb-8af5-5247b819291b"
                },
                "visit": {
                    "uuid": "c0eb6a75-a427-45ea-a911-06684bb45e30"
                },
                "obs": [
                    {
                        "uuid": "7d66d8dd-6308-473d-bbed-b4db9ed7809a",
                        "concept": {
                            "uuid": "39d085f3-9bcd-11e3-927e-8840ab96f0f1",
                            "name": {
                                "display": "Chest, 1 view (X-ray)",
                                "name": "Chest, 1 view (X-ray)"
                            }
                        },
                        "groupMembers": [
                            {
                                "id": 642031,
                                "uuid": "3353aeb1-71bd-413f-8502-21751d9e740c",
                                "obsDatetime": "2014-07-01T15:02:01.000+0530",
                                "value": "157100/157051-RADIOLOGY-67a5ba4b-9bae-4cfb-845e-8bdf3d4433cb.jpeg"
                            }
                        ]
                    },
                    {
                        "uuid": "971d0d84-979f-42a2-9128-5c057b8fd001",
                        "concept": {
                            "uuid": "5cf6e01d-9bcd-11e3-b8ce-43d3573b23fb",
                            "name": {
                                "display": "Mandible panorex (X-ray) ",
                                "uuid": "5d154939-9bcd-11e3-b8ce-43d3573b23fb",
                                "name": "Mandible panorex (X-ray) "
                            }
                        },
                        "groupMembers": [
                            {
                                "id": 642035,
                                "uuid": "7ada7adc-a227-4871-9130-602ac6272a78",
                                "obsDatetime": "2014-07-01T15:03:07.000+0530",
                                "value": "157100/157051-RADIOLOGY-6ed82386-907a-49a1-85c8-2b9afeb87c48.jpeg"
                            }
                        ]
                    }
                ]
            }
        ];

        visit.visitType = {
            uuid: "visitType uuid"
        };
        return visit;
    };

    beforeEach(module('opd.documentupload'));

    beforeEach(inject(function ($rootScope) {
        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        encounterConfig = jasmine.createSpyObj('encounterConfig', ['getEncounterTypeUuid']);
        appConfig = jasmine.createSpyObj('encounterConfig', ['encounterType']);
        visitDocumentService = jasmine.createSpyObj('visitDocumentService', ['save']);
        sessionService = jasmine.createSpyObj('sessionService', ['getLoginLocationUuid']);
        encounterService = jasmine.createSpyObj('encounterService',['activeEncounter']);

    }));

    var mockEncounterService = function (data) {
        encounterService.activeEncounter.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({data: data})
                }
            }
        });
    };

    var setUp = function () {
        mockEncounterService([]);
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();

            visit1 = createVisit(new Date("April 21, 2014"), new Date("April 24, 2014 23:59:59"), "visit uuid");
            visit2 = createVisit("April 25, 2014", "April 25, 2014 23:59:59");

            scope.encounterConfig = encounterConfig;
            scope.appConfig = appConfig;
            scope.patient = {
                uuid: 'patient uuid'
            };
            scope.currentProvider = {
                uuid: 'provider uuid'
            };

            scope.currentUser = {
                person: {
                    uuid: "provider1 uuid"
                }
            };
            documentController = $controller('DocumentController', {
                $scope: scope,
                spinner: spinner,
                $rootScope: scope,
                $stateParams: stateParams,
                visitDocumentService: visitDocumentService,
                encounterService: encounterService,
                sessionService: sessionService
            });
            scope.visits = [visit1, visit2];

        });
    };

    describe("checkValidityOfDate", function () {
        it('should not be valid date if date overlaps with existing visit', function () {
            setUp();
            var newVisit = new Bahmni.DocumentUpload.Visit();
            scope.newVisit = newVisit;

            newVisit.startDatetime = "April 22, 2014";
            newVisit.stopDatetime = "April 22, 2014 23:59:59";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 21, 2014"
            newVisit.stopDatetime = "April 21, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 24, 2014"
            newVisit.stopDatetime = "April 25, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 4, 2014"
            newVisit.stopDatetime = "April 5, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(true);

            newVisit.startDatetime = "April 29, 2014"
            newVisit.stopDatetime = "April 30, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(true);

            newVisit.startDatetime = "April 26, 2014"
            newVisit.stopDatetime = "April 26, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(true);

            newVisit.startDatetime = "April 25, 2014"
            newVisit.stopDatetime = "April 25, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 21, 2014"
            newVisit.stopDatetime = "April 26, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 23, 2014"
            newVisit.stopDatetime = "April 26, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 19, 2014"
            newVisit.stopDatetime = "April 23, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 20, 2014"
            newVisit.stopDatetime = "April 24, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 19, 2014"
            newVisit.stopDatetime = "April 29, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 21, 2014"
            newVisit.stopDatetime = "April 29, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 21, 2014"
            newVisit.stopDatetime = "April 24, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 25, 2014"
            newVisit.stopDatetime = "April 26, 2014 23:59:59"
            expect(scope.isNewVisitDateValid()).toBe(false);
        });
        it('should not be valid date if date overlaps with existing visit when the visit has no end date', function () {
            var visit3 = new Bahmni.DocumentUpload.Visit();
            visit3.startDatetime = "April 25, 2014";
            visit3.stopDatetime = "Invalid Date";
            setUp();
            var newVisit = new Bahmni.DocumentUpload.Visit();
            scope.newVisit = newVisit;
            scope.visits = [visit3];

            newVisit.startDatetime = "April 25, 2014";
            newVisit.stopDatetime = "";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 26, 2014";
            newVisit.stopDatetime = "";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 26, 2014";
            newVisit.stopDatetime = "April 27, 2014";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 26, 2014";
            newVisit.stopDatetime = "April 26, 2014";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 24, 2014";
            newVisit.stopDatetime = "April 24, 2014";
            expect(scope.isNewVisitDateValid()).toBe(true);

            newVisit.startDatetime = "April 23, 2014";
            newVisit.stopDatetime = "April 24, 2014";
            expect(scope.isNewVisitDateValid()).toBe(true);

            newVisit.startDatetime = "April 25, 2014";
            newVisit.stopDatetime = "April 25, 2014";
            expect(scope.isNewVisitDateValid()).toBe(false);


            newVisit.startDatetime = "December 25, 2014";
            newVisit.stopDatetime = "";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "December 25, 2013";
            newVisit.stopDatetime = "April 25, 2014";
            expect(scope.isNewVisitDateValid()).toBe(false);

        });

    });

    describe('patient document save', function () {

        var startDate = new Date("April 21, 2014");
        var stopDate = new Date("April 24, 2014 23:59:59");

        visitDocument = {};
        visitDocument.patientUuid = "patient uuid";
        visitDocument.visitTypeUuid = "visitType uuid";
        visitDocument.visitStartDate = startDate;
        visitDocument.visitEndDate = stopDate;
        visitDocument.encounterTypeUuid = undefined;
        visitDocument.encounterDateTime = startDate;
        visitDocument.providerUuid = "provider uuid";
        visitDocument.visitUuid = "visit uuid";
        visitDocument.locationUuid = undefined;
        visitDocument.documents = [
            {
                testUuid: "concept uuid",
                image: "157100/157051-RADIOLOGY-5f5e8a60-eecf-40f9-b760-ed7c89f54f3e.jpeg",
                obsDateTime: startDate
            },
            {
                testUuid: "4553bd77-9bcd-11e3-b8ce-43d3573b23fb",
                image: "157100/157051-RADIOLOGY-e9d1f0cc-9af9-431b-a178-a5d05d7f16b2.jpeg",
                obsUuid: "dd24732d-a4f9-49be-af7f-6fc2c2c39f0c",
                voided: undefined
            }
        ];

        it('should save the visit document', function () {
            setUp();
            var visitDocumentServiceSavePromise = specUtil.createServicePromise('visitDocumentService');
            visitDocumentService.save.and.returnValue(visitDocumentServiceSavePromise);

            scope.save(visit1);

            expect(visitDocumentService.save).toHaveBeenCalledWith(visitDocument);

        })
    });

    describe('can delete image ', function () {
        beforeEach(function(){
            setUp();
        });

        it('Should return true if the provider is same as the user', function () {
            var obs = {
                provider: {
                    uuid: 'provider1 uuid'
                }
            };
            expect(scope.canDeleteImage(obs)).toBeTruthy();
        });

        it('Should return false if the provider is not same as the user', function () {
            var obs = {
                provider: {
                    uuid: 'provider2 uuid'
                }
            };
            scope.canDeleteImage(obs);
            expect(scope.canDeleteImage(obs)).toBeFalsy();
        });

        it('Should return true if the obs is new', function () {
            var obs = {
                new: true
            };
            scope.canDeleteImage(obs);
            expect(scope.canDeleteImage(obs)).toBeTruthy();
        })
    })
});


