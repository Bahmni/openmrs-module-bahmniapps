'use strict';

angular.module('bahmni.appointments')
    .directive('datePicker', function () {
        var controller = function ($scope) {
            var dateUtil = Bahmni.Common.Util.DateUtil;
            var init = function () {
                if (!$scope.viewDate) {
                    $scope.goToCurrent();
                }
                $scope.lastValidDate = $scope.viewDate;
            };

            $scope.goToPrevious = function () {
                $scope.viewDate = $scope.viewDate && dateUtil.subtractDays($scope.viewDate, 1);
            };

            $scope.goToCurrent = function () {
                $scope.viewDate = moment().startOf('day').toDate();
            };

            $scope.goToNext = function () {
                $scope.viewDate = $scope.viewDate && dateUtil.addDays($scope.viewDate, 1);
            };

            $scope.$watch("viewDate", function (viewDate) {
                if (!viewDate) {
                    $scope.viewDate = $scope.lastValidDate;
                } else {
                    $scope.lastValidDate = viewDate;
                    $scope.viewDate = viewDate;
                }
                $scope.onChange($scope.viewDate);
            }, true);

            init();
        };
        return {
            restrict: "E",
            scope: {
                viewDate: "=",
                onChange: "="
            },
            templateUrl: "../appointments/views/manage/datePicker.html",
            controller: controller
        };
    });

