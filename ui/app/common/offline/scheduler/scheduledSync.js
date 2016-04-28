'use strict';

angular.module("bahmni.common.offline")
    .service("scheduledSync", ['$q', 'scheduledJob', 'offlineService', 'offlineDbService', 'androidDbService', 'offlinePush', 'offlinePull',
        function($q, scheduledJob, offlineService, offlineDbService, androidDbService, offlinePush, offlinePull) {
            return function(output, syncButtonConfig){

                if(offlineService.isAndroidApp()){
                    offlineDbService = androidDbService;
                }

                if(syncButtonConfig === undefined){
                    syncButtonConfig = {delay: offlineService.getItem('schedulerInterval'), repeat: 0};
                }
                var multiStageWorker = new Bahmni.Common.Offline.MultiStageWorker($q);
                var db, STAGES = {
                    STAGE1 : "STAGE 1",
                    STAGE2 : "STAGE 2",
                    STAGE3 : "STAGE 3",
                    STAGE4 : "STAGE 4",
                    STAGE_FINAL : "STAGE FINAL"
                };
                multiStageWorker.addStage(
                    {
                        execute: function() {
                            try{
                                //output.notify(STAGES.STAGE1);
                                console.log(STAGES.STAGE1);
                                if(db){
                                    return db.close();
                                }
                            } catch (e) {
                                console.log('Error at '+STAGES.STAGE1, e);
                            }
                        }
                    });
                multiStageWorker.addStage(
                    {
                        execute: function () {
                            try{
                                //output.notify(STAGES.STAGE2);
                                console.log(STAGES.STAGE2);
                                if(offlineService.isChromeApp()) {
                                    return offlineDbService.reinitSchema().then(function (_db) {
                                        db = _db;
                                        return offlineDbService.init(_db);

                                    });
                                }
                            } catch (e) {
                                console.log('Error at '+STAGES.STAGE2, e);
                            }
                        }
                    });
                multiStageWorker.addStage(
                    {
                        execute: function() {
                            try{
                                //output.notify(STAGES.STAGE3);
                                console.log(STAGES.STAGE3);
                                return offlinePush();
                            } catch (e) {
                                console.log('Error at '+STAGES.STAGE3, e);
                            }
                        }
                    });
                multiStageWorker.addStage(
                    {
                        execute: function() {
                            try{
                                //output.notify(STAGES.STAGE4);
                                console.log(STAGES.STAGE4);
                                return offlinePull();
                            } catch (e) {
                                console.log('Error at '+STAGES.STAGE4, e);
                            }
                        }
                    });
                multiStageWorker.addStage(
                    {
                        execute: function() {
                            try{
                                //output.notify(null);
                                console.log("All stages done");
                            } catch (e) {
                                console.log('Error at '+STAGES.STAGE_FINAL, e);
                            }
                        }
                    });
                return scheduledJob.create({worker: multiStageWorker, interval: syncButtonConfig.delay, count : syncButtonConfig.repeat}).start();
            };

        }
    ]);
