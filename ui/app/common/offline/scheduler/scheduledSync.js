'use strict';

angular.module("bahmni.common.offline")
    .service("scheduledSync", ['$q', '$rootScope','scheduledJob', 'offlineService', 'offlineDbService', 'androidDbService', 'offlinePush', 'offlinePull',
        function($q, $rootScope, scheduledJob, offlineService, offlineDbService, androidDbService, offlinePush, offlinePull) {
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
                                if(output){
                                  output.notify(STAGES.STAGE1);
                                }else{
                                    $rootScope.$broadcast("schedulerStage",STAGES.STAGE1);
                                }
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
                                if(output){
                                    output.notify(STAGES.STAGE2);
                                }else{
                                    $rootScope.$broadcast("schedulerStage",STAGES.STAGE2);
                                }
                                console.log(STAGES.STAGE2);
                                if(offlineService.isChromeApp()) {
                                    return offlineDbService.reinitSchema().then(function (_db) {
                                        db = _db;
                                        return offlineDbService.init(_db);

                                    }, function(error){
                                        console.log("Error at "+STAGES.STAGE2+" Unable get Db Connection")
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
                                if(output){
                                    output.notify("schedulerStage",STAGES.STAGE3);
                                }else{
                                    $rootScope.$broadcast(STAGES.STAGE3);
                                }
                                console.log(STAGES.STAGE3);
                                return offlinePush().then(function(){
                                },function(error){
                                    console.log("Error " + STAGES.STAGE3 +"\n"+ error.config.url + " "+error.statusText);
                                });
                            }
                            catch(e){

                            }
                        }
                    });
                multiStageWorker.addStage(
                    {
                        execute: function() {
                            try{
                                if(output){
                                    output.notify(STAGES.STAGE4);
                                }else{
                                    $rootScope.$broadcast("schedulerStage",STAGES.STAGE4);
                                }
                                console.log(STAGES.STAGE4);
                                return offlinePull().then(function(){
                                }, function(error){
                                    console.log("Error " + STAGES.STAGE4 +"\n"+ error.config.url + " "+error.statusText);
                                });
                            } catch (e) {
                                console.log('Error at '+STAGES.STAGE4, e);
                            }
                        }
                    });
                multiStageWorker.addStage(
                    {
                        execute: function() {
                            try{
                                if(output){
                                    output.notify(null);
                                }else{
                                    $rootScope.$broadcast("schedulerStage", null);
                                }
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
