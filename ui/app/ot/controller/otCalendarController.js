'use strict';

angular.module('bahmni.ot')
    .controller('otCalendarController', ['$scope', '$q', '$interval', 'spinner', 'locationService', 'surgicalAppointmentService', '$timeout',
        function ($scope, $q, $interval, spinner, locationService, surgicalAppointmentService, $timeout) {
            var updateCurrentDayTimeline = function () {
                $scope.currentTimeLineHeight = heightPerMin * Bahmni.Common.Util.DateUtil.diffInMinutes($scope.calendarStartDatetime, new Date());
            };
            var heightPerMin = 120 / $scope.dayViewSplit;
            var blocksStartDatetime = $scope.weekOrDay === 'day' ? $scope.viewDate : moment($scope.weekStartDate).startOf('day');
            var blocksEndDatetime = $scope.weekOrDay === 'day' ? moment($scope.viewDate).endOf('day') : Bahmni.Common.Util.DateUtil.getWeekEndDate($scope.weekStartDate);
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
                return $q.all([locationService.getAllByTag('Operation Theater'),
                    surgicalAppointmentService.getSurgicalBlocksInDateRange(blocksStartDatetime, blocksEndDatetime)]).then(function (response) {
                        $scope.locations = response[0].data.results;
                        $scope.weekDates = $scope.getAllWeekDates();
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
                        $scope.blockedOtsOfTheWeek = getBlockedOtsOfTheWeek();
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

            $scope.updateBlockedOtsOfTheDay = function (dayIndex) {
                $scope.blockedOtsOfTheDay = $scope.blockedOtsOfTheWeek[dayIndex];
            };

            var getWeekDate = function (index) {
                return moment($scope.weekStartDate).add(index, 'days').toDate();
            };

            $scope.getAllWeekDates = function () {
                if ($scope.weekStartDate != null) {
                    return iterateThroughWeek(getWeekDate);
                }
            };

            var getBlockedOtsOfTheWeek = function () {
                return iterateThroughWeek(numberOfOtsInDay);
            };

            var iterateThroughWeek = function (mapObject) {
                var arrayObject = [];
                for (var i = 0; i < 7; i++) {
                    arrayObject.push(mapObject(i));
                }
                return arrayObject;
            };

            var numberOfOtsInDay = function (dayIndex) {
                var otsOfWeek = [];
                if ($scope.weekOrDay === 'week') {
                    var blocksCount = $scope.surgicalBlocksByDate[dayIndex].length;
                    for (var i = 0; i < blocksCount; i++) {
                        if (!otsOfWeek.includes($scope.surgicalBlocksByDate[dayIndex][i].location.uuid)) {
                            otsOfWeek.push($scope.surgicalBlocksByDate[dayIndex][i].location.uuid);
                        }
                    }
                }
                return getOrderedOtsByLocation(otsOfWeek);
            };

            var getOrderedOtsByLocation = function (numberOfOts) {
                var orderedOts = [];
                if ($scope.locations != null) {
                    _.each($scope.locations, function (location) {
                        if (numberOfOts.includes(location.uuid)) {
                            orderedOts.push(location.uuid);
                        }
                    });
                }
                return orderedOts;
            };

            var timer = $interval(updateCurrentDayTimeline, 3000000);

            $scope.$on('$destroy', function () {
                $interval.cancel(timer);
            });

            $scope.$watch("viewDate", function (newValue, oldValue) {
                if ($scope.weekOrDay === 'day') {
                    if (oldValue.getTime() !== newValue.getTime()) {
                        blocksStartDatetime = $scope.viewDate;
                        blocksEndDatetime = moment(blocksStartDatetime).endOf('day');
                        $timeout(function () { spinner.forPromise(init(blocksStartDatetime, blocksEndDatetime)); }, 50);
                    } }
            });
            $scope.$watch("weekStartDate", function (newValue, oldValue) {
                if ($scope.weekOrDay === 'week') {
                    if (!Bahmni.Common.Util.DateUtil.isSameDate(moment(oldValue).toDate(), moment(newValue).toDate())) {
                        blocksStartDatetime = moment($scope.weekStartDate).toDate();
                        blocksEndDatetime = moment(Bahmni.Common.Util.DateUtil.getWeekEndDate($scope.weekStartDate)).endOf('day');
                        $timeout(function () { spinner.forPromise(init(blocksStartDatetime, blocksEndDatetime)); }, 50);
                    } }
            });
            spinner.forPromise(init(blocksStartDatetime, blocksEndDatetime));
        }]);
