'use strict';

angular.module('bahmni.ot')
    .directive('otCalendarSurgicalBlock', [function () {
        var link = function ($scope) {
            $scope.gridOffset = $scope.gridOffset || {
                    height: 100
            };

            $scope.heightPerMin = $scope.gridOffset.height / $scope.dayViewSplit;

            var calculateDimensionsForSurgicalBlock = function () {
                $scope.blockDimensions = {
                    height: getHeightForSurgicalBlock(),
                    top:  getTopForSurgicalBlock(),
                    color: getColorForSurgicalBlock(),
                    appointmentHeightPerMin : (getHeightForSurgicalBlock() - 20)/ Bahmni.Common.Util.DateUtil.diffInMinutes(
                        $scope.surgicalBlock.startDatetime, $scope.surgicalBlock.endDatetime)

                };
            };


            var getColorForSurgicalBlock = function () {
              return $scope.surgicalBlock.provider.attributes[0].display.split(":")[1];
            };

            var getHeightForSurgicalBlock = function () {
                return Bahmni.Common.Util.DateUtil.diffInMinutes(
                   $scope.surgicalBlock.startDatetime, $scope.surgicalBlock.endDatetime) * $scope.heightPerMin;
            };

            var getTopForSurgicalBlock = function () {
                return Bahmni.Common.Util.DateUtil.diffInMinutes(
                        $scope.calendarStartDatetime, $scope.surgicalBlock.startDatetime) * $scope.heightPerMin;
            };


            calculateDimensionsForSurgicalBlock();

            $scope.selectedSurgicalBlock = function (event) {
                console.log(event);
                $(event.target).focus();
            }
        };
        return {
            restrict: 'E',
            link: link,
            scope: {
                surgicalBlock: "=",
                gridOffset: "=?",
                calendarStartDatetime: "=",
                calendarEndDatetime: "=",
                dayViewSplit: "="
            },
            templateUrl: "../ot/views/calendarSurgicalBlock.html"
        };
    }]);
