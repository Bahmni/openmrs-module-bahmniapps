'use strict';

angular.module('bahmni.dhis')
    .controller('ReportController', ['$scope', '$stateParams', 'TaskService',
        function ($scope, $stateParams, taskService) {
            taskService.getResultsById($stateParams.taskId).then(function (response) {
                $scope.task = Bahmni.Dhis.Task.create(response.data);
            });
        }]);

