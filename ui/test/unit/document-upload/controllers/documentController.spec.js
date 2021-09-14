'use strict';

describe("DocumentController", function () {

    var scope, translate;
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
    var visitService;
    var patientService;
    var messagingService;

    var createVisit = function (startDateTime, stopDateTime, uuid) {
        var visit = new Bahmni.DocumentUpload.Visit();
        visit.startDatetime = startDateTime;
        visit.stopDatetime = stopDateTime;
        visit.uuid = uuid;
        visit.files = [

            {
                "encodedValue": "/document_images/157100/157051-RADIOLOGY-5f5e8a60-eecf-40f9-b760-ed7c89f54f3e.jpeg",
                "new": true,
                "title": "",
                "concept": {
                    "editableName": "LEG Foot AP",
                    "uuid": "concept uuid"
                },
                "changed": true,
                "comment": "abnormal LEG Foot AP"
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
                "title": "Foot - Left, 2 views (X-ray)",
                "comment": "abnormal Foot - Left, 2 views (X-ray)"
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
                "title": "HEAD Skull PA",
                "comment": "abnormal HEAD Skull PA"
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

    var date = new Date();
    var patient = {
        "uuid": "patient uuid",
        "auditInfo": {
            dateCreated: moment(date).format()
        },
        "identifiers": [
            {
                "identifier": "GAN200003"
            }
        ],
        "person": {
            "gender": "F",
            "bloodGroup": "AB+",
            "age": 0,
            "birthdate": moment(date).format(),
            "birthdateEstimated": false,
            "preferredName": {
                "uuid": "72573d85-7793-49c1-8c29-7647c0a6a425",
                "givenName": "first",
                "middleName": "middle",
                "familyName": "family"
            },

            "preferredAddress": {
                "display": "house1243",
                "uuid": "7746b284-82d5-4251-a7ec-6685b0ced206",
                "preferred": true,
                "address1": "house1243",
                "address2": null,
                "cityVillage": "village22",
                "stateProvince": "state",
                "countyDistrict": "dist",
                "address3": "tehsilkk"
            },
            "attributes": [
                {
                    "uuid": "2a71ee67-3446-4f66-8267-82446bda21a7",
                    "value": "some-class",
                    "attributeType": {
                        "uuid": "d3d93ab0-e796-11e2-852f-0800271c1b75"
                    }
                } ,
                {
                    "uuid": "2a71ee67-3446-4f66-8267-82446bda2999",
                    "value": "1998-12-31T18:30:00.000+0000",
                    "attributeType": {
                        "uuid": "d3d93ab0-e796-11e2-852f-0800271c1999"
                    }
                } ,
                {
                    "uuid": "3da8141e-65d6-452e-9cfe-ce813bd11d52",
                    "value":  {
                        uuid : "4da8141e-65d6-452e-9cfe-ce813bd11d52",
                        display: "some-value"
                    },
                    "attributeType": {
                        "uuid": "d3e6dc74-e796-11e2-852f-0800271c1b75"
                    }
                }
            ],
            "auditInfo": {
                dateCreated: moment(date).format()
            }
        }
    };

    beforeEach(module('opd.documentupload'));

    beforeEach(inject(function () {
        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        encounterConfig = jasmine.createSpyObj('encounterConfig', ['getEncounterTypeUuid']);
        appConfig = jasmine.createSpyObj('encounterConfig', ['encounterType']);
        visitDocumentService = jasmine.createSpyObj('visitDocumentService', ['save', 'saveFile', 'getFileType']);
        sessionService = jasmine.createSpyObj('sessionService', ['getLoginLocationUuid']);
        patientService = jasmine.createSpyObj('patientService', ['getPatient']);
        encounterService = jasmine.createSpyObj('encounterService',['find', 'getEncountersForEncounterType']);
        visitService = jasmine.createSpyObj('visitService',['getVisitType','search']);
        messagingService = jasmine.createSpyObj('messagingService',['showMessage']);
    }));

    /*Mock of constructor Bahmni.PatientMapper*/
    var originalPatientMapper, spyPatientMapperInstance;
    beforeEach(function () {
        spyPatientMapperInstance = jasmine.createSpyObj('PatientMapperInstance', ['map']);
        spyPatientMapperInstance.map.and.callFake(function (toBeMapped) {
            return toBeMapped;
        });

        originalPatientMapper = Bahmni.PatientMapper;
        Bahmni.PatientMapper = function () {
            return spyPatientMapperInstance;
        };
    });
    afterEach(function () {
        Bahmni.PatientMapper = originalPatientMapper;
    });
    /*********/

    var mockEncounterService = function (data) {
        encounterService.find.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({data: data})
                }
            }
        });
    };

    var mockGetEncountersForEncounterType = function (data) {
        encounterService.getEncountersForEncounterType.and.returnValue(specUtil.simplePromise(data));
    };

    var mockVisitService = function(data) {
        visitService.getVisitType.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({data: data})
                }
            }
        });
    };

    var mockPatientService = function(data) {
        patientService.getPatient.and.returnValue(specUtil.simplePromise(data));
    };
    var mockVisitServiceSearch = function(data) {
        visitService.search.and.returnValue(specUtil.simplePromise(data));
    };

    var setUp = function () {
        mockEncounterService([]);
        mockVisitService([]);
        mockPatientService(patient);
        visit1 = createVisit(new Date("April 21, 2014"), new Date("April 24, 2014 23:59:59"), "visit uuid");
        visit2 = createVisit("April 25, 2014", "April 25, 2014 23:59:59");

        mockVisitServiceSearch({data:{results: [visit1, visit2]}});
        mockGetEncountersForEncounterType({results: []});
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();

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

            translate = jasmine.createSpyObj('$translate', ['instant']);

            documentController = $controller('DocumentController', {
                $scope: scope,
                spinner: spinner,
                $rootScope: scope,
                $stateParams: stateParams,
                visitDocumentService: visitDocumentService,
                encounterService: encounterService,
                sessionService: sessionService,
                patientService: patientService,
                $translate: translate,
                visitService: visitService,
                messagingService: messagingService
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

            newVisit.startDatetime = "April 21, 2014";
            newVisit.stopDatetime = "April 21, 2014 23:59:59";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 24, 2014";
            newVisit.stopDatetime = "April 25, 2014 23:59:59";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 4, 2014";
            newVisit.stopDatetime = "April 5, 2014 23:59:59";
            expect(scope.isNewVisitDateValid()).toBe(true);

            newVisit.startDatetime = "April 29, 2014";
            newVisit.stopDatetime = "April 30, 2014 23:59:59";
            expect(scope.isNewVisitDateValid()).toBe(true);

            newVisit.startDatetime = "April 26, 2014";
            newVisit.stopDatetime = "April 26, 2014 23:59:59";
            expect(scope.isNewVisitDateValid()).toBe(true);

            newVisit.startDatetime = "April 25, 2014";
            newVisit.stopDatetime = "April 25, 2014 23:59:59";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 21, 2014";
            newVisit.stopDatetime = "April 26, 2014 23:59:59";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 23, 2014";
            newVisit.stopDatetime = "April 26, 2014 23:59:59";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 19, 2014";
            newVisit.stopDatetime = "April 23, 2014 23:59:59";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 20, 2014";
            newVisit.stopDatetime = "April 24, 2014 23:59:59";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 19, 2014";
            newVisit.stopDatetime = "April 29, 2014 23:59:59";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 21, 2014";
            newVisit.stopDatetime = "April 29, 2014 23:59:59";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 21, 2014";
            newVisit.stopDatetime = "April 24, 2014 23:59:59";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 25, 2014";
            newVisit.stopDatetime = "April 26, 2014 23:59:59";
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

            newVisit.startDatetime = "April 23, 2014";
            newVisit.stopDatetime = "";
            expect(scope.isNewVisitDateValid()).toBe(false);

            newVisit.startDatetime = "April 22, 2014";
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
                obsDateTime: startDate,
                comment: "abnormal LEG Foot AP"
            },
            {
                testUuid: "4553bd77-9bcd-11e3-b8ce-43d3573b23fb",
                image: "157100/157051-RADIOLOGY-e9d1f0cc-9af9-431b-a178-a5d05d7f16b2.jpeg",
                obsUuid: "dd24732d-a4f9-49be-af7f-6fc2c2c39f0c",
                voided: undefined,
                comment: "abnormal Foot - Left, 2 views (X-ray)"
            }
        ];

        it('should save the visit document', function () {
            setUp();
            visit1.visitType.display = 'OPD';
            var visitDocumentServiceSavePromise = specUtil.createServicePromise('visitDocumentService');
            visitDocumentService.save.and.returnValue(visitDocumentServiceSavePromise);
            scope.save(visit1);

            expect(visitDocumentService.save).toHaveBeenCalledWith(visitDocument);

        });

        it('should save the existing visit data even there is invalid date entered under new visit section', function(){
            setUp();
            visit1.visitType.display = 'OPD';
            var newVisit = new Bahmni.DocumentUpload.Visit();
            scope.newVisit = newVisit;

            newVisit.startDatetime = "April 21, 2014";
            newVisit.stopDatetime = "April 21, 2014 23:59:59";

            var visitDocumentServiceSavePromise = specUtil.createServicePromise('visitDocumentService');
            visitDocumentService.save.and.returnValue(visitDocumentServiceSavePromise);

            scope.save(visit1);

            expect(visitDocumentService.save).toHaveBeenCalledWith(visitDocument);

        });

    });

    describe('can delete file ', function () {
        beforeEach(function(){
            setUp();
        });

        it('Should return true if the provider is same as the user', function () {
            var obs = {
                provider: {
                    uuid: 'provider1 uuid'
                }
            };
            expect(scope.canDeleteFile(obs)).toBeTruthy();
        });

        it('Should return false if the provider is not same as the user', function () {
            var obs = {
                provider: {
                    uuid: 'provider2 uuid'
                }
            };
            scope.canDeleteFile(obs);
            expect(scope.canDeleteFile(obs)).toBeFalsy();
        });

        it('Should return true if the obs is new', function () {
            var obs = {
                new: true
            };
            scope.canDeleteFile(obs);
            expect(scope.canDeleteFile(obs)).toBeTruthy();
        })
    });

    describe('Validate Order', function () {
        beforeEach(function () {
            setUp();
        });


        it('Should remove the current order when both orders are same', function () {
            var newVisit = new Bahmni.DocumentUpload.Visit();
            scope.currentVisit = newVisit;
            scope.newVisit = newVisit;
            expect(scope.resetCurrentVisit(newVisit)).toBeNull();
        });

        it('Should open a new visit when new visit is not the current one', function () {
            var newVisit = new Bahmni.DocumentUpload.Visit();

            scope.newVisit = newVisit;

            var visit = createVisit("April 21, 2014", "April 21, 2014 23:59:59", "7d66d8dd-6308-473d-bbed-b4db9ed7809a");

            var visit2 = createVisit("April 22, 2014", "April 22, 2014 23:59:59", "7d66d8dd-6308-473d-bbed-b4db9ed7809a");

            scope.currentVisit = visit;
            scope.resetCurrentVisit(visit2);

            expect(scope.currentVisit).toBe(newVisit);
        });
    });
    
    describe("OnSelect", function() {
        it("should save the image file", function () {
            setUp();
            visitDocumentService.saveFile.and.returnValue(specUtil.simplePromise({data: { url : "tes-file.jpeg" }}));
            visitDocumentService.getFileType.and.returnValue("image");
            var newVisit = new Bahmni.DocumentUpload.Visit();
            appConfig.encounterType.and.returnValue("Radiology");

            var file = "image/jpeg;base64asdlkjfklasjdfalsjdfkl";
            var fileName = "test-file.jpeg";
            var fileType = "image";

            scope.onSelect(file, newVisit, fileName, "image/jpeg");

            expect(visitDocumentService.saveFile).toHaveBeenCalledWith(file, "patient uuid" , appConfig.encounterType, fileName, fileType);

        });

        it("should save the pdf file", function () {
            setUp();
            visitDocumentService.saveFile.and.returnValue(specUtil.simplePromise({data: { url : "tes-file.pdf" }}));
            visitDocumentService.getFileType.and.returnValue("pdf");
            var newVisit = new Bahmni.DocumentUpload.Visit();
            appConfig.encounterType.and.returnValue("Radiology");

            var file = "application/pdf;base64asdlkjfklasjdfalsjdfkl";
            var fileName = "test-file.pdf";
            var fileType = "pdf";

            scope.onSelect(file, newVisit, fileName, "application/pdf");

            expect(visitDocumentService.saveFile).toHaveBeenCalledWith(file, "patient uuid" , appConfig.encounterType, fileName, fileType);

        });

        it("should show error message dialog box when user uploads a video", function () {
            setUp();
            messagingService.showMessage.and.returnValue(specUtil.simplePromise("something"));
            visitDocumentService.getFileType.and.returnValue("not_supported");
            translate.instant.and.returnValue("File type is not supported");
            var newVisit = new Bahmni.DocumentUpload.Visit();
            appConfig.encounterType.and.returnValue("Radiology");

            var file = "video/mp4;base64asdlkjfklasjdfalsjdfkl";
            var fileName = "test-file.mp4";
            scope.$$phase = true;
            scope.onSelect(file, newVisit, fileName, "video/mp4");

            expect(messagingService.showMessage).toHaveBeenCalledWith('error', "File type is not supported");

        });

        it("should show error message dialog box when user uploads a file which is not image and pdf", function () {
            setUp();
            messagingService.showMessage.and.returnValue(specUtil.simplePromise("something"));
            visitDocumentService.getFileType.and.returnValue("not_supported");
            translate.instant.and.returnValue("File type is not supported");
            var newVisit = new Bahmni.DocumentUpload.Visit();
            appConfig.encounterType.and.returnValue("Radiology");

            var file = "data/csv;base64asdlkjfklasjdfalsjdfkl";
            var fileName = "test-file.csv";

            scope.$$phase = true;
            scope.onSelect(file, newVisit, fileName, "document/csv");

            expect(messagingService.showMessage).toHaveBeenCalledWith('error', "File type is not supported");

        });
    });
});
