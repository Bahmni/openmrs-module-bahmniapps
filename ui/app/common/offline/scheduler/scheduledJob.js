'use strict';

angular.module("bahmni.common.offline")
    .service("scheduledJob", ['$q', '$interval', function ($q, $interval) {
        this.create = function (config) {
            return new Job(config.worker, config.interval, config.count);
        };

        var Job = function (worker, interval, repeat) {
            var jobPromise = null;

            this.start = function () {
                this.jobPromise = $interval(worker.execute, interval, repeat);
            };

            this.stop = function () {
                if (this.jobPromise != null) {
                    $interval.cancel(this.jobPromise);
                    this.jobPromise = null;
                }
            };

            this.pause = function () {
                worker.pause();
                this.stop();
            };
        };
    }]);
