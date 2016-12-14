'use strict';

angular.module('bahmni.common.offline')
  .factory('offlinePush', ['offlineService', 'eventQueue', '$http', 'offlineDbService', 'androidDbService', '$q', 'loggingService',
    function (offlineService, eventQueue, $http, offlineDbService, androidDbService, $q, loggingService) {
      return function () {
        var reservedPromises = [];
        var releaseReservedEvents = function (reservedEvents) {
          angular.forEach(reservedEvents, function (reservedEvent) {
            reservedPromises.push(eventQueue.releaseFromQueue(reservedEvent));
          });
        };

        var reservedEventsOfOtherDb = [];
        var tempDbNames = ["Bahmni_hustle", 'metadata', 'undefined'];
        var db,dbName;


        var intialiseDbInstance = function () {
          var dbNames = [];
          var deferred = $q.defer();
          indexedDB.webkitGetDatabaseNames().onsuccess = function (result) {
            dbNames = result.target.result;
            dbNames = _.difference(dbNames, tempDbNames);
            dbName = dbNames[0];
            offlineDbService.initSchema(dbName).then(function (newDb) {
              db = newDb;
              offlineDbService.init(db);
              deferred.resolve(db);
            });
          };
          return deferred.promise;
        };


        var consumeFromEventQueue = function () {
          return eventQueue.consumeFromEventQueue().then(function (event) {
            if (!event && (reservedEventsOfOtherDb.length == 0)) {
              return;
            }
            else {
              return process("event_queue", event);
            }
          });
        };



        var consumeFromErrorQueue = function () {
          return eventQueue.consumeFromErrorQueue().then(function (event) {
            if (!event && (reservedEventsOfOtherDb.length == 0)) {
              return;
            }
            else {
              return process("error_queue", event);
            }
          });
        };

        var process  = function (queue, event) {
          if (!event) {
            tempDbNames.push(dbName);
            releaseReservedEvents(reservedEventsOfOtherDb);
            Promise.all(reservedPromises).then(function () {
              reservedEventsOfOtherDb = [];
              intialiseDbInstance().then(function () {
                queue == "event_queue" ? consumeFromEventQueue() : consumeFromErrorQueue();
              });
            });
          }
          else if (event && event.data.loginLocation == dbName) {
            return processEvent(event);
          }
          else {
            reservedEventsOfOtherDb.push(event);
            queue == "event_queue" ? consumeFromEventQueue() : consumeFromErrorQueue();
          }
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

        var getEventData = function (event) {
          if (event.data.type && event.data.type == "encounter") {
            return offlineDbService.getEncounterByEncounterUuid(event.data.encounterUuid);
          } else if (event.data.type && event.data.type === "Error") {
            return offlineDbService.getErrorLogByUuid(event.data.uuid);
          } else {
            return offlineDbService.getPatientByUuidForPost(event.data.patientUuid).then(function (response) {
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

        var processEvent = function (event) {
          return getEventData(event)
            .then(function (response) {
              return postData(event, response)
                .success(function (data) {
                  if (event.data.type && event.data.type == "encounter") {
                    return offlineDbService.createEncounter(data).then(function () {
                      return successCallBack(event);
                    });
                  }
                  return successCallBack(event);
                }).catch(function (response) {
                  if (event.data.type !== "Error" && (parseInt(response.status / 100) === 5 || parseInt(response.status / 100) === 4)) {
                    loggingService.logSyncError(response.config.url, response.status, response.data, response.config.data);
                  }
                  if (parseInt(response.status / 100) === 5) {
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
                    return "4xx error";
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

        intialiseDbInstance().then(function () {
          consumeFromErrorQueue().then(function (response) {
            releaseReservedEvents(reservedEvents);
            if (response == "4xx error") {
              return;
            }
            tempDbNames = ["Bahmni_hustle", 'metadata', 'undefined'];
            return consumeFromEventQueue();
          });
        });

        return deferred.promise;
      };
    }
  ]);
