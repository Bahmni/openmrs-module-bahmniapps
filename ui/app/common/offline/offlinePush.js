'use strict';

angular.module('bahmni.common.offline')
    .factory('offlinePush', ['offlineService','eventQueue','$http','offlineDbService','androidDbService',
        function (offlineService, eventQueue, $http, offlineDbService, androidDbService) {
            var reservedEvents = [];
            var consumeEvents = function () {
                if (!offlineService.isOfflineApp()) {
                    return;
                }
                if (offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }
                return consumeFromErrorQueue().then(function () {
                    releaseReservedEvents(reservedEvents);
                    consumeFromEventQueue();
                });
            };

            var releaseReservedEvents = function (reservedEvents) {
                angular.forEach(reservedEvents, function (reservedEvent) {
                    eventQueue.releaseFromQueue(reservedEvent);
                });
            };

            var consumeFromEventQueue = function () {
                return eventQueue.consumeFromEventQueue().then(function (event) {
                    if (!event)
                        return;
                    return processEvent(event)
                })
            };

            var consumeFromErrorQueue = function () {
                return eventQueue.consumeFromErrorQueue().then(function (event) {
                    if (!event)
                        return;
                    return processEvent(event)
                })
            };

            var processEvent = function (event) {
                return offlineDbService.getPatientByUuid(event.data.patientUuid).then(function (response) {
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
                             consumeFromEventQueue();
                        } else {
                             consumeFromErrorQueue();
                        }
                    }).catch(function (response) {
                        if (parseInt(response.status / 100) == 5) {
                            if (event.tube === "event_queue") {
                                eventQueue.removeFromQueue(event);
                                eventQueue.addToErrorQueue(event.data);
                                consumeFromEventQueue();
                            }
                            else {
                                reservedEvents.push(event);
                                 consumeFromErrorQueue();
                            }
                        }
                        else {
                            eventQueue.releaseFromQueue(event);
                        }
                    })
                });
            };


            return {
                consumeEvents: consumeEvents,
                processEvent: processEvent
            }
        }
    ]);