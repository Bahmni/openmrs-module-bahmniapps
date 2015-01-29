'use strict';

Bahmni.Dhis.Task = (function () {
    var Task = function (task) {
        this.id = task.taskId;
        this.dateCreated = task.dateCreated;
        this.status = task.taskStatus;
        this.results = task.results ? JSON.parse(JSON.parse(task.results)).map(Bahmni.Dhis.Result.create) : undefined;

        var self = this;

        this.resultGroups = new Bahmni.Dhis.ResultGroups();
        _.each(this.results, function (result) {
            self.resultGroups.add( result.queryGroup, result );
        });
    };

    Task.prototype = {
        isCompleted: function () {
            return this.status === "DONE";
        }
    };

    Task.create = function (task) {
        return new Task(task);
    };

    return Task;
})();