'use strict';

describe('OfflineDbService ', function () {
    var offlineDbService, $q = Q;
    var patientDbService, patientIdentifierDbService, patientAddressDbService, patientAttributeDbService, offlineMarkerDbService, offlineAddressHierarchyDbService,labOrderResultsDbService, offlineService,
        offlineConfigDbService, initializeOfflineSchema, referenceDataDbService, locationDbService, offlineSearchDbService, encounterDbService, visitDbService, observationDbService, conceptDbService, errorLogDbService, eventLogService;

    beforeEach(function () {
        module('bahmni.common.offline');
        module(function ($provide) {
            patientDbService = jasmine.createSpyObj('patientDbService', ['getPatientByUuid', 'insertPatientData']);
            patientIdentifierDbService = jasmine.createSpyObj('patientIdentifierDbService', ['insertPatientIdentifiers']);
            patientAddressDbService = jasmine.createSpyObj('patientAddressDbService', ['insertAddress']);
            patientAttributeDbService = jasmine.createSpyObj('patientAttributeDbService', ['insertAttributes', 'getAttributeTypes']);
            labOrderResultsDbService = jasmine.createSpyObj('labOrderResultsDbService', ['insertLabOrderResults', 'getLabOrderResultsForPatient']);
            offlineMarkerDbService = jasmine.createSpyObj('offlineMarkerDbService', ['init', 'getMarker', 'insertMarker']);
            offlineAddressHierarchyDbService = jasmine.createSpyObj('offlineAddressHierarchyDbService', ['init', 'insertAddressHierarchy', 'search']);
            offlineConfigDbService = jasmine.createSpyObj('offlineConfigDbService', ['init', 'getConfig', 'insertConfig']);
            initializeOfflineSchema = jasmine.createSpyObj('initializeOfflineSchema', ['initSchema', 'reinitSchema']);
            referenceDataDbService = jasmine.createSpyObj('referenceDataDbService', ['init', 'getReferenceData', 'insertReferenceData']);
            locationDbService = jasmine.createSpyObj('locationDbService', ['getLocationByUuid']);
            offlineSearchDbService = jasmine.createSpyObj('offlineSearchDbService', ['init']);
            encounterDbService = jasmine.createSpyObj('encounterDbService', ['insertEncounterData', 'getEncountersByPatientUuid', 'findActiveEncounter', 'getEncountersByVisits', 'getEncounterByEncounterUuid']);
            visitDbService = jasmine.createSpyObj('visitDbService', ['insertVisitData', 'getVisitByUuid', 'getVisitsByPatientUuid', 'getVisitDetailsByPatientUuid']);
            observationDbService = jasmine.createSpyObj('observationDbService', ['insertObservationsData', 'getObservationsFor']);
            conceptDbService = jasmine.createSpyObj('conceptDbService', ['init', 'getReferenceData', 'getConceptByName', 'insertConceptAndUpdateHierarchy', 'updateChildren', 'updateParentJson', 'getAllParentsInHierarchy']);
            errorLogDbService = jasmine.createSpyObj('errorLogDbService', ['insertLog', 'getErrorLogByUuid', 'deleteByUuid']);
            eventLogService = jasmine.createSpyObj('eventLogService', ['getDataForUrl']);
            offlineService = jasmine.createSpyObj('offlineService', ['getItem']);

            $provide.value('patientDbService', patientDbService);
            $provide.value('patientIdentifierDbService', patientIdentifierDbService);
            $provide.value('patientAddressDbService', patientAddressDbService);
            $provide.value('patientAttributeDbService', patientAttributeDbService);
            $provide.value('labOrderResultsDbService', labOrderResultsDbService);
            $provide.value('offlineMarkerDbService', offlineMarkerDbService);
            $provide.value('offlineAddressHierarchyDbService', offlineAddressHierarchyDbService);
            $provide.value('offlineConfigDbService', offlineConfigDbService);
            $provide.value('initializeOfflineSchema', initializeOfflineSchema);
            $provide.value('referenceDataDbService', referenceDataDbService);
            $provide.value('locationDbService', locationDbService);
            $provide.value('offlineSearchDbService', offlineSearchDbService);
            $provide.value('encounterDbService', encounterDbService);
            $provide.value('visitDbService', visitDbService);
            $provide.value('observationDbService', observationDbService);
            $provide.value('conceptDbService', conceptDbService);
            $provide.value('errorLogDbService', errorLogDbService);
            $provide.value('eventLogService', eventLogService);
            $provide.value('offlineService', offlineService);
            $provide.value('$q', $q);
        });
    });


    beforeEach(inject(['offlineDbService', function (offlineDbServiceInjected) {
        offlineDbService = offlineDbServiceInjected;
    }]));

    it("should init offlineDbService with db reference", function (done) {
        var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
        schemaBuilder.connect().then(function (db) {
            offlineDbService.init(db);
            expect(offlineAddressHierarchyDbService.init).toHaveBeenCalledWith(db);
            expect(offlineSearchDbService.init).toHaveBeenCalledWith(db);
            done();
        });
    });

    it("should init offlineDbService with metadata db reference", function (done) {
        var metaDataSchemaBuilder = lf.schema.create(Bahmni.Common.Constants.bahmniConnectMetaDataDb, 1);
        var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
        schemaBuilder.connect().then(function (db) {
            offlineDbService.init(db);
            metaDataSchemaBuilder.connect().then(function (metaDataDb) {
                offlineDbService.init(metaDataDb);
                expect(offlineConfigDbService.init).toHaveBeenCalledWith(metaDataDb);
                expect(referenceDataDbService.init).toHaveBeenCalledWith(metaDataDb, db);
                expect(conceptDbService.init).toHaveBeenCalledWith(metaDataDb);
                metaDataDb.close();
                done();
            });
        });

    });


    describe("encounterDbService ", function () {
        it("should getActiveEncounter with given params", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                var encounterSessionDuration = 60;
                var defaultEncounterType = "FIELD";
                referenceDataDbService.getReferenceData.and.callFake(function (referenceData) {
                    if (referenceData == "encounterSessionDuration") {
                        return specUtil.respondWithPromise($q, {data: encounterSessionDuration});
                    }
                    if (referenceData == "DefaultEncounterType") {
                        return specUtil.respondWithPromise($q, {data: defaultEncounterType});
                    }
                    return null;
                });

                encounterDbService.findActiveEncounter.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve(["Active Encounter1", "Active Encounter2"]);
                    return deferred1.promise;
                });

                var params = {patientUuid: "patientUuid", providerUuids: ["providerUuid"]}

                offlineDbService.getActiveEncounter(params).then(function (activeEncounters) {
                    expect(activeEncounters).not.toBeUndefined();
                    expect(activeEncounters.length).toBe(2);
                    expect(activeEncounters[0]).toBe("Active Encounter1");
                    expect(activeEncounters[1]).toBe("Active Encounter2");

                    expect(referenceDataDbService.getReferenceData).toHaveBeenCalledWith('encounterSessionDuration');
                    expect(referenceDataDbService.getReferenceData).toHaveBeenCalledWith('DefaultEncounterType');
                    expect(encounterDbService.findActiveEncounter).toHaveBeenCalledWith(db, {
                        patientUuid: params.patientUuid,
                        providerUuid: params.providerUuids[0],
                        encounterType: defaultEncounterType
                    }, encounterSessionDuration);
                    done();
                });
            });
        });

        it("should insertEncounterData with given encounterData and should not save observations in observationDb, if observations are not present in the encounterData", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                var encounterData = {patientUuid: "patientUuid", visitUuid: "visitUuid"};
                encounterDbService.insertEncounterData.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve(encounterData);
                    return deferred1.promise;
                });

                offlineDbService.insertEncounterData(encounterData).then(function (encounterDataResponse) {
                    expect(encounterDataResponse).not.toBeUndefined();
                    expect(encounterDataResponse).toBe(encounterData);
                    expect(encounterDbService.insertEncounterData).toHaveBeenCalledWith(db, encounterData);
                    expect(observationDbService.insertObservationsData.calls.count()).toBe(0);
                    done();
                });
            });
        });

        describe("insert encounter Data when there are multiple dbs", function () {
            var encounterData;
            beforeEach(function () {
               encounterData = {
                    patientUuid: "patientUuid",
                    visitUuid: "visitUuid",
                    observations: ["obs1", "obs2"]
                };
                encounterDbService.insertEncounterData.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve(encounterData);
                    return deferred1.promise;
                });

                observationDbService.insertObservationsData.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve(encounterData);
                    return deferred1.promise;
                });
            });

            it("should insertEncounterData with given encounterData in the db used by application on normal save", function (done) {
                var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
                schemaBuilder.connect().then(function (db) {
                    offlineDbService.init(db);
                    offlineDbService.insertEncounterData(encounterData).then(function (encounterDataResponse) {
                        expect(encounterDataResponse).not.toBeUndefined();
                        expect(encounterDataResponse).toBe(encounterData);
                        expect(encounterDbService.insertEncounterData).toHaveBeenCalledWith(db, encounterData);
                        expect(observationDbService.insertObservationsData).toHaveBeenCalledWith(db, encounterData.patientUuid, encounterData.visitUuid, encounterData.observations);
                        done();
                    });
                });
            });

            it("should insertEncounterData with given encounterData in the db that is passed to insertEncounter during sync", function (done) {
                var schemaBuilder = lf.schema.create('OtherBahmniOfflineDb', 1);
                schemaBuilder.connect().then(function (db) {
                    offlineDbService.init(db);
                    offlineDbService.insertEncounterData(encounterData, {"otherDb": 'otherdb'}).then(function (encounterDataResponse) {
                        expect(encounterDataResponse).not.toBeUndefined();
                        expect(encounterDataResponse).toBe(encounterData);
                        expect(encounterDbService.insertEncounterData).toHaveBeenCalledWith({"otherDb": 'otherdb'}, encounterData);
                        expect(observationDbService.insertObservationsData).toHaveBeenCalledWith({"otherDb": 'otherdb'}, encounterData.patientUuid, encounterData.visitUuid, encounterData.observations);
                        done();
                    });
                });
            });
        });

        it("should createEncounter with given encounterData having visitUuid", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                var encounterData = {
                    patientUuid: "patientUuid",
                    visitUuid: "visitUuid",
                    observations: ["obs1", "obs2"]
                };
                encounterDbService.insertEncounterData.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve(encounterData);
                    return deferred1.promise;
                });

                observationDbService.insertObservationsData.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve(encounterData);
                    return deferred1.promise;
                });

                eventLogService.getDataForUrl.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve({data: "visitData"});
                    return deferred1.promise;
                });

                visitDbService.insertVisitData.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve({});
                    return deferred1.promise;
                });

                offlineDbService.createEncounter(encounterData).then(function (encounterDataResponse) {
                    expect(encounterDataResponse).not.toBeUndefined();
                    expect(encounterDataResponse.data).toBe(encounterData);
                    expect(encounterDbService.insertEncounterData).toHaveBeenCalledWith(db, encounterData);
                    expect(observationDbService.insertObservationsData).toHaveBeenCalledWith(db, encounterData.patientUuid, encounterData.visitUuid, encounterData.observations);
                    expect(eventLogService.getDataForUrl).toHaveBeenCalledWith(Bahmni.Common.Constants.visitUrl + "/visitUuid");
                    expect(visitDbService.insertVisitData).toHaveBeenCalledWith(db, "visitData");
                    done();
                });
            });
        });

        it("should createEncounter with given encounterData having invalid visitUuid i.e. its not associated with any data on server side", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                var encounterData = {
                    patientUuid: "patientUuid",
                    visitUuid: "visitUuid",
                    observations: ["obs1", "obs2"]
                };
                encounterDbService.insertEncounterData.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve(encounterData);
                    return deferred1.promise;
                });

                observationDbService.insertObservationsData.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve(encounterData);
                    return deferred1.promise;
                });

                eventLogService.getDataForUrl.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.reject({data: "visitData"});
                    return deferred1.promise;
                });

                visitDbService.insertVisitData.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve({});
                    return deferred1.promise;
                });

                offlineDbService.createEncounter(encounterData).then(function (encounterDataResponse) {
                    expect(encounterDataResponse).not.toBeUndefined();
                    expect(encounterDataResponse.data).toBe(encounterData);
                    expect(encounterDbService.insertEncounterData).toHaveBeenCalledWith(db, encounterData);
                    expect(observationDbService.insertObservationsData).toHaveBeenCalledWith(db, encounterData.patientUuid, encounterData.visitUuid, encounterData.observations);
                    expect(eventLogService.getDataForUrl).toHaveBeenCalledWith(Bahmni.Common.Constants.visitUrl + "/visitUuid");
                    expect(visitDbService.insertVisitData.calls.count()).toBe(0);
                    done();
                });
            });
        });

        it("should createEncounter with given encounterData having no visitUuid", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                var encounterData = {patientUuid: "patientUuid", observations: ["obs1", "obs2"]};
                encounterDbService.insertEncounterData.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve(encounterData);
                    return deferred1.promise;
                });

                observationDbService.insertObservationsData.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve(encounterData);
                    return deferred1.promise;
                });

                offlineDbService.createEncounter(encounterData).then(function (encounterDataResponse) {
                    expect(encounterDataResponse).not.toBeUndefined();
                    expect(encounterDataResponse.data).toBe(encounterData);
                    expect(encounterDbService.insertEncounterData).toHaveBeenCalledWith(db, encounterData);
                    expect(observationDbService.insertObservationsData).toHaveBeenCalledWith(db, encounterData.patientUuid, encounterData.visitUuid, encounterData.observations);
                    expect(eventLogService.getDataForUrl.calls.count()).toBe(0);
                    expect(visitDbService.insertVisitData.calls.count()).toBe(0);
                    done();
                });
            });
        });
    });


    describe("patientDbService ", function () {
        it("should call getPatientByUuid with given uuid", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                offlineDbService.getPatientByUuid("patientUuid");
                expect(patientDbService.getPatientByUuid).toHaveBeenCalledWith(db, "patientUuid");
                done();
            });
        });

        it("should call getPatientByUuid with given uuid and then map the patient data for post request", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);

            patientDbService.getPatientByUuid.and.callFake(function () {
                var deferred1 = $q.defer();
                var patientData = {
                    patient: {
                        uuid: "patientUuid",
                        identifiers: [{
                            "location": null,
                            "resourceVersion": "1.8",
                            "voided": false,
                            "uuid": "ed2e9b46-dc64-4859-aa5d-dc6ebef2621a",
                            "preferred": true,
                            "identifierPrefix": "BDH",
                            "identifierSourceUuid": "sourceUuid",
                            "identifierType": {
                                "display": "Patient Identifier",
                                "uuid": "7676e94e-796e-11e5-a6d0-005056b07f03",
                                "identifierSources": [{"prefix": "BDH", "uuid": "sourceUuid"}]
                            },
                            "identifier": "BDH201934"
                        },
                            {
                                "location": null,
                                "resourceVersion": "1.8",
                                "voided": false,
                                "uuid": "dd2e9b46-dc64-4859-aa5d-dc6ebef2621a",
                                "preferred": true,
                                "selectedIdentifierSource": {"prefix": "SEC", "uuid": "sourceUuid2"},
                                "identifierType": {
                                    "display": "Patient Identifier",
                                    "uuid": "9999e94e-796e-11e5-a6d0-005056b07f03",
                                    "identifierSources": [{"prefix": "BDH", "uuid": "sourceUuid1"}, {
                                        "prefix": "SEC",
                                        "uuid": "sourceUuid2"
                                    }]
                                }
                            }
                        ]
                    }
                };
                deferred1.resolve(patientData);
                return deferred1.promise;
            });

            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                offlineDbService.getPatientByUuidForPost("patientUuid").then(function (mappedPatientDataForPostRequest) {
                    expect(mappedPatientDataForPostRequest.patient.identifiers[0].identifier).toBe("BDH201934");
                    expect(mappedPatientDataForPostRequest.patient.identifiers[0].identifierType).toBe("7676e94e-796e-11e5-a6d0-005056b07f03");
                    expect(mappedPatientDataForPostRequest.patient.identifiers[0].identifierPrefix).toBe("BDH");
                    expect(mappedPatientDataForPostRequest.patient.identifiers[0].identifierSourceUuid).toBe("sourceUuid");
                    expect(mappedPatientDataForPostRequest.patient.identifiers[1].identifier).toBeUndefined();
                    expect(mappedPatientDataForPostRequest.patient.identifiers[1].identifierType).toBe("9999e94e-796e-11e5-a6d0-005056b07f03");
                    expect(mappedPatientDataForPostRequest.patient.identifiers[1].identifierPrefix).toBe("SEC");
                    expect(mappedPatientDataForPostRequest.patient.identifiers[1].identifierSourceUuid).toBe("sourceUuid2");
                    expect(patientDbService.getPatientByUuid).toHaveBeenCalledWith(db, "patientUuid");
                    done();
                });
            });
        });

        it("should call createPatient with given patientData", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                var patientData = {
                    name: "patient",
                    patient: {
                        uuid: "personUuid",
                        person: {attributes: "attributes", addresses: ["addresses1", "addresses2"]}
                    }
                };

                patientIdentifierDbService.insertPatientIdentifiers.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve("patientUuid");
                    return deferred1.promise;
                });

                patientDbService.insertPatientData.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve("patientUuid");
                    return deferred1.promise;
                });

                patientDbService.getPatientByUuid.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve({patient: "patientInfo"});
                    return deferred1.promise;
                });

                offlineDbService.createPatient(patientData).then(function (patientInfoResponse) {
                    expect(patientInfoResponse).not.toBeUndefined();
                    expect(patientInfoResponse).toEqual({data: {patient: "patientInfo"}});
                    expect(patientAttributeDbService.insertAttributes).toHaveBeenCalledWith(db, "patientUuid", "attributes");
                    expect(patientAddressDbService.insertAddress).toHaveBeenCalledWith(db, "patientUuid", "addresses1");
                    done();
                });
            });
        });

        it("should call createPatient with given patientData, it should take preferredAddress if address is empty", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                var patientData = {
                    name: "patient",
                    patient: {
                        uuid: "personUuid",
                        person: {
                            attributes: "attributes",
                            addresses: [],
                            preferredAddress: ["preferredAddress1", "preferredAddress2"]
                        }
                    }
                };

                patientIdentifierDbService.insertPatientIdentifiers.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve("patientUuid");
                    return deferred1.promise;
                });

                patientDbService.insertPatientData.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve("patientUuid");
                    return deferred1.promise;
                });

                patientDbService.getPatientByUuid.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve({patient: "patientInfo"});
                    return deferred1.promise;
                });

                offlineDbService.createPatient(patientData).then(function (patientInfoResponse) {
                    expect(patientInfoResponse).not.toBeUndefined();
                    expect(patientInfoResponse).toEqual({data: {patient: "patientInfo"}});
                    expect(patientAttributeDbService.insertAttributes).toHaveBeenCalledWith(db, "patientUuid", "attributes");
                    expect(patientAddressDbService.insertAddress).toHaveBeenCalledWith(db, "patientUuid", patientData.patient.person.preferredAddress);
                    done();
                });
            });
        });

        it("should call createPatient with given patientData, it should take empty object if address and preferredAddress is empty", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                var patientData = {
                    name: "patient",
                    patient: {
                        uuid: "personUuid",
                        person: {attributes: "attributes", addresses: [], preferredAddress: undefined}
                    }
                };

                patientIdentifierDbService.insertPatientIdentifiers.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve("patientUuid");
                    return deferred1.promise;
                });

                patientDbService.insertPatientData.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve("patientUuid");
                    return deferred1.promise;
                });

                patientDbService.getPatientByUuid.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve({patient: "patientInfo"});
                    return deferred1.promise;
                });

                offlineDbService.createPatient(patientData).then(function (patientInfoResponse) {
                    expect(patientInfoResponse).not.toBeUndefined();
                    expect(patientInfoResponse).toEqual({data: {patient: "patientInfo"}});
                    expect(patientAttributeDbService.insertAttributes).toHaveBeenCalledWith(db, "patientUuid", "attributes");
                    expect(patientAddressDbService.insertAddress).toHaveBeenCalledWith(db, "patientUuid", {});
                    done();
                });
            });
        });

        it("should return error message if there is unique constraint violation while saving identifiers", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);

            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                var patientData = {
                    name: "patient",
                    patient: {
                        uuid: "personUuid",
                        person: {attributes: "attributes", addresses: [], preferredAddress: undefined},
                        identifiers: [{identifier: "01"}]
                    }
                };

                patientIdentifierDbService.insertPatientIdentifiers.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.reject({code: 201});
                    return deferred1.promise;
                });


                offlineDbService.createPatient(patientData).then(function () {},function(response) {
                    expect(response.code).toEqual(201);
                    expect(response.message).not.toBeNull();
                    expect(patientAttributeDbService.insertAttributes).not.toHaveBeenCalled();
                    expect(patientAddressDbService.insertAddress).not.toHaveBeenCalled();
                    done();
                });
            });
        });

        it("should not call insertPatientIdentifiers if patient is voided", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                var patientData = {
                    name: "patient",
                    patient: {
                        voided: true,
                        uuid: "personUuid",
                        person: {attributes: "attributes", addresses: [], preferredAddress: undefined}
                    }
                };

                patientIdentifierDbService.insertPatientIdentifiers.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve("patientUuid");
                    return deferred1.promise;
                });

                patientDbService.insertPatientData.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve("patientUuid");
                    return deferred1.promise;
                });

                patientDbService.getPatientByUuid.and.callFake(function () {
                    var deferred1 = $q.defer();
                    deferred1.resolve({patient: "patientInfo"});
                    return deferred1.promise;
                });

                offlineDbService.createPatient(patientData).then(function (patientInfoResponse) {
                    expect(patientInfoResponse).not.toBeUndefined();
                    expect(patientInfoResponse).toEqual({data: {patient: "patientInfo"}});
                    expect(patientAttributeDbService.insertAttributes).not.toHaveBeenCalled();
                    expect(patientAddressDbService.insertAddress).not.toHaveBeenCalled();
                    expect(patientIdentifierDbService.insertPatientIdentifiers).not.toHaveBeenCalled();
                    done();
                });
            });
        });
    });


    describe("errorLogDbService ", function () {
        beforeEach( function(){

            errorLogDbService.insertLog.and.callFake(function () {
                var deferred1 = $q.defer();
                deferred1.resolve("errorUuid");
                return deferred1.promise;
            });
        });

        it("should call insertLog with providers, if providers available", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                var requestPayload = {providers: [{display: 'armanvuiyan', uuid: 'providerUuid'}]};
                offlineDbService.insertLog('someUuid','failedRequestUrl', 500, 'stackTrace', requestPayload);
                expect(errorLogDbService.insertLog.calls.count()).toBe(1);
                expect(errorLogDbService.insertLog).toHaveBeenCalledWith(db,'someUuid', 'failedRequestUrl', 500, 'stackTrace', requestPayload, requestPayload.providers[0]);
                done();
            });
        });

        it("should call insertLog with creator, if auditInfo.creator available", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                var auditInfo = {creator: {display: 'armanvuiyan', uuid: 'providerUuid'}};
                var requestPayload = {patient: "patientPostData", auditInfo: auditInfo};
                offlineDbService.insertLog('someUuid', 'failedRequestUrl', 500, 'stackTrace', requestPayload);
                expect(errorLogDbService.insertLog.calls.count()).toBe(1);
                expect(errorLogDbService.insertLog).toHaveBeenCalledWith(db, 'someUuid', 'failedRequestUrl', 500, 'stackTrace', requestPayload, auditInfo.creator);
                done()
            });
        });

        it("should call insertLog with empty string for provider, if either of auditInfo.creator, providers is not available", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                var requestPayload = {patient: "patientPostData"};
                offlineDbService.insertLog('someUuid','failedRequestUrl', 500, 'stackTrace', requestPayload);
                expect(errorLogDbService.insertLog.calls.count()).toBe(1);
                expect(errorLogDbService.insertLog).toHaveBeenCalledWith(db, 'someUuid', 'failedRequestUrl', 500, 'stackTrace', requestPayload, "");
                done()
            });
        });

        it("should call insertLog with empty string for requestPayload, if requestPayload is not available", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                offlineDbService.insertLog('someUuid', 'failedRequestUrl', 500, 'stackTrace');
                expect(errorLogDbService.insertLog.calls.count()).toBe(1);
                expect(errorLogDbService.insertLog).toHaveBeenCalledWith(db, 'someUuid', 'failedRequestUrl', 500, 'stackTrace', "", "");
                done()
            });
        });

        it("should call getErrorLogByUuid with given db and uuid and give the log accordingly", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                var providers = [{display: 'armanvuiyan', uuid: 'providerUuid'}];
                var requestPayload = {patient: "patientPostData", providers: providers};
                offlineDbService.insertLog('someUuid', 'failedRequestUrl', 500, 'stackTrace', requestPayload);
                expect(errorLogDbService.insertLog).toHaveBeenCalledWith(db, 'someUuid', 'failedRequestUrl', 500, 'stackTrace', requestPayload, providers[0]);
                offlineDbService.getErrorLogByUuid("someUuid");
                expect(errorLogDbService.getErrorLogByUuid.calls.count()).toBe(1);
                expect(errorLogDbService.getErrorLogByUuid).toHaveBeenCalledWith(db, "someUuid");
                done();
            });
        });

        it("should call deleteErrorFromErrorLog with given db and uuid to delete log from errorLog table", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                var providers = [{display: 'armanvuiyan', uuid: 'providerUuid'}];
                var requestPayload = {patient: "patientPostData", providers: providers};
                offlineDbService.insertLog('someUuid', 'failedRequestUrl', 500, 'stackTrace', requestPayload);
                expect(errorLogDbService.insertLog).toHaveBeenCalledWith(db, 'someUuid', 'failedRequestUrl', 500, 'stackTrace', requestPayload, providers[0]);
                offlineDbService.deleteErrorFromErrorLog("someUuid");
                expect(errorLogDbService.deleteByUuid.calls.count()).toBe(1);
                expect(errorLogDbService.deleteByUuid).toHaveBeenCalledWith(db, "someUuid");
                done();
            });
        });

    });


    describe("conceptDbService", function () {
        it("should call getConcept with given conceptUuid", function (done) {
            var schemaBuilder = lf.schema.create(Bahmni.Common.Constants.bahmniConnectMetaDataDb, 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                offlineDbService.getConcept("conceptUuid");
                expect(conceptDbService.getReferenceData.calls.count()).toBe(1);
                expect(conceptDbService.getReferenceData).toHaveBeenCalledWith("conceptUuid");
                db.close();
                done();
            });
        });

        it("should call getConceptByName with given conceptName", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                offlineDbService.getConceptByName("paracetamol");
                expect(conceptDbService.getConceptByName.calls.count()).toBe(1);
                expect(conceptDbService.getConceptByName).toHaveBeenCalledWith("paracetamol");
                db.close();
                done();
            });
        });

        it("should call insertConceptAndUpdateHierarchy with given concept data and parentConcept", function (done) {
            var schemaBuilder = lf.schema.create(Bahmni.Common.Constants.bahmniConnectMetaDataDb, 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                offlineDbService.insertConceptAndUpdateHierarchy("data", "parent");
                expect(conceptDbService.insertConceptAndUpdateHierarchy.calls.count()).toBe(1);
                expect(conceptDbService.insertConceptAndUpdateHierarchy).toHaveBeenCalledWith("data", "parent");
                db.close();
                done();
            });
        });

        it("should call updateChildren with given concept", function (done) {
            var schemaBuilder = lf.schema.create(Bahmni.Common.Constants.bahmniConnectMetaDataDb, 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                offlineDbService.updateChildren("concept");
                expect(conceptDbService.updateChildren.calls.count()).toBe(1);
                expect(conceptDbService.updateChildren).toHaveBeenCalledWith("concept");
                db.close();
                done();
            });
        });

        it("should call updateParentJson with given childConcept", function (done) {
            var schemaBuilder = lf.schema.create(Bahmni.Common.Constants.bahmniConnectMetaDataDb, 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                offlineDbService.updateParentJson("childConcept");
                expect(conceptDbService.updateParentJson.calls.count()).toBe(1);
                expect(conceptDbService.updateParentJson).toHaveBeenCalledWith("childConcept");
                db.close();
                done();
            });
        });

        it("should call getAllParentsInHierarchy with given concept name and empty array", function (done) {
            var schemaBuilder = lf.schema.create(Bahmni.Common.Constants.bahmniConnectMetaDataDb, 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                offlineDbService.getAllParentsInHierarchy("conceptName");
                expect(conceptDbService.getAllParentsInHierarchy.calls.count()).toBe(1);
                expect(conceptDbService.getAllParentsInHierarchy).toHaveBeenCalledWith("conceptName", []);
                db.close();
                done();
            });
        });
    });


    describe("visitDbService", function () {
        it("should call insertVisitData with given visitData", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                offlineDbService.insertVisitData("visitData");
                expect(visitDbService.insertVisitData.calls.count()).toBe(1);
                expect(visitDbService.insertVisitData).toHaveBeenCalledWith(db, "visitData");
                done();
            });
        });

        it("should insert visit data during sync(push) in the db in which the encounter event is created", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);
                offlineDbService.insertVisitData("visitData", {"db": 'otherDb'});
                expect(visitDbService.insertVisitData.calls.count()).toBe(1);
                expect(visitDbService.insertVisitData).toHaveBeenCalledWith({"db": 'otherDb'}, "visitData");
                done();
            });
        });

        it("should call getVisitByUuid with given visitUuid", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                offlineDbService.getVisitByUuid("visitUuid");
                expect(visitDbService.getVisitByUuid.calls.count()).toBe(1);
                expect(visitDbService.getVisitByUuid).toHaveBeenCalledWith(db, "visitUuid");
                done();
            });
        });

        it("should call getVisitsByPatientUuid with given patientUuid and numberOfVisits", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                var numberOfVisits = 4;
                offlineDbService.getVisitsByPatientUuid("patientUuid", numberOfVisits);
                expect(visitDbService.getVisitsByPatientUuid.calls.count()).toBe(1);
                expect(visitDbService.getVisitsByPatientUuid).toHaveBeenCalledWith(db, "patientUuid", numberOfVisits);
                done();
            });
        });

        it("should call getVisitDetailsByPatientUuid with given patientUuid", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);
                offlineDbService.getVisitDetailsByPatientUuid("patientUuid");

                expect(visitDbService.getVisitDetailsByPatientUuid.calls.count()).toBe(1);
                expect(visitDbService.getVisitDetailsByPatientUuid).toHaveBeenCalledWith(db, "patientUuid");
                done();
            });
        });
    });


    describe("locationDbService", function () {
        it("should call getLocationByUuid with given locationUuid", function (done) {
            var schemaBuilder = lf.schema.create(Bahmni.Common.Constants.bahmniConnectMetaDataDb, 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                offlineDbService.getLocationByUuid("locationUuid");
                expect(locationDbService.getLocationByUuid.calls.count()).toBe(1);
                expect(locationDbService.getLocationByUuid).toHaveBeenCalledWith(db, "locationUuid");
                db.close();
                done();
            });
        });
    });


    describe("referenceDataDbService", function () {
        it("should call getReferenceData with given referenceDataKey", function () {
            offlineDbService.getReferenceData("referenceDataKey");
            expect(referenceDataDbService.getReferenceData.calls.count()).toBe(1);
            expect(referenceDataDbService.getReferenceData).toHaveBeenCalledWith("referenceDataKey");
        });

        it("should call insertReferenceData with given parameters", function () {
            offlineDbService.insertReferenceData("referenceDataKey", "data", "eTag");
            expect(referenceDataDbService.insertReferenceData.calls.count()).toBe(1);
            expect(referenceDataDbService.insertReferenceData).toHaveBeenCalledWith("referenceDataKey", "data", "eTag");

        });
    });


    describe("offlineConfigDbService", function () {
        it("should call insertConfig with given parameters", function () {
            offlineDbService.insertConfig("module", "data", "eTag");
            expect(offlineConfigDbService.insertConfig.calls.count()).toBe(1);
            expect(offlineConfigDbService.insertConfig).toHaveBeenCalledWith("module", "data", "eTag");
        });

        it("should call getConfig with given module", function () {
            offlineDbService.getConfig("module");
            expect(offlineConfigDbService.getConfig.calls.count()).toBe(1);
            expect(offlineConfigDbService.getConfig).toHaveBeenCalledWith("module");
        });
    });


    describe("offlineAddressHierarchyDbService", function () {
        it("should call insertAddressHierarchy with given data", function () {
            offlineDbService.insertAddressHierarchy("data");
            expect(offlineAddressHierarchyDbService.insertAddressHierarchy.calls.count()).toBe(1);
            expect(offlineAddressHierarchyDbService.insertAddressHierarchy).toHaveBeenCalledWith("data");
        });

        it("should call searchAddress with given paramas", function () {
            offlineDbService.searchAddress("paramas");
            expect(offlineAddressHierarchyDbService.search.calls.count()).toBe(1);
            expect(offlineAddressHierarchyDbService.search).toHaveBeenCalledWith("paramas");
        });
    });


    describe("offlineMarkerDbService", function () {
        it("should call getMarker with location specific db when markerName is not offline-concepts", function (done) {
            var metaDataSchemaBuilder = lf.schema.create(Bahmni.Common.Constants.bahmniConnectMetaDataDb, 1);
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            var locationDb;
            schemaBuilder.connect().then(function (db) {
                locationDb = db;
                offlineDbService.init(db);
                metaDataSchemaBuilder.connect().then(function (metaDataDb) {
                    offlineDbService.init(metaDataDb);
                    offlineDbService.getMarker("markerName");
                    expect(offlineMarkerDbService.getMarker.calls.count()).toBe(1);
                    expect(offlineMarkerDbService.getMarker).toHaveBeenCalledWith(locationDb,"markerName");
                    metaDataDb.close();
                    locationDb.close();
                    done();
                });
            });
        });

        it("should call getMarker with metadata db when markerName is offline-concepts ", function (done) {
            var metaDataSchemaBuilder = lf.schema.create(Bahmni.Common.Constants.bahmniConnectMetaDataDb, 1);
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);
                metaDataSchemaBuilder.connect().then(function (metaDataDb) {
                    offlineDbService.init(metaDataDb);
                    offlineDbService.getMarker("offline-concepts");
                    expect(offlineMarkerDbService.getMarker.calls.count()).toBe(1);
                    expect(offlineMarkerDbService.getMarker).toHaveBeenCalledWith(metaDataDb,"offline-concepts");
                    metaDataDb.close();
                    done();
                });
            });
        });

        it("should call insertMarker with location specific db when markerName is not offline-concepts", function (done) {
            var metaDataSchemaBuilder = lf.schema.create(Bahmni.Common.Constants.bahmniConnectMetaDataDb, 1);
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            var filters = [202020,20202001];
            var locationDb;
            schemaBuilder.connect().then(function (db) {
                locationDb = db;
                offlineDbService.init(db);
                metaDataSchemaBuilder.connect().then(function (metaDataDb) {
                    offlineDbService.init(metaDataDb);
                    offlineDbService.insertMarker("markerName", "eventUuid", filters);
                    expect(offlineMarkerDbService.insertMarker.calls.count()).toBe(1);
                    expect(offlineMarkerDbService.insertMarker).toHaveBeenCalledWith(locationDb,"markerName", "eventUuid", filters);
                    metaDataDb.close();
                    done();
                });
            });

        });

        it("should call insertMarker with metadata db when markerName is offline-concepts", function (done) {
            var filters = [];
            var metaDataSchemaBuilder = lf.schema.create(Bahmni.Common.Constants.bahmniConnectMetaDataDb, 1);
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);
                metaDataSchemaBuilder.connect().then(function (metaDataDb) {
                    offlineDbService.init(metaDataDb);
                    offlineDbService.insertMarker("offline-concepts", "eventUuid", filters);
                    expect(offlineMarkerDbService.insertMarker.calls.count()).toBe(1);
                    expect(offlineMarkerDbService.insertMarker).toHaveBeenCalledWith(metaDataDb, "offline-concepts", "eventUuid", filters);
                    metaDataDb.close();
                    done();
                });
            });
        });
    });


    describe("initializeOfflineSchema", function () {
        it("should call initSchema", function () {
            offlineDbService.initSchema();
            expect(initializeOfflineSchema.initSchema.calls.count()).toBe(1);
            expect(initializeOfflineSchema.initSchema).toHaveBeenCalled();
        });

        it("should call reinitSchema", function () {
            offlineDbService.reinitSchema();
            expect(initializeOfflineSchema.reinitSchema.calls.count()).toBe(1);
            expect(initializeOfflineSchema.reinitSchema).toHaveBeenCalled();
        });
    });


    describe("encounterDbService", function () {
        it("should call getEncounterByEncounterUuid with given encounterUuid", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                offlineDbService.getEncounterByEncounterUuid("encounterUuid");
                expect(encounterDbService.getEncounterByEncounterUuid.calls.count()).toBe(1);
                expect(encounterDbService.getEncounterByEncounterUuid).toHaveBeenCalledWith(db, "encounterUuid");
                done();
            });
        });

        it("should call getEncountersByVisits with given params", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                offlineDbService.getPrescribedAndActiveDrugOrders("params");
                expect(encounterDbService.getEncountersByVisits.calls.count()).toBe(1);
                expect(encounterDbService.getEncountersByVisits).toHaveBeenCalledWith(db, "params");
                done();
            });
        });

        it("should call getEncountersByPatientUuid with given patientUuid", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                offlineDbService.getEncountersByPatientUuid("patientUuid");
                expect(encounterDbService.getEncountersByPatientUuid.calls.count()).toBe(1);
                expect(encounterDbService.getEncountersByPatientUuid).toHaveBeenCalledWith(db, "patientUuid");
                done();
            });
        });
    });


    describe("observationDbService", function () {
        it("should call getObservationsFor with given params", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                offlineDbService.getObservationsFor("params");
                expect(observationDbService.getObservationsFor.calls.count()).toBe(1);
                expect(observationDbService.getObservationsFor).toHaveBeenCalledWith(db, "params");
                done();
            });
        });
    });


    describe("patientAttributeDbService", function () {
        it("should call getAttributeTypes with db reference", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                offlineDbService.getAttributeTypes();
                expect(patientAttributeDbService.getAttributeTypes.calls.count()).toBe(1);
                expect(patientAttributeDbService.getAttributeTypes).toHaveBeenCalledWith(db);
                done();
            });
        });
    });



    describe("labOrderResultsDbService", function () {
        it("should call getLabOrderResultsForPatient with db reference", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                offlineDbService.getLabOrderResultsForPatient("patientUuid");
                expect(labOrderResultsDbService.getLabOrderResultsForPatient.calls.count()).toBe(1);
                expect(labOrderResultsDbService.getLabOrderResultsForPatient).toHaveBeenCalledWith(db, "patientUuid");
                done();
            });
        });
    });


    describe("labOrderResultsDbService", function () {
        it("should call insertLabOrderResults with db reference", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                offlineDbService.insertLabOrderResults("patientUuid", {results: []});
                expect(labOrderResultsDbService.insertLabOrderResults.calls.count()).toBe(1);
                expect(labOrderResultsDbService.insertLabOrderResults).toHaveBeenCalledWith(db, "patientUuid", {results: []});
                done();
            });
        });
    });


    describe("labOrderResultsDbService", function () {
        it("should call getLabOrderResultsForPatient with db reference", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                offlineDbService.getLabOrderResultsForPatient("patientUuid");
                expect(labOrderResultsDbService.getLabOrderResultsForPatient.calls.count()).toBe(1);
                expect(labOrderResultsDbService.getLabOrderResultsForPatient).toHaveBeenCalledWith(db, "patientUuid");
                done();
            });
        });
    });


    describe("labOrderResultsDbService", function () {
        it("should call insertLabOrderResults with db reference", function (done) {
            var schemaBuilder = lf.schema.create('BahmniOfflineDb', 1);
            schemaBuilder.connect().then(function (db) {
                offlineDbService.init(db);

                offlineDbService.insertLabOrderResults("patientUuid", {results: []});
                expect(labOrderResultsDbService.insertLabOrderResults.calls.count()).toBe(1);
                expect(labOrderResultsDbService.insertLabOrderResults).toHaveBeenCalledWith(db, "patientUuid", {results: []});
                done();
            });
        });
    });
});
