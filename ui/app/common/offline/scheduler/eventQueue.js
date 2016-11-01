'use strict';

angular.module("bahmni.common.offline")
    .service("eventQueue", ['$q', function ($q) {
        var hustle;
        var init = function () {
            hustle = new Hustle({
                "db_name": "Bahmni_hustle",
                "db_version": 1,
                "tubes": ["event_queue", "error_queue"]
            });
            hustle.promisify();
        };

        init();

        var getQueue = function () {
            if (hustle.is_open()) {
                return $q.when(hustle);
            }
            return $q.when(hustle.open());
        };

        this.getCount = function () {
            return getQueue().then(function () {
                return hustle.Queue.count_ready("event_queue");
            });
        };

        this.getErrorCount = function () {
            return getQueue().then(function () {
                return hustle.Queue.count_ready("error_queue");
            });
        };

        this.addToEventQueue = function (eventContent) {
            return getQueue().then(function () {
                return hustle.Queue.put(eventContent, {tube: "event_queue", ttr: 10});
            });
        };

        this.addToErrorQueue = function (eventContent) {
            return getQueue().then(function () {
                return hustle.Queue.put(eventContent, {tube: "error_queue", ttr: 10});
            });
        };

        this.consumeFromEventQueue = function () {
            return getQueue().then(function () {
                return $q.when(hustle.Queue.reserve({tube: "event_queue"}));
            });
        };

        this.consumeFromErrorQueue = function () {
            return getQueue().then(function () {
                return $q.when(hustle.Queue.reserve({tube: "error_queue"}));
            });
        };

        this.removeFromQueue = function (event) {
            return getQueue().then(function () {
                return $q.when(hustle.Queue.delete(event.id));
            });
        };

        this.releaseFromQueue = function (event) {
            return getQueue().then(function () {
                return $q.when(hustle.Queue.release(event.id));
            });
        };
    }]);
