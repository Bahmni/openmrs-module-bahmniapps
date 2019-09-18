'use strict';

angular.module('bahmni.appointments')
    .directive('datePicker', function () {
        var controller = function ($scope) {
            var dateUtil = Bahmni.Common.Util.DateUtil;
            var init = function () {
                if (!$scope.viewDate) {
                    $scope.goToCurrent();
                }
                viewDateChange();
            };

            var viewDateChange = function () {
                if (!$scope.lastValidDate || ($scope.lastValidDate && $scope.viewDate && $scope.lastValidDate.getTime() !== $scope.viewDate.getTime())) {
                    $scope.lastValidDate = $scope.viewDate;
                    $scope.onChange($scope.viewDate);
                }
            };

            $scope.goToPrevious = function () {
                $scope.viewDate = $scope.viewDate && dateUtil.subtractDays($scope.viewDate, 1);
                viewDateChange();
            };

            $scope.goToCurrent = function () {
                $scope.viewDate = moment().startOf('day').toDate();
                viewDateChange();
            };

            $scope.goToNext = function () {
                $scope.viewDate = $scope.viewDate && dateUtil.addDays($scope.viewDate, 1);
                viewDateChange();
            };

            $scope.keydownEvent = function () {
                var keyCode;
                if (event) {
                    keyCode = (event.keyCode ? event.keyCode : event.which);
                }
                if (keyCode && (keyCode === 46 || keyCode === 8)) { // delete and backspace keys resp.
                    event.preventDefault();
                } else if (keyCode && keyCode === 13) { // Enter key
                    viewDateChange();
                }
            };

            $scope.dateChanged = function () {
                viewDateChange();
            };
            init();
        };
        return {
            restrict: "E",
            scope: {
                viewDate: "=",
                onChange: "=",
                lastValidDate: "=",
                showButtons: "="
            },
            templateUrl: "../appointments/views/manage/datePicker.html",
            controller: controller
        };
    });
