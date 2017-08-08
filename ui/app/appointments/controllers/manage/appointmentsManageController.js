'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsManageController', ['$scope', '$location', 'appService',
        function ($scope, $location, appService) {
            $scope.enableCalendarView = appService.getAppDescriptor().getConfigValue('enableCalendarView');
            var init = function () {
                $scope.navigateTo('summary');
            };

            $scope.navigateTo = function (state) {
                $scope.currentTab = state;
                var path = '/home/manage/' + ((state === 'appointments') ? getAppointmentsTab() : state);
                $location.url(path);
            };

            var getAppointmentsTab = function () {
                return 'appointments/' + ($scope.enableCalendarView ? 'calendar' : 'list');
            };

            return init();
        }]);
