'use strict';

angular.module('bahmni.ot')
    .directive('otCalendarSurgicalBlock', ['surgicalAppointmentHelper', function (surgicalAppointmentHelper) {
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
                var otCalendarColorAttribute = _.find($scope.surgicalBlock.provider.attributes, function (attribute) {
                    return attribute.attributeType.display === 'otCalendarColor';
                });

                var hue = otCalendarColorAttribute ? otCalendarColorAttribute.value.toString() : "0";
                var backgroundColor = "hsl(" + hue + ", 100%, 90%)";
                var borderColor = "hsl(" + hue + ",100%, 60%)";
                return {
                    backgroundColor: backgroundColor,
                    borderColor: borderColor
                };
            };

            var getHeightForSurgicalBlock = function () {
                return Bahmni.Common.Util.DateUtil.diffInMinutes(
                        $scope.surgicalBlock.startDatetime, $scope.surgicalBlock.endDatetime) * surgicalBlockHeightPerMin;
            };

            var getTopForSurgicalBlock = function () {
                return Bahmni.Common.Util.DateUtil.diffInMinutes(
                        $scope.calendarStartDatetime, $scope.surgicalBlock.startDatetime) * surgicalBlockHeightPerMin;
            };

            var calculateEstimatedAppointmentDuration = function () {
                var surgicalAppointments = _.filter($scope.surgicalBlock.surgicalAppointments, function (surgicalAppointment) {
                    return $scope.isValidSurgicalAppointment(surgicalAppointment);
                });
                surgicalAppointments = _.sortBy(surgicalAppointments, ['sortWeight']);
                var nextAppointmentStartDatetime = moment($scope.surgicalBlock.startDatetime).toDate();
                $scope.surgicalBlock.surgicalAppointments = _.map(surgicalAppointments, function (surgicalAppointment) {
                    surgicalAppointment.derivedAttributes = {};
                    surgicalAppointment.derivedAttributes.duration = surgicalAppointmentHelper.getEstimatedDurationForAppointment(surgicalAppointment);
                    surgicalAppointment.derivedAttributes.expectedStartDatetime = nextAppointmentStartDatetime;
                    surgicalAppointment.derivedAttributes.expectedEndDatetime = Bahmni.Common.Util.DateUtil.addMinutes(nextAppointmentStartDatetime,
                        surgicalAppointment.derivedAttributes.duration);
                    nextAppointmentStartDatetime = surgicalAppointment.derivedAttributes.expectedEndDatetime;
                    return surgicalAppointment;
                });
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

            $scope.surgicalBlockExceedsCalendar = function () {
                return moment($scope.surgicalBlock.endDatetime).toDate() > $scope.calendarEndDatetime;
            };

            getViewPropertiesForSurgicalBlock();
            calculateEstimatedAppointmentDuration();
        };
        return {
            restrict: 'E',
            link: link,
            scope: {
                surgicalBlock: "=",
                calendarStartDatetime: "=",
                calendarEndDatetime: "=",
                dayViewSplit: "=",
                filterParams: "="
            },
            templateUrl: "../ot/views/calendarSurgicalBlock.html"
        };
    }]);
