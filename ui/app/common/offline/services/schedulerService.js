'use strict';

angular.module('bahmni.common.offline')
    .service('schedulerService', ['offlineService', 'WorkerService', 'scheduledSync',
        function (offlineService, WorkerService, scheduledSync) {
            this.jobs = [];
            this.sync = function (config) {
                if (offlineService.isChromeApp() || offlineService.isAndroidApp()) {
                    var job = scheduledSync(config, undefined);
                    this.jobs.push(job);
                }
            };

            this.stopSync = function () {
                if (offlineService.isChromeApp() || offlineService.isAndroidApp()) {
                    _.each(this.jobs, function (job) {
                        job.stop();
                    });
                }
            };
        }
    ]);
