Bahmni.Common.Offline.BackgroundWorker = function(WorkerService) {
    var getUrl = function(path) {
        return chrome.runtime.getURL("app/" + path);
    };

    WorkerService.setAngularUrl(getUrl("components/angular/angular.js"))
    WorkerService.includeScripts(getUrl('common.offline.min.js'));
    WorkerService.addDependency('scheduledJob', 'bahmni.common.offline', getUrl('common.background.min.js'));
    WorkerService.addDependency('offlinePush', 'bahmni.common.offline', getUrl('common.background.min.js'));

    var workerPromise = WorkerService.createAngularWorker(['input', 'output', '$http', 'scheduledJob', 'offlinePush', function (input, output, $http, scheduledJob, offlinePush) {
        var multiStageWorker = new Bahmni.Common.Offline.MultiStageWorker($q);
        multiStageWorker.addStage({execute: function() { output.notify("In stage 1") }});
        multiStageWorker.addStage({execute: function() { output.notify("In stage 2") }});
        scheduledJob.create({worker: multiStageWorker, interval: 1000}).start();
    }]);

    workerPromise.then(function success(angularWorker) {
            return angularWorker.run({});
        }, function error(reason) {
            console.log('callback error');
            console.log(reason);
        }
    ).then(function success(result) {
            console.log('success');
            console.log(result);
        }, function error(reason) {
            console.log('error');
            console.log(reason);
        }, function notify(update) {
            console.log(update);
        }
    );
};