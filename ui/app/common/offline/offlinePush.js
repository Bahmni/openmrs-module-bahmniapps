'use strict';

angular.module('bahmni.common.offline')
    .factory('offlinePush', ['offlineService', 'eventQueue', '$http', 'offlineDbService', 'androidDbService', '$q',
        function (offlineService, eventQueue, $http, offlineDbService, androidDbService, $q) {
            return function () {
                var releaseReservedEvents = function (reservedEvents) {
                    angular.forEach(reservedEvents, function (reservedEvent) {
                        eventQueue.releaseFromQueue(reservedEvent);
                    });
                };

                var consumeFromEventQueue = function () {
                    return eventQueue.consumeFromEventQueue().then(function (event) {
                        if (!event) {
                            deferred.resolve();
                            return;
                        }
                        return processEvent(event)
                    })
                };

                var consumeFromErrorQueue = function () {
                    return eventQueue.consumeFromErrorQueue().then(function (event) {
                        if (!event) {
                            return;
                        }
                        return processEvent(event)
                    })
                };

                var processEvent = function (event) {
                    return offlineDbService.getPatientByUuid(event.data.patientUuid).then(function (response) {
                        if(response == undefined){
                            eventQueue.releaseFromQueue(event);
                            return consumeFromEventQueue();
                        }
                        response.relationships = [];
                        return $http.post(event.data.url, response, {
                            withCredentials: true,
                            headers: {
                                "Accept": "application/json",
                                "Content-Type": "application/json"
                            }
                        }).success(function () {
                            eventQueue.removeFromQueue(event);
                            if (event.tube === "event_queue") {
                                return consumeFromEventQueue();
                            } else {
                                return consumeFromErrorQueue();
                            }
                        }).catch(function (response) {
                            if (parseInt(response.status / 100) == 5) {
                                if (event.tube === "event_queue") {
                                    eventQueue.removeFromQueue(event);
                                    eventQueue.addToErrorQueue(event.data);
                                    return consumeFromEventQueue();
                                }
                                else {
                                    reservedEvents.push(event);
                                    return consumeFromErrorQueue();
                                }
                            }
                            else {
                                eventQueue.releaseFromQueue(event);
                                deferred.resolve();
                                return "4xx error";
                            }
                        })
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
                consumeFromErrorQueue().then(function (response) {
                    releaseReservedEvents(reservedEvents);
                    if(response == "4xx error") {
                        return;
                    }
                    return consumeFromEventQueue();
                });
                return deferred.promise;
            };
        }
    ]);