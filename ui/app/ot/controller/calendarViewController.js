'use strict';

angular.module('bahmni.ot')
    .controller('calendarViewController', ['$scope', '$state', 'appService',
        function ($scope, $state, appService) {
            $scope.goToNewSurgicalAppointment = function () {
                var options = {};
                options['dashboardCachebuster'] = Math.random();
                $state.go("newSurgicalAppointment", options);
            };
            $scope.viewDate = new Date(moment().startOf('day'));
            $scope.calendarConfig = appService.getAppDescriptor().getConfigValue("calendarView");
            $scope.goToPreviousDate = function (date) {
                $scope.viewDate = Bahmni.Common.Util.DateUtil.subtractDays(date, 1);
            };

            $scope.goToCurrentDate = function () {
                $scope.viewDate = new Date(moment().startOf('day'));
            };

            $scope.goToNextDate = function (date) {
                $scope.viewDate = Bahmni.Common.Util.DateUtil.addDays(date, 1);
            };
        }]);
