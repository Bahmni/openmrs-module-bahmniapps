'use strict';

angular.module('bahmni.appointments')
    .controller('AllAppointmentsController', ['$scope', '$state', 'appService', '$rootScope',
        function ($scope, $state, appService, $rootScope) {
            $scope.enableCalendarView = appService.getAppDescriptor().getConfigValue('enableCalendarView');
            $scope.isSearchEnabled = false;
            $scope.manageAppointmentPrivilege = Bahmni.Appointments.Constants.privilegeManageAppointments;
            $scope.selfAppointmentPrivilege = Bahmni.Appointments.Constants.privilegeSelfAppointments;

            $scope.navigateTo = function (viewName) {
                $scope.currentTab = viewName;
                var path = 'home.manage.appointments.' + viewName;
                $state.params.appointmentsData = $rootScope.appointmentsData;
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
