angular.module("bahmni.common.offline")
    .service("scheduledJob", ['$q', '$interval', function($q, $interval) {
        this.create = function(config) {
            return new Job(config.interval, config.worker);
        }

        var Job = function(interval, worker) {
            var jobPromise = null;

            this.start = function() {
                jobPromise = $interval(worker.execute, interval);
            };

            this.stop = function() {
                if(jobPromise != null) {
                    $interval.cancel(jobPromise);
                }
            };

            this.pause = function() {
                worker.pause();
                this.stop();
            };
        }
    }]);