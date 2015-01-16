'use strict';

Bahmni.Dhis.Task = (function () {
    var Task = function (task) {
        this.dateCreated = task.date_created;
        this.status = task.task_status;
    };

    Task.prototype = {

    };

    Task.create = function (task) {
        return new Task(task);
    };

    return Task;
})();

