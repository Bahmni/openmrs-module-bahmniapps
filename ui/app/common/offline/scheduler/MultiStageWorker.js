'use strict';

Bahmni.Common.Offline.MultiStageWorker = function ($q) {
    var self = this;
    this.stages = [];
    this.paused = false;
    this.currentlyExecutingStage = null;

    var checkForPause = function () {
        if (self.paused) {
            return $q.reject({});
        }
        return $q.when({});
    };

    var getStagesToBeExecuted = function () {
        var index = self.stages.indexOf(self.currentlyExecutingStage);
        index = index < 0 ? 0 : index;
        return self.stages.slice(index);
    };

    this.addStage = function (worker) {
        self.stages.push(worker);
    };

    this.execute = function () {
        self.paused = false;
        return getStagesToBeExecuted().reduce(function (promise, worker) {
            return promise.then(checkForPause).then(function () {
                self.currentlyExecutingStage = worker;
                return worker.execute();
            });
        }, checkForPause()).then(function () {
            self.currentlyExecutingStage = null;
        });
    };

    this.pause = function () {
        self.paused = true;
        if (this.currentlyExecutingStage !== null && this.currentlyExecutingStage.pause) {
            this.currentlyExecutingStage.pause();
        }
    };
};
