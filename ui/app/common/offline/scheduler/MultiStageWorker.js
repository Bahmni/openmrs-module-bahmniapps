'use strict';

Bahmni.Common.Offline.MultiStageWorker = function($q) {
    var self = this;
    this.stages = [];
    this.paused = false;
    this.currentlyExecutingStage = null;

    var checkForPause = function() {
        if(self.paused) {
            return $q.reject({});
        }
        return $q.when({});
    };

    var getStagesToBeExecuted = function() {
        var index = self.stages.indexOf(self.currentlyExecutingStage);
        index = index < 0 ? 0 : index;
        return self.stages.slice(index);
    }

    this.addStage = function(worker) {
        this.stages.push(worker);
    };

    this.execute = function() {
        this.paused = false;
        return getStagesToBeExecuted().reduce(function(promise, worker) {
            return promise.then(checkForPause).then(function() {
                self.currentlyExecutingStage = worker;
                return worker.execute();
            });
        }, checkForPause());
    };

    this.pause = function() {
        this.paused = true;
        if(this.currentlyExecutingStage != null) {
            this.currentlyExecutingStage.pause();
        }
    }
}