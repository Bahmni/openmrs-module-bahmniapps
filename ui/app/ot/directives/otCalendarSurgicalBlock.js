'use strict';

angular.module('bahmni.ot')
    .directive('otCalendarSurgicalBlock', [function () {
        var link = function ($scope) {
            var gridCellHeight = 120;
            var heightForSurgeonName = 21;
            var surgicalBlockHeightPerMin = gridCellHeight / $scope.dayViewSplit;

            var getViewPropertiesForSurgicalBlock = function () {
                var surgicalBlockHeight = getHeightForSurgicalBlock();
                $scope.blockDimensions = {
                    height: surgicalBlockHeight,
                    top: getTopForSurgicalBlock(),
                    color: getColorForProvider(),
                    appointmentHeightPerMin: (surgicalBlockHeight - heightForSurgeonName) / Bahmni.Common.Util.DateUtil.diffInMinutes(
                        $scope.surgicalBlock.startDatetime, $scope.surgicalBlock.endDatetime)
                };
            };

            var getColorForProvider = function () {
                return $scope.surgicalBlock.provider.attributes[0] ? $scope.surgicalBlock.provider.attributes[0].display.split(":")[1] : "#FFF";
            };

            var getHeightForSurgicalBlock = function () {
                return Bahmni.Common.Util.DateUtil.diffInMinutes(
                        $scope.surgicalBlock.startDatetime, $scope.surgicalBlock.endDatetime) * surgicalBlockHeightPerMin;
            };

            var getTopForSurgicalBlock = function () {
                return Bahmni.Common.Util.DateUtil.diffInMinutes(
                        $scope.calendarStartDatetime, $scope.surgicalBlock.startDatetime) * surgicalBlockHeightPerMin;
            };
            
            $scope.isValidSurgicalAppointment = function (surgicalAppointment) {
                return surgicalAppointment.status !== Bahmni.OT.Constants.cancelled && surgicalAppointment.status !== Bahmni.OT.Constants.postponed;
            };
            

            $scope.selectSurgicalBlock = function ($event) {
                $scope.$emit("event:surgicalBlockSelect", $scope.surgicalBlock);
                $event.stopPropagation();
            };

            $scope.deselectSurgicalBlock = function ($event) {
                $scope.$emit("event:surgicalBlockDeselect");
                $event.stopPropagation();
            };

            getViewPropertiesForSurgicalBlock();
        };
        return {
            restrict: 'E',
            link: link,
            scope: {
                surgicalBlock: "=",
                calendarStartDatetime: "=",
                calendarEndDatetime: "=",
                dayViewSplit: "="
            },
            templateUrl: "../ot/views/calendarSurgicalBlock.html"
        };
    }]);
