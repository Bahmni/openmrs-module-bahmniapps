'use strict';

Bahmni.Common.Offline.BackgroundWorker = function (WorkerService, offlineService, syncButtonConfig) {
    var app;
    if (offlineService.isChromeApp()) {
        app = 'chrome-app';
    } else if (offlineService.isAndroidApp()) {
        app = 'android-app';
    }
    var getUrl = function (path) {
        return chrome.runtime.getURL("app/" + path);
    };

    WorkerService.addToLocalStorage("host", localStorage.getItem('host'));
    WorkerService.addToLocalStorage("LoginInformation", localStorage.getItem('LoginInformation'));
    WorkerService.addToLocalStorage("schedulerInterval", parseInt(localStorage.getItem('schedulerInterval')));
    WorkerService.setAngularUrl(getUrl("components/angular/angular.js"));
    WorkerService.includeScripts(getUrl('common.offline.min.js'));
    WorkerService.addDependency('scheduledSync', 'bahmni.common.offline', getUrl('common.background.min.js'));

    var workerPromise = WorkerService.createAngularWorker(['input', 'output', '$http', 'offlineService', 'scheduledSync',
        function (input, output, $http, offlineService, scheduledSync) {
            app = input.app;
            offlineService.isAndroidApp = function () {
                return app === 'android-app';
            };
            offlineService.isChromeApp = function () {
                return app === 'chrome-app';
            };
            scheduledSync(input.syncButtonConfig, output);
        }]);

    workerPromise.then(
        function success (angularWorker) {
            return angularWorker.run({'app': app, 'syncButtonConfig': syncButtonConfig});
        }, function error (reason) {
        console.log('Web worker error', reason);
    }
    ).then(function success (result) {
        offlineService.setSchedulerStatus(null);
    }, function error (reason) {
        console.log('Problem with the background scheduler stages', reason);
        offlineService.setSchedulerStatus(null);
    }, function notify (update) {
        offlineService.setSchedulerStatus(update);
    }
    );
};
