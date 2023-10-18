'use strict';

angular.module('bahmni.ot')
    .directive('otCalendarSurgicalBlock', ['surgicalAppointmentHelper', function (surgicalAppointmentHelper) {
        var link = function ($scope) {
            var totalWidthInPercentile = 96;
            var gridCellHeight = 120;
            var heightForSurgeonName = 21;
            var surgicalBlockHeightPerMin = gridCellHeight / $scope.dayViewSplit;
            $scope.operationTheatre = $scope.surgicalBlock.location.name;

            var getViewPropertiesForSurgicalBlock = function () {
                var surgicalBlockHeight = getHeightForSurgicalBlock();
                $scope.blockDimensions = {
                    height: surgicalBlockHeight,
                    width: $scope.weekOrDay === 'week' ? getWidthForSurgicalBlock() : totalWidthInPercentile,
                    top: getTopForSurgicalBlock(),
                    left: $scope.weekOrDay === 'week' ? getLeftPositionForSurgicalBlock() : 0,
                    color: getColorForProvider(),
                    appointmentHeightPerMin: (surgicalBlockHeight - heightForSurgeonName) / Bahmni.Common.Util.DateUtil.diffInMinutes(
                        getSurgicalBlockStartDateTimeBasedOnCalendarStartDateTime(), getSurgicalBlockEndDateTimeBasedOnCalendarEndDateTime())
                };
            };

            var getColorForProvider = function () {
                var otCalendarColorAttribute = _.find($scope.surgicalBlock.provider.attributes, function (attribute) {
                    return attribute.attributeType.display === 'otCalendarColor';
                });

                var hue = otCalendarColorAttribute && otCalendarColorAttribute.value ? otCalendarColorAttribute.value.toString() : "0";
                var backgroundColor = "hsl(" + hue + ", 100%, 90%)";
                var borderColor = "hsl(" + hue + ",100%, 60%)";
                return {
                    backgroundColor: backgroundColor,
                    borderColor: borderColor
                };
            };
            var getWidthForSurgicalBlock = function () {
                if ($scope.blockedOtsOfTheDay != null) {
                    return totalWidthInPercentile / $scope.blockedOtsOfTheDay.length;
                }
            };

            var getLeftPositionForSurgicalBlock = function () {
                var index = 1;
                if ($scope.blockedOtsOfTheDay != null) {
                    index = $scope.blockedOtsOfTheDay.indexOf(($scope.surgicalBlock.location.uuid));
                }
                return (index * getWidthForSurgicalBlock()) + 1;
            };
            var getHeightForSurgicalBlock = function () {
                return Bahmni.Common.Util.DateUtil.diffInMinutes(
                    getSurgicalBlockStartDateTimeBasedOnCalendarStartDateTime(), getSurgicalBlockEndDateTimeBasedOnCalendarEndDateTime()) * surgicalBlockHeightPerMin;
            };

            var getTopForSurgicalBlock = function () {
                var top = Bahmni.Common.Util.DateUtil.diffInMinutes(
                    getCalendarStartDateTime($scope.viewDate), $scope.surgicalBlock.startDatetime) * surgicalBlockHeightPerMin;
                return top > 0 ? top : 0;
            };
            var getCalendarStartDateTime = function (date) {
                var dayStart = ($scope.dayViewStart || Bahmni.OT.Constants.defaultCalendarStartTime).split(':');
                return Bahmni.Common.Util.DateUtil.addMinutes(moment(date).startOf('day'), (dayStart[0] * 60 + parseInt(dayStart[1])));
            };

            var getCalendarEndDateTime = function (date) {
                var dayEnd = ($scope.dayViewEnd || Bahmni.OT.Constants.defaultCalendarEndTime).split(':');
                return Bahmni.Common.Util.DateUtil.addMinutes(moment(date).startOf('day'), (dayEnd[0] * 60 + parseInt(dayEnd[1])));
            };

            var getSurgicalBlockStartDateTimeBasedOnCalendarStartDateTime = function () {
                return moment($scope.surgicalBlock.startDatetime).toDate() < getCalendarStartDateTime($scope.viewDate)
                    ? getCalendarStartDateTime($scope.viewDate) : $scope.surgicalBlock.startDatetime;
            };

            var getSurgicalBlockEndDateTimeBasedOnCalendarEndDateTime = function () {
                return getCalendarEndDateTime($scope.viewDate) < moment($scope.surgicalBlock.endDatetime).toDate()
                    ? getCalendarEndDateTime($scope.viewDate) : $scope.surgicalBlock.endDatetime;
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
                    surgicalAppointment.derivedAttributes.height = Bahmni.Common.Util.DateUtil.diffInMinutes(
                        surgicalAppointment.derivedAttributes.expectedStartDatetime < getCalendarStartDateTime($scope.viewDate)
                            ? getCalendarStartDateTime($scope.viewDate) : surgicalAppointment.derivedAttributes.expectedStartDatetime,
                        getCalendarEndDateTime($scope.viewDate) < surgicalAppointment.derivedAttributes.expectedEndDatetime
                            ? getCalendarEndDateTime($scope.viewDate) : surgicalAppointment.derivedAttributes.expectedEndDatetime
                    );
                    surgicalAppointment.primaryDiagnosis = new Bahmni.OT.SurgicalBlockMapper().mapPrimaryDiagnoses(surgicalAppointment.patientObservations);

                    nextAppointmentStartDatetime = surgicalAppointment.derivedAttributes.expectedEndDatetime;
                    return surgicalAppointment;
                });
            };

            $scope.isValidSurgicalAppointment = function (surgicalAppointment) {
                return surgicalAppointment.status !== Bahmni.OT.Constants.cancelled && surgicalAppointment.status !== Bahmni.OT.Constants.postponed;
            };

            $scope.canShowInCalendarView = function (surgicalAppointment) {
                return $scope.isValidSurgicalAppointment(surgicalAppointment)
                    && surgicalAppointment.derivedAttributes.expectedStartDatetime < getCalendarEndDateTime($scope.viewDate)
                    && surgicalAppointment.derivedAttributes.expectedEndDatetime > getCalendarStartDateTime($scope.viewDate);
            };

            $scope.selectSurgicalBlock = function ($event) {
                $scope.$emit("event:surgicalBlockSelect", $scope.surgicalBlock);
                $event.stopPropagation();
            };

            $scope.surgicalBlockExceedsCalendar = function () {
                return moment($scope.surgicalBlock.endDatetime).toDate() > getCalendarEndDateTime($scope.surgicalBlock.endDatetime);
            };

            var showToolTipForSurgicalBlock = function () {
                $('.surgical-block').tooltip({
                    content: function () {
                        return $(this).prop('title');
                    },
                    track: true
                });
            };

            getViewPropertiesForSurgicalBlock();
            calculateEstimatedAppointmentDuration();
            showToolTipForSurgicalBlock();
        };
        return {
            restrict: 'E',
            link: link,
            scope: {
                surgicalBlock: "=",
                blockedOtsOfTheDay: "=",
                dayViewStart: "=",
                dayViewEnd: "=",
                dayViewSplit: "=",
                filterParams: "=",
                weekOrDay: "=",
                viewDate: "="
            },
            templateUrl: "../ot/views/calendarSurgicalBlock.html"
        };
    }]);
