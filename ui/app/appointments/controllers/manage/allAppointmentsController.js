'use strict';

angular.module('bahmni.appointments')
    .controller('AllAppointmentsController', ['$scope', '$state', 'appService',
        function ($scope, $state, appService) {
            $scope.enableCalendarView = appService.getAppDescriptor().getConfigValue('enableCalendarView');

            $scope.navigateTo = function (viewName) {
                $scope.currentTab = viewName;
                var path = 'home.manage.appointments.' + viewName;
                $state.go(path, $state.params, {reload: false});
            };

            $scope.getCurrentAppointmentTabName = function () {
                return $state.current.tabName;
            };
        }]);
