'use strict';

Bahmni.Dhis.Task = (function () {
    var Task = function (task) {
        this.id = task.taskId;
        this.dateCreated = task.dateCreated;
        this.status = task.taskStatus;
        this.results = task.results ? JSON.parse(JSON.parse(task.results)).map(Bahmni.Dhis.Result.create) : undefined;
        this.groupedResults = _.groupBy(this.results, function (result) {
            return result.queryGroup;
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