'use strict';

angular.module('bahmni.common.offline')
    .factory('offlinePush', ['offlineService', 'eventQueue', '$http', 'offlineDbService', 'androidDbService', '$q', 'loggingService', '$bahmniCookieStore', 'dbNameService',
        function (offlineService, eventQueue, $http, offlineDbService, androidDbService, $q, loggingService, $bahmniCookieStore, dbNameService) {
            return function () {
                var releaseReservedEvents = function (reservedEvents) {
                    angular.forEach(reservedEvents, function (reservedEvent) {
                        eventQueue.releaseFromQueue(reservedEvent);
                    });
                };

                var getAllDbPromises = function () {
                    var dbPromises = [];
                    var dbNames = offlineDbService.getDbNames();
                    _.each(dbNames, function (dbName) {
                        dbPromises.push(offlineDbService.initSchema(dbName));
                    });
                    return dbPromises;
                };

                var consumeFromEventQueue = function () {
                    return eventQueue.consumeFromEventQueue().then(function (event) {
                        if (!event) {
                            deferred.resolve();
                            return;
                        }
                        else {
                            return processEvent(event, dbs[event.data.dbName]);
                        }
                    });
                };

                var consumeFromErrorQueue = function () {
                    return eventQueue.consumeFromErrorQueue().then(function (event) {
                        if (!event) {
                            return;
                        }
                        else {
                            return processEvent(event, dbs[event.data.dbName]);
                        }
                    });
                };

                var postData = function (event, response) {
                    if (response == undefined) {
                        eventQueue.releaseFromQueue(event);
                        return consumeFromEventQueue();
                    }
                    var config = {
                        withCredentials: true,
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        }
                    };

                    if (event.data.type && event.data.type == "encounter") {
                        return $http.post(Bahmni.Common.Constants.bahmniEncounterUrl, response.encounter, config);
                    } else if (event.data.type && event.data.type === "Error") {
                        return $http.post(Bahmni.Common.Constants.loggingUrl, angular.toJson(response));
                    } else {
                        response.relationships = [];
                        return $http.post(event.data.url, response, config);
                    }
                };

                var getEventData = function (event, db) {
                    if (event.data.type && event.data.type == "encounter") {
                        return offlineDbService.getEncounterByEncounterUuid(event.data.encounterUuid, db);
                    } else if (event.data.type && event.data.type === "Error") {
                        return offlineDbService.getErrorLogByUuid(event.data.uuid, db);
                    } else {
                        return offlineDbService.getPatientByUuidForPost(event.data.patientUuid, db).then(function (response) {
                            if (event.data.url.indexOf(event.data.patientUuid) == -1) {
                                if (response && response.patient && response.patient.person) {
                                    delete response.patient.person.preferredName;
                                    delete response.patient.person.preferredAddress;
                                }
                            }
                            // mapIdentifiersToPostFormat(response.patient);
                            return response;
                        });
                    }
                };

                var mapIdentifiersToPostFormat = function (patient) {
                    patient.identifiers = _.map(patient.identifiers, function (identifier) {
                        return {
                            identifier: identifier.identifier,
                            identifierPrefix: identifier.identifierPrefix,
                            identifierSourceUuid: identifier.identifierSourceUuid,
                            identifierType: identifier.identifierType && identifier.identifierType.uuid || identifier.identifierType,
                            uuid: identifier.uuid,
                            preferred: identifier.preferred,
                            voided: identifier.voided
                        };
                    });
                };

                var processEvent = function (event, db) {
                    return getEventData(event, db)
                        .then(function (response) {
                            return postData(event, response)
                                .success(function (data) {
                                    if (event.data.type && event.data.type == "encounter") {
                                        return offlineDbService.createEncounter(data, db).then(function () {
                                            return successCallBack(event);
                                        });
                                    }
                                    return successCallBack(event);
                                }).catch(function (response) {
                                    if (event.data.type !== "Error" && (parseInt(response.status / 100) === 5 || parseInt(response.status / 100) === 4)) {
                                        loggingService.logSyncError(response.config.url, response.status, response.data, response.config.data);
                                    }
                                    if (parseInt(response.status / 100) === 5 ||
                                        (parseInt(response.status / 100) === 4 && _.indexOf([401, 403, 404], response.status) == -1)) {
                                        if (event.tube === "event_queue") {
                                            eventQueue.removeFromQueue(event);
                                            eventQueue.addToErrorQueue(event.data);
                                            return consumeFromEventQueue();
                                        } else {
                                            reservedEvents.push(event);
                                            return consumeFromErrorQueue();
                                        }
                                    } else {
                                        eventQueue.releaseFromQueue(event);
                                        deferred.resolve();
                                        return "4xx error " + response.status;
                                    }
                                });
                        });
                };

                var successCallBack = function (event) {
                    if (event.data.type === "Error") {
                        offlineDbService.deleteErrorFromErrorLog(event.data.uuid);
                    }
                    eventQueue.removeFromQueue(event).then(function () {
                        if (event.tube === "event_queue") {
                            return consumeFromEventQueue();
                        } else {
                            return consumeFromErrorQueue();
                        }
                    });
                };

                var reservedEvents = [];
                var deferred = $q.defer();
                if (!offlineService.isOfflineApp()) {
                    return $q.when();
                }
                if (offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }

                var dbs = {};
                $q.all(getAllDbPromises()).then(function (allDbs) {
                    _.each(allDbs, function (db) {
                        offlineService.isAndroidApp() ? dbs[db] = db : dbs[db.getSchema().name()] = db;
                    });
                    consumeFromErrorQueue().then(function (response) {
                        releaseReservedEvents(reservedEvents);
                        if (response && response.indexOf("4xx error") != -1) {
                            return;
                        }
                        return consumeFromEventQueue();
                    });
                });
                return deferred.promise;
            };
        }
    ]);
