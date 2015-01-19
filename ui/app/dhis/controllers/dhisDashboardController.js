'use strict';

angular.module('bahmni.dhis')
    .controller('DhisDashboardController', ['$scope', '$state', 'TaskService',
        function ($scope, $state, taskService) {
            $scope.report = new Bahmni.Dhis.ReportParams.default();

            taskService.getAllTasks().then(function (results) {
                $scope.tasks = results ? results.data.map(Bahmni.Dhis.Task.create) : [];
                $scope.tasks.isEmpty = function () {
                    return $scope.tasks.length === 0;
                };
            });

            $scope.fireQueries = function () {
                taskService.fireQueries($scope.report).then(function (response) {
                    $state.transitionTo($state.current, $state.params, {
                        reload: true,
                        inherit: false,
                        notify: true
                    });
                });
            };

            $scope.openReport = function(taskId){
                $state.params.taskId = taskId;
                $state.transitionTo("dhis.report", $state.params, {
                    reload: false,
                    inherit: false,
                    notify: true
                });
            };
        }]);