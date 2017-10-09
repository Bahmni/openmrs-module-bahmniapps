'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsManageController', ['$scope', '$state', 'appService',
        function ($scope, $state, appService) {
            $scope.enableCalendarView = appService.getAppDescriptor().getConfigValue('enableCalendarView');

            $scope.navigateTo = function (viewName) {
                var stateName = 'home.manage.' + ((viewName === 'appointments') ? getAppointmentsTab() : viewName);
                $state.go(stateName, $state.params, {reload: false});
            };
            var getAppointmentsTab = function () {
                return 'appointments.' + ($scope.enableCalendarView ? 'calendar' : 'list');
            };

            $scope.getCurrentTabName = function () {
                return $state.current.tabName;
            };
        }]);
