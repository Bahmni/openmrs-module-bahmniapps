'use strict';

angular.module("bahmni.common.offline")
    .service("scheduledSync", ['$q', 'scheduledJob', function($q, scheduledJob) {
            var jobInit = function() {
                var worker = new Bahmni.Common.Offline.MultiStageWorker($q);
                worker.addStage({
                    execute: function() {
                        console.log("Executing Stage 1");
                        return $q.when({});
                    }
                });
                worker.addStage({
                    execute: function() {
                        console.log("Executing Stage 2");
                        return $q.when({});
                    }
                });
                worker.addStage({
                    execute: function() {
                        console.log("Executing Stage 3");
                        return $q.when({});
                    }
                });

                var job = scheduledJob.create({interval: 2000, worker: worker});
                job.start();
            };

            jobInit();
        }
    ]);
