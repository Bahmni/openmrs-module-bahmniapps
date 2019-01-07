'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsManageController', ['$scope', '$state', 'appService',
        function ($scope, $state, appService) {
            $scope.enableCalendarView = appService.getAppDescriptor().getConfigValue('enableCalendarView');

            $scope.navigateTo = function (viewName) {
                if (isCurrentAndNextViewAreAppointmentListView(viewName)) {
                    return;
                }
                var stateName = 'home.manage.' + ((viewName === 'appointments') ? getAppointmentsTab() : viewName);
                $state.go(stateName, $state.params, {reload: false});
            };

            var isCurrentAndNextViewAreAppointmentListView = function (viewName) {
                return viewName === 'appointments' && ($state.current.tabName === 'calendar' || $state.current.tabName === 'list');
            };

            var getAppointmentsTab = function () {
                return 'appointments.' + ($scope.enableCalendarView ? 'calendar' : 'list');
            };

            $scope.getCurrentTabName = function () {
                return $state.current.tabName;
            };
        }]);
