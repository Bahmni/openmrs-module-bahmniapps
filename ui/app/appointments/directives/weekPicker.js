'use strict';

angular.module('bahmni.appointments')
    .directive('weekPicker', function () {
        var controller = function ($scope) {
            var dateUtil = Bahmni.Common.Util.DateUtil;
            var init = function () {
                if (!$scope.viewDate) {
                    $scope.setViewDateToToday();
                }
            };

            $scope.goToPreviousWeek = function () {
                $scope.viewDate = $scope.viewDate && dateUtil.subtractDays($scope.viewDate, 7);
            };

            $scope.setViewDateToToday = function () {
                $scope.viewDate = moment().startOf('day').toDate();
            };

            $scope.goToNextWeek = function () {
                $scope.viewDate = $scope.viewDate && dateUtil.addDays($scope.viewDate, 7);
            };

            var setWeekStartDate = function (date) {
                var weekStartDayStandard = $scope.weekStart ? $scope.weekStart : 'isoWeek';
                $scope.weekStartDate = moment(date).startOf(weekStartDayStandard).toDate();
            };

            var setWeekEndDate = function (date) {
                var weekStartDayStandard = $scope.weekStart ? $scope.weekStart : 'isoWeek';
                $scope.weekEndDate = moment(date).endOf(weekStartDayStandard).toDate();
            };

            $scope.$watch("viewDate", function (viewDate) {
                setWeekStartDate(viewDate);
                setWeekEndDate(viewDate);
                $scope.onChange($scope.weekStartDate, $scope.weekEndDate);
            });

            init();
        };
        return {
            restrict: "E",
            scope: {
                viewDate: "=",
                onChange: "=",
                weekStart: "=?",
                showButtons: "="
            },
            templateUrl: "../appointments/views/manage/weekPicker.html",
            controller: controller
        };
    });

