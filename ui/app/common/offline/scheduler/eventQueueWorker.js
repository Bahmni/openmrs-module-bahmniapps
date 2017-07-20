'use strict';

angular.module("bahmni.common.offline")
    .service("eventQueueWorker", ['$q', 'eventQueue', 'syncService', function ($q, eventQueue, syncService) {
        var self = this;

        var sync = function (event) {
            return syncService.sync(event);
        };

        var removeFromQueue = function (event) {
            return eventQueue.removeFromQueue(event);
        };

        var handleErrorInSync = function (event) {
            return eventQueue.addToErrorQueue(event);
        };

        var pushEvents = function () {
            return eventQueue.getCount().then(function (count) {
                if (!self.paused && count > 0) {
                    return eventQueue.consumeFromEventQueue()
                    .then(sync)
                    .then(removeFromQueue, handleErrorInSync)
                    .then(pushEvents);
                }
            });
        };

        this.execute = function () {
            this.paused = false;
            return pushEvents();
        };

        this.pause = function () {
            this.paused = true;
        };
    }]);
