'use strict';

angular.module('bahmni.appointments')
    .controller('AllAppointmentsController', ['$scope', '$state', 'appService',
        function ($scope, $state, appService) {
            $scope.enableCalendarView = appService.getAppDescriptor().getConfigValue('enableCalendarView');
            $scope.isSearchEnabled = false;
            $scope.manageAppointmentPrivilege = Bahmni.Appointments.Constants.privilegeManageAppointments;

            $scope.navigateTo = function (viewName) {
                $scope.currentTab = viewName;
                var path = 'home.manage.appointments.' + viewName;
                $state.go(path, $state.params, {reload: false});
            };

            $scope.getCurrentAppointmentTabName = function () {
                return $state.current.tabName;
            };

            $scope.$watch(function () {
                return $state.params.isSearchEnabled;
            }, function (isSearchEnabled) {
                $scope.isSearchEnabled = isSearchEnabled;
            }, true);
        }]);
