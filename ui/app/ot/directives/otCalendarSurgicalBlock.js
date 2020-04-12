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
                    getCalendarStartDateTime($scope.surgicalBlock.startDatetime), $scope.surgicalBlock.startDatetime) * surgicalBlockHeightPerMin;
            };
            var getCalendarStartDateTime = function (date) {
                var dayStart = ($scope.dayViewStart || Bahmni.OT.Constants.defaultCalendarStartTime).split(':');
                return Bahmni.Common.Util.DateUtil.addMinutes(moment(date).startOf('day'), (dayStart[0] * 60 + parseInt(dayStart[1])));
            };

            var getCalendarEndDateTime = function (date) {
                var dayEnd = ($scope.dayViewEnd || Bahmni.OT.Constants.defaultCalendarEndTime).split(':');
                return Bahmni.Common.Util.DateUtil.addMinutes(moment(date).startOf('day'), (dayEnd[0] * 60 + parseInt(dayEnd[1])));
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

            $scope.surgicalBlockExceedsCalendar = function () {
                return moment($scope.surgicalBlock.endDatetime).toDate() > getCalendarEndDateTime($scope.surgicalBlock.endDatetime);
            };

            getViewPropertiesForSurgicalBlock();
            calculateEstimatedAppointmentDuration();
        };
        return {
            restrict: 'E',
            link: link,
            scope: {
                surgicalBlock: "=",
                dayViewSplit: "=",
                filterParams: "="
            },
            templateUrl: "../ot/views/calendarSurgicalBlock.html"
        };
    }]);
