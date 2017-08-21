'use strict';

angular.module('bahmni.appointments')
    .controller('AllAppointmentsController', ['$scope', '$location', '$state', 'appService',
        function ($scope, $location, $state, appService) {
            $scope.enableCalendarView = appService.getAppDescriptor().getConfigValue('enableCalendarView');

            $scope.navigateTo = function (viewName) {
                var path = '/home/manage/appointments/' + viewName;
                $location.url(path);
            };

            $scope.getCurrentAppointmentTabName = function () {
                return $state.current.tabName;
            };
        }]);
