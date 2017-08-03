'use strict';

angular.module('bahmni.appointments')
    .controller('AllAppointmentsController', ['$scope', '$location',
        function ($scope, $location) {
            function setPath (statePath) {
                var path = '/home/manage/appointments' + '/' + statePath;
                $location.url(path);
            }
            $scope.navigateTo = function (viewName) {
                $scope.currentTab = viewName;
                if (viewName === 'calendar') {
                    setPath('calendar');
                } else {
                    setPath('list');
                }
            };
            $scope.createNewAppointment = function () {
            };
            var init = function () {
                $scope.navigateTo('calendar');
            };
            return init();
        }]);
