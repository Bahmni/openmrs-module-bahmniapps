'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsManageController', ['$scope', '$location', '$state', 'appService',
        function ($scope, $location, $state, appService) {
            $scope.enableCalendarView = appService.getAppDescriptor().getConfigValue('enableCalendarView');

            $scope.navigateTo = function (state) {
                var path = '/home/manage/' + ((state === 'appointments') ? getAppointmentsTab() : state);
                $location.url(path);
            };
            var getAppointmentsTab = function () {
                return 'appointments/' + ($scope.enableCalendarView ? 'calendar' : 'list');
            };

            $scope.getCurrentTabName = function () {
                return $state.current.tabName;
            };
        }]);
