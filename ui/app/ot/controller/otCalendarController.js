'use strict';

angular.module('bahmni.ot')
    .controller('otCalendarController', ['$scope', '$q', '$interval', 'spinner', 'locationService', 'surgicalAppointmentService',
        function ($scope, $q, $interval, spinner, locationService, surgicalAppointmentService) {
            var updateCurrentDayTimeline = function () {
                $scope.currentTimeLineHeight = heightPerMin * Bahmni.Common.Util.DateUtil.diffInMinutes($scope.calendarStartDatetime, new Date());
            };
            var heightPerMin = 120 / $scope.dayViewSplit;
            var blocksStartDatetime = $scope.viewDate;
            var blocksEndDatetime = moment($scope.viewDate).endOf('day');
            var init = function (blocksStartDatetime, blocksEndDatetime) {
                var dayStart = ($scope.dayViewStart || Bahmni.OT.Constants.defaultCalendarStartTime).split(':');
                var dayEnd = ($scope.dayViewEnd || Bahmni.OT.Constants.defaultCalendarEndTime).split(':');
                $scope.surgicalBlockSelected = {};
                $scope.surgicalAppointmentSelected = {};
                $scope.editDisabled = true;
                $scope.cancelDisabled = true;
                $scope.addActualTimeDisabled = true;
                $scope.dayViewSplit = parseInt($scope.dayViewSplit) > 0 ? parseInt($scope.dayViewSplit) : 60;
                $scope.calendarStartDatetime = Bahmni.Common.Util.DateUtil.addMinutes($scope.viewDate, (dayStart[0] * 60 + parseInt(dayStart[1])));
                $scope.calendarEndDatetime = Bahmni.Common.Util.DateUtil.addMinutes($scope.viewDate, (dayEnd[0] * 60 + parseInt(dayEnd[1])));
                updateCurrentDayTimeline();
                $scope.rows = $scope.getRowsForCalendar();
                blocksStartDatetime = $scope.weekOrDay === 'day' ? $scope.viewDate : moment($scope.weekStartDate).startOf('day');
                blocksEndDatetime = $scope.weekOrDay === 'day' ? moment($scope.viewDate).endOf('day') : Bahmni.Common.Util.DateUtil.getWeekEndDate($scope.weekStartDate);``
                return $q.all([locationService.getAllByTag('Operation Theater'),
                    surgicalAppointmentService.getSurgicalBlocksInDateRange(blocksStartDatetime, blocksEndDatetime)]).then(function (response) {
                        $scope.locations = response[0].data.results;

                        $scope.surgicalBlocksByLocation = _.map($scope.locations, function (location) {
                            return _.filter(response[1].data.results, function (surgicalBlock) {
                                return surgicalBlock.location.uuid === location.uuid;
                            });
                        });
                    $scope.surgicalBlocksByDate = _.map($scope.weekDates, function (weekDate) {
                        return _.filter(response[1].data.results, function (surgicalBlock) {
                            return Bahmni.Common.Util.DateUtil.isSameDate(moment(surgicalBlock.startDatetime).startOf('day').toDate(), weekDate);
                        });
                    });
                    });
            };

            $scope.intervals = function () {
                var dayStart = ($scope.dayViewStart || '00:00').split(':');
                var dayEnd = ($scope.dayViewEnd || '23:59').split(':');
                var noOfIntervals = ((dayEnd[0] * 60 + parseInt(dayEnd[1])) - (dayStart[0] * 60 + parseInt(dayStart[1]))) / $scope.dayViewSplit;
                return Math.ceil(noOfIntervals);
            };

            $scope.getRowsForCalendar = function () {
                var rows = [];
                for (var i = 0; i < $scope.intervals(); i++) {
                    var row = {
                        date: Bahmni.Common.Util.DateUtil.addMinutes($scope.calendarStartDatetime, i * ($scope.dayViewSplit))
                    };
                    rows.push(row);
                }
                return rows;
            };

            $scope.shouldDisplayCurrentTimeLine = function () {
                return moment().isBefore($scope.calendarEndDatetime) && moment().isAfter($scope.calendarStartDatetime);
            };

            var timer = $interval(updateCurrentDayTimeline, 3000000);

            $scope.$on('$destroy', function () {
                $interval.cancel(timer);
            });

            $scope.$watch("viewDate", function (newValue, oldValue) {
                if (oldValue.getTime() !== newValue.getTime()) {
                    blocksStartDatetime = $scope.viewDate;
                    blocksEndDatetime = moment(blocksStartDatetime).endOf('day');
                    spinner.forPromise(init(blocksStartDatetime, blocksEndDatetime));
                }
            });
            $scope.$watch("weekStartDate", function (newValue, oldValue) {
                if (moment(oldValue).toDate() !== moment(newValue).toDate()) {
                    blocksStartDatetime = moment($scope.weekStartDate).toDate();
                    blocksEndDatetime = moment(Bahmni.Common.Util.DateUtil.getWeekEndDate($scope.weekStartDate)).endOf('day');
                    spinner.forPromise(init(blocksStartDatetime, blocksEndDatetime));
                }
            });

            $scope.$watch("weekOrDay", function (newValue, oldValue) {
                if (oldValue !== newValue) {
                    if (newValue === 'week') {
                        blocksStartDatetime = moment($scope.weekStartDate).toDate();
                        blocksEndDatetime = moment(Bahmni.Common.Util.DateUtil.getWeekEndDate($scope.weekStartDate)).endOf('day');
                    }
                    if (newValue === "day") {
                        blocksStartDatetime = $scope.viewDate;
                        blocksEndDatetime = moment(blocksStartDatetime).endOf('day');
                    }
                    spinner.forPromise(init(blocksStartDatetime, blocksEndDatetime));
                }
            });
            spinner.forPromise(init(blocksStartDatetime, blocksEndDatetime));
        }]);
