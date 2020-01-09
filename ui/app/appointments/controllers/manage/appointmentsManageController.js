'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsManageController', ['$scope', '$state', 'appService',
        function ($scope, $state, appService) {
            $scope.enableCalendarView = appService.getAppDescriptor().getConfigValue('enableCalendarView');

            $scope.navigateTo = function (viewName) {
                if (isSameTab(viewName)) {
                    return;
                }
                var stateName = 'home.manage.' + ((viewName === 'appointments') ? getAppointmentsTab() : viewName);
                $state.go(stateName, $state.params, {reload: false});
            };

            var isSameTab = function (viewName) {
                var appointmentListTabs = ['calendar', 'list'];
                var isInAppointmentListTab = _.includes(appointmentListTabs, $scope.getCurrentTabName());
                return $scope.getCurrentTabName() === viewName || (isInAppointmentListTab && viewName === 'appointments');
            };

            var getAppointmentsTab = function () {
                return 'appointments.' + ($scope.enableCalendarView ? 'calendar' : 'list');
            };

            $scope.getCurrentTabName = function () {
                return $state.current && $state.current.tabName;
            };
        }]);
