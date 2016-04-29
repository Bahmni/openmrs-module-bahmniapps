angular.module('bahmni.common.offline')
    .service('offlinePatientSyncService', ['offlineService','WorkerService','scheduledSync',
        function (offlineService, WorkerService, scheduledSync) {

            this.sync = function (config) {
                if (offlineService.isChromeApp()) {
                    if (Bahmni.Common.Offline && Bahmni.Common.Offline.BackgroundWorker) {
                        new Bahmni.Common.Offline.BackgroundWorker(WorkerService, offlineService,config);
                    }
                }
                else if(offlineService.isAndroidApp()){
                    scheduledSync(undefined, config);
                }
            }
        }
    ]);
