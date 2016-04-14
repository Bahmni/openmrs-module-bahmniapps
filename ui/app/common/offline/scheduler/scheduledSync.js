'use strict';

angular.module("bahmni.common.offline")
    .service("scheduledSync", ['$q', 'scheduledJob', 'offlineService', 'offlineDbService', 'androidDbService', 'offlinePush', 'offlinePull',
        function($q, scheduledJob, offlineService, offlineDbService, androidDbService, offlinePush, offlinePull) {
            return function(){
                if(offlineService.isAndroidApp()){
                    offlineDbService = androidDbService;
                }
                var multiStageWorker = new Bahmni.Common.Offline.MultiStageWorker($q);
                var db;
                multiStageWorker.addStage(
                    {
                        execute: function() {
                            console.log("In stage 1");
                            if(db){
                                return db.close();
                            }
                            return;
                        }
                    });
                multiStageWorker.addStage(
                    {
                        execute: function () {
                            console.log("In stage 2");
                            if(offlineService.isChromeApp()) {
                                return offlineDbService.reinitSchema().then(function (_db) {
                                    db = _db;
                                    return offlineDbService.init(_db);

                                });
                            }
                        }
                    });
                multiStageWorker.addStage(
                    {
                        execute: function() {
                            console.log("In stage 3");
                            return offlinePush();
                        }
                    });
                multiStageWorker.addStage(
                    {
                        execute: function() {
                            console.log("In stage 4");
                            return offlinePull();
                        }
                    });
                return scheduledJob.create({worker: multiStageWorker, interval: localStorage.getItem('schedulerInterval')}).start();
            };

        }
    ]);
