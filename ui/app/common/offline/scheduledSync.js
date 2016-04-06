'use strict';

angular.module("bahmni.common.offline")
    .service("scheduledSync", ['$q', 'scheduledJob','androidDbService', 'offlinePush', 'offlinePull',
        function($q, scheduledJob, androidDbService, offlinePush, offlinePull) {
            return function(){
                return androidDbService.initSchema().then(function(db) {
                    androidDbService.init(db);
                    var multiStageWorker = new Bahmni.Common.Offline.MultiStageWorker($q);
                    multiStageWorker.addStage(
                        {
                            execute: function() {
                                console.log("In stage 1");
                                return offlinePush();
                            }
                        });
                    multiStageWorker.addStage(
                        {
                            execute: function() {
                                console.log("In stage 2");
                                return offlinePull();
                            }
                        });
                    scheduledJob.create({worker: multiStageWorker, interval: 30000}).start();
                });
            };

        }
    ]);
