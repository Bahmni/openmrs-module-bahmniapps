'use strict';

angular.module('bahmni.appointments')
    .controller('AllAppointmentsController', ['$scope', '$location', 'appService',
        function ($scope, $location, appService) {
            $scope.enableCalendarView = appService.getAppDescriptor().getConfigValue('enableCalendarView');

            $scope.navigateTo = function (viewName) {
                $scope.currentTab = viewName;
                var path = '/home/manage/appointments/' + viewName;
                $location.url(path);
            };

            var init = function () {
                var defaultTab = $scope.enableCalendarView ? 'calendar' : 'list';
                $scope.navigateTo(defaultTab);
            };
            return init();
        }]);
