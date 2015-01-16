'use strict';

angular.module('bahmni.dhis')
    .service('TaskService', ['$http', function ($http) {
        this.getAllTasks = function () {
            return $http.get(Bahmni.Common.Constants.dhisAllTasksUrl);
        }
    }]);