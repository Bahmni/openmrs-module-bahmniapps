'use strict';

angular.module("bahmni.common.offline")
    .service("scheduledSync", ['$q', '$rootScope', 'scheduledJob', 'offlineService', 'offlineDbService', 'androidDbService', 'offlinePush', 'offlinePull',
        'appUpdateService', 'ngDialog',
        function ($q, $rootScope, scheduledJob, offlineService, offlineDbService, androidDbService, offlinePush, offlinePull,
                  appUpdateService, ngDialog) {
            return function (syncButtonConfig) {
                var job;
                if (offlineService.isAndroidApp()) {
                    offlineDbService = androidDbService;
                }

                if (syncButtonConfig === undefined) {
                    syncButtonConfig = {delay: offlineService.getItem('schedulerInterval'), repeat: 0};
                }
                var multiStageWorker = new Bahmni.Common.Offline.MultiStageWorker($q);
                var STAGES = {
                    STAGE0: "STAGE 0",
                    STAGE1: "STAGE 1",
                    STAGE2: "STAGE 2"
                };
                multiStageWorker.addStage(
                    {
                        execute: function () {
                            try {
                                $rootScope.$broadcast("schedulerStage", STAGES.STAGE0);
                                console.log(STAGES.STAGE0);

                                return appUpdateService.getUpdateInfo().then(function (appUpdateInfo) {
                                    if (appUpdateInfo && appUpdateInfo.forcedUpdateRequired) {
                                        console.log(STAGES.STAGE0 + ' Stopping other stages, app needs an update');
                                        $rootScope.$broadcast("schedulerStage", null, true);
                                        multiStageWorker.pause();

                                        ngDialog.open({
                                            template: '../common/ui-helper/views/appUpdatePopup.html',
                                            className: 'test ngdialog-theme-default',
                                            data: appUpdateInfo,
                                            showClose: true,
                                            controller: 'AppUpdateController'
                                        });
                                    }
                                }).catch(function (response) {
                                    if (response.status === -1) {
                                        multiStageWorker.pause();
                                        $rootScope.$broadcast("schedulerStage", null, true);
                                    }
                                });
                            } catch (e) {
                                console.log('Error at ' + STAGES.STAGE0, e);
                            }
                        }
                    });
                multiStageWorker.addStage(
                    {
                        execute: function () {
                            try {
                                $rootScope.$broadcast("schedulerStage", STAGES.STAGE1);
                                console.log(STAGES.STAGE1);
                                return offlinePush().then(function () {
                                }, function (error) {
                                    console.log("Error " + STAGES.STAGE1 + "\n" + error.config.url + " " + error.statusText);
                                });
                            } catch (e) {
                                console.log('Error at ' + STAGES.STAGE1, e);
                            }
                        }

                    });
                multiStageWorker.addStage(
                    {
                        execute: function () {
                            try {
                                $rootScope.$broadcast("schedulerStage", STAGES.STAGE2);
                                console.log(STAGES.STAGE2);
                                return offlinePull().then(function () {
                                }, function (error) {
                                    console.log("Error " + STAGES.STAGE2 + "\n" + error.config.url + " " + error.statusText);
                                });
                            } catch (e) {
                                console.log('Error at ' + STAGES.STAGE2, e);
                            }
                        }
                    });
                if (!job) {
                    job = scheduledJob.create({
                        worker: multiStageWorker,
                        interval: syncButtonConfig.delay,
                        count: syncButtonConfig.repeat
                    });
                    job.start();
                }
                return job;
            };
        }
    ]);
