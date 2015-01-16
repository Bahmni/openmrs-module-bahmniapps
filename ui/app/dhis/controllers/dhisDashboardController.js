'use strict';

angular.module('bahmni.dhis')
    .controller('DhisDashboardController', ['$scope', 'appService', 'spinner', 'TaskService',
        function ($scope, appService, spinner, taskService) {
            var getAllTasks = taskService.getAllTasks().then(function (results) {
                $scope.tasks = results.data.map(Bahmni.Dhis.Task.create);
            });


        }]);