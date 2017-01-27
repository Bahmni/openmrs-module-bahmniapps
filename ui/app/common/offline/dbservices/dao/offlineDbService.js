'use strict';

angular.module('bahmni.common.offline')
    .service('offlineDbService', ['offlineService', '$http', '$q', 'patientDbService', 'patientAddressDbService', 'patientAttributeDbService', 'patientIdentifierDbService', 'offlineMarkerDbService', 'offlineAddressHierarchyDbService', 'labOrderResultsDbService',
        'offlineConfigDbService', 'initializeOfflineSchema', 'referenceDataDbService', 'locationDbService', 'offlineSearchDbService', 'encounterDbService', 'visitDbService', 'observationDbService', 'conceptDbService', 'errorLogDbService', 'eventLogService',
        function (offlineService, $http, $q, patientDbService, patientAddressDbService, patientAttributeDbService, patientIdentifierDbService, offlineMarkerDbService, offlineAddressHierarchyDbService, labOrderResultsDbService,
                  offlineConfigDbService, initializeOfflineSchema, referenceDataDbService, locationDbService, offlineSearchDbService, encounterDbService, visitDbService, observationDbService, conceptDbService, errorLogDbService, eventLogService) {
            var db, metaDataDb;

            var createPatient = function (postRequest) {
                var deferred = $q.defer();
                var uuid = postRequest.patient.uuid;
                insertPatientData(postRequest)
                    .then(function () {
                        getPatientByUuid(uuid).then(function (result) {
                            deferred.resolve({data: result});
                        });
                    }, function (response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            };

            var getPatientByUuid = function (uuid, preferredDb) {
                preferredDb = preferredDb ? preferredDb : db;
                return patientDbService.getPatientByUuid(preferredDb, uuid);
            };

            var deletePatientData = function (uuid) {
                var deferred = $q.defer();
                var queries = [];

                var patientTable = db.getSchema().table('patient');
                var patientAddress = db.getSchema().table('patient_address');
                var patientAttributes = db.getSchema().table('patient_attribute');
                var patientIdentifier = db.getSchema().table('patient_identifier');

                queries.push(db.delete().from(patientAttributes).where(patientAttributes.patientUuid.eq(uuid)));
                queries.push(db.delete().from(patientAddress).where(patientAddress.patientUuid.eq(uuid)));
                queries.push(db.delete().from(patientTable).where(patientTable.uuid.eq(uuid)));
                queries.push(db.delete().from(patientIdentifier).where(patientIdentifier.patientUuid.eq(uuid)));

                var tx = db.createTransaction();
                tx.exec(queries);
                deferred.resolve({});
                return deferred.promise;
            };

            var insertPatientData = function (patientData) {
                var patient = patientData.patient;
                var person = patient.person;
                if (!patient.voided) {
                    return patientIdentifierDbService.insertPatientIdentifiers(db, person.uuid, patient.identifiers).then(function () {
                        return patientDbService.insertPatientData(db, patientData).then(function (patientUuid) {
                            patientAttributeDbService.insertAttributes(db, patientUuid, person.attributes);
                            patientAddressDbService.insertAddress(db, patientUuid, getAddress(person));
                            return patientData;
                        });
                    }, function (response) {
                        if (response && response.code == 201) {
                            response.message = "Patient failed to validate with reason: Identifier " + patient.identifiers[0].identifier + " is already in use by another patient";
                            response.isOfflineApp = true;
                        }
                        return $q.reject(response);
                    });
                }
                return $q.when(patientData);
            };

            var getAddress = function (person) {
                return person.addresses[0] || person.preferredAddress || {};
            };

            var insertLabOrderResults = function (patientUuid, labOrderResults) {
                return labOrderResultsDbService.insertLabOrderResults(db, patientUuid, labOrderResults);
            };

            var getLabOrderResultsForPatient = function (params) {
                return labOrderResultsDbService.getLabOrderResultsForPatient(db, params);
            };

            var createEncounter = function (encounterData, preferredDb) {
                var deferred = $q.defer();
                insertEncounterData(encounterData, preferredDb).then(function () {
                    if (encounterData.visitUuid) {
                        eventLogService.getDataForUrl(Bahmni.Common.Constants.visitUrl + "/" + encounterData.visitUuid).then(function (response) {
                            insertVisitData(response.data, preferredDb).then(function () {
                                deferred.resolve({data: encounterData});
                            });
                        }, function () {
                            deferred.resolve({data: encounterData});
                        });
                    } else {
                        deferred.resolve({data: encounterData});
                    }
                });
                return deferred.promise;
            };

            var insertEncounterData = function (encounterData, preferredDb) {
                preferredDb = preferredDb ? preferredDb : db;
                return encounterDbService.insertEncounterData(preferredDb, encounterData).then(function () {
                    if (encounterData && encounterData.observations && encounterData.observations.length > 0) {
                        return observationDbService.insertObservationsData(preferredDb, encounterData.patientUuid, encounterData.visitUuid, encounterData.observations).then(function () {
                            return encounterData;
                        });
                    }
                    return encounterData;
                });
            };

            var getEncountersByPatientUuid = function (patientUuid) {
                return encounterDbService.getEncountersByPatientUuid(db, patientUuid);
            };

            var getActiveEncounter = function (params) {
                var deferred = $q.defer();
                getReferenceData("encounterSessionDuration").then(function (encounterSessionDurationData) {
                    var encounterSessionDuration = encounterSessionDurationData.data;
                    getReferenceData("DefaultEncounterType").then(function (defaultEncounterType) {
                        var encounterType = defaultEncounterType ? defaultEncounterType.data : null;
                        encounterDbService.findActiveEncounter(db, {
                            patientUuid: params.patientUuid,
                            providerUuid: params.providerUuids[0],
                            encounterType: encounterType
                        }, encounterSessionDuration).then(function (encounter) {
                            deferred.resolve(encounter);
                        });
                    });
                });
                return deferred.promise;
            };

            var init = function (offlineDb) {
                if (offlineDb.getSchema().name() == Bahmni.Common.Constants.bahmniConnectMetaDataDb) {
                    metaDataDb = offlineDb;
                    offlineConfigDbService.init(metaDataDb);
                    conceptDbService.init(metaDataDb);
                    referenceDataDbService.init(metaDataDb);
                } else {
                    db = offlineDb;
                    offlineAddressHierarchyDbService.init(offlineDb);
                    offlineSearchDbService.init(offlineDb);
                }
                if (metaDataDb && db) {
                    referenceDataDbService.init(metaDataDb, db);
                }
            };

            var initSchema = function (dbName) {
                return initializeOfflineSchema.initSchema(dbName);
            };

            var reinitSchema = function (dbName) {
                return initializeOfflineSchema.reinitSchema(dbName);
            };

            var getMarker = function (markerName) {
                var database = markerName == "offline-concepts" ? metaDataDb : db;
                return offlineMarkerDbService.getMarker(database, markerName);
            };

            var insertMarker = function (markerName, eventUuid, filters) {
                var database = markerName == "offline-concepts" ? metaDataDb : db;
                return offlineMarkerDbService.insertMarker(database, markerName, eventUuid, filters);
            };

            var insertAddressHierarchy = function (data) {
                return offlineAddressHierarchyDbService.insertAddressHierarchy(data);
            };

            var searchAddress = function (params) {
                return offlineAddressHierarchyDbService.search(params);
            };

            var getConfig = function (module) {
                return offlineConfigDbService.getConfig(module);
            };

            var insertConfig = function (module, data, eTag) {
                return offlineConfigDbService.insertConfig(module, data, eTag);
            };

            var getReferenceData = function (referenceDataKey) {
                return referenceDataDbService.getReferenceData(referenceDataKey);
            };

            var insertReferenceData = function (key, data, eTag) {
                return referenceDataDbService.insertReferenceData(key, data, eTag);
            };

            var getLocationByUuid = function (uuid) {
                return locationDbService.getLocationByUuid(metaDataDb, uuid);
            };

            var getAttributeTypes = function () {
                return patientAttributeDbService.getAttributeTypes(db);
            };

            var getConcept = function (conceptUuid) {
                return conceptDbService.getReferenceData(conceptUuid);
            };

            var getConceptByName = function (conceptName) {
                return conceptDbService.getConceptByName(conceptName);
            };

            var insertConceptAndUpdateHierarchy = function (data, parent) {
                return conceptDbService.insertConceptAndUpdateHierarchy(data, parent);
            };

            var updateChildren = function (concept) {
                return conceptDbService.updateChildren(concept);
            };

            var updateParentJson = function (child) {
                return conceptDbService.updateParentJson(child);
            };

            var insertVisitData = function (visitData, preferredDb) {
                preferredDb = preferredDb ? preferredDb : db;
                return visitDbService.insertVisitData(preferredDb, visitData);
            };

            var getVisitByUuid = function (visitUuid) {
                return visitDbService.getVisitByUuid(db, visitUuid);
            };

            var getEncounterByEncounterUuid = function (encounterUuid, preferredDb) {
                preferredDb = preferredDb ? preferredDb : db;
                return encounterDbService.getEncounterByEncounterUuid(preferredDb, encounterUuid);
            };

            var getObservationsFor = function (params) {
                return observationDbService.getObservationsFor(db, params);
            };

            var getObservationsForVisit = function (visitUuid) {
                return observationDbService.getObservationsForVisit(db, visitUuid);
            };

            var getVisitsByPatientUuid = function (patientUuid, numberOfVisits) {
                return visitDbService.getVisitsByPatientUuid(db, patientUuid, numberOfVisits);
            };

            var getVisitDetailsByPatientUuid = function (patientUuid) {
                return visitDbService.getVisitDetailsByPatientUuid(db, patientUuid);
            };

            var insertLog = function (errorUuid, failedRequest, responseStatus, stackTrace, requestPayload) {
                var provider = _.has(requestPayload, 'providers') ? requestPayload.providers[0] :
                (_.has(requestPayload, 'auditInfo.creator') ? requestPayload.auditInfo.creator : "");
                requestPayload = requestPayload ? requestPayload : "";
                return errorLogDbService.insertLog(db, errorUuid, failedRequest, responseStatus, stackTrace, requestPayload, provider);
            };

            var getErrorLogByUuid = function (uuid, preferredDb) {
                preferredDb = preferredDb ? preferredDb : db;
                return errorLogDbService.getErrorLogByUuid(preferredDb, uuid);
            };

            var deleteErrorFromErrorLog = function (uuid) {
                return errorLogDbService.deleteByUuid(db, uuid);
            };

            var getAllLogs = function () {
                var deferred = $q.defer();
                errorLogDbService.getLog(db).then(function (response) {
                    deferred.resolve(response);
                });
                return deferred.promise;
            };

            var getAllParentsInHierarchy = function (conceptName) {
                var conceptNamesInHierarchy = [];
                return conceptDbService.getAllParentsInHierarchy(conceptName, conceptNamesInHierarchy);
            };

            var getPrescribedAndActiveDrugOrders = function (params) {
                return encounterDbService.getEncountersByVisits(db, params);
            };

            var getPatientByUuidForPost = function (uuid, preferredDb) {
                var deferred = $q.defer();
                getPatientByUuid(uuid, preferredDb).then(function (patientData) {
                    var patient = patientData.patient;
                    patient.identifiers = _.map(patient.identifiers, function (identifier) {
                        return {
                            identifier: identifier.identifier,
                            identifierPrefix: identifier.identifierPrefix || identifier.selectedIdentifierSource && identifier.selectedIdentifierSource.prefix,
                            identifierSourceUuid: identifier.identifierSourceUuid || identifier.selectedIdentifierSource && identifier.selectedIdentifierSource.uuid,
                            identifierType: identifier.identifierType && identifier.identifierType.uuid || identifier.identifierType,
                            uuid: identifier.uuid,
                            preferred: identifier.preferred,
                            voided: identifier.voided
                        };
                    });
                    deferred.resolve(patientData);
                });
                return deferred.promise;
            };
            var getDbNames = function () {
                return offlineService.getItem("dbNames");
            };
            var getCurrentDbName = function () {
                return offlineService.getItem("currentDbName");
            };

            return {
                init: init,
                initSchema: initSchema,
                reinitSchema: reinitSchema,
                getPatientByUuid: getPatientByUuid,
                createPatient: createPatient,
                deletePatientData: deletePatientData,
                getMarker: getMarker,
                insertMarker: insertMarker,
                insertAddressHierarchy: insertAddressHierarchy,
                insertLabOrderResults: insertLabOrderResults,
                searchAddress: searchAddress,
                getConfig: getConfig,
                insertConfig: insertConfig,
                getReferenceData: getReferenceData,
                insertReferenceData: insertReferenceData,
                getLocationByUuid: getLocationByUuid,
                getAttributeTypes: getAttributeTypes,
                insertEncounterData: insertEncounterData,
                getEncountersByPatientUuid: getEncountersByPatientUuid,
                createEncounter: createEncounter,
                insertVisitData: insertVisitData,
                getVisitByUuid: getVisitByUuid,
                getActiveEncounter: getActiveEncounter,
                getEncounterByEncounterUuid: getEncounterByEncounterUuid,
                getObservationsFor: getObservationsFor,
                getVisitsByPatientUuid: getVisitsByPatientUuid,
                insertConceptAndUpdateHierarchy: insertConceptAndUpdateHierarchy,
                getConcept: getConcept,
                getConceptByName: getConceptByName,
                updateChildren: updateChildren,
                updateParentJson: updateParentJson,
                getAllParentsInHierarchy: getAllParentsInHierarchy,
                insertLog: insertLog,
                getAllLogs: getAllLogs,
                getErrorLogByUuid: getErrorLogByUuid,
                getPrescribedAndActiveDrugOrders: getPrescribedAndActiveDrugOrders,
                deleteErrorFromErrorLog: deleteErrorFromErrorLog,
                getPatientByUuidForPost: getPatientByUuidForPost,
                getVisitDetailsByPatientUuid: getVisitDetailsByPatientUuid,
                getObservationsForVisit: getObservationsForVisit,
                getLabOrderResultsForPatient: getLabOrderResultsForPatient,
                getDbNames: getDbNames,
                getCurrentDbName: getCurrentDbName
            };
        }]);
