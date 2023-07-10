'use strict';

angular.module('bahmni.ot')
    .controller('otCalendarController', ['$scope', '$rootScope', '$q', '$interval', '$state', 'spinner', 'locationService', 'surgicalAppointmentService', '$timeout', 'appService', 'surgicalAppointmentHelper',
        function ($scope, $rootScope, $q, $interval, $state, spinner, locationService, surgicalAppointmentService, $timeout, appService, surgicalAppointmentHelper) {
            var updateCurrentDayTimeline = function () {
                $scope.currentTimeLineHeight = heightPerMin * Bahmni.Common.Util.DateUtil.diffInMinutes($scope.calendarStartDatetime, new Date());
            };
            var updateBlocksStartDatetimeAndBlocksEndDatetime = function () {
                $scope.blocksStartDatetime = $scope.weekOrDay === 'day' ? $scope.viewDate : moment($scope.weekStartDate).startOf('day');
                $scope.blocksEndDatetime = $scope.weekOrDay === 'day' ? moment($scope.viewDate).endOf('day') : moment(Bahmni.Common.Util.DateUtil.getWeekEndDate($scope.weekStartDate)).endOf('day');
            };
            $scope.isModalVisible = false;
            $scope.notesStartDate = false;
            $scope.notesEndDate = false;
            $scope.isEdit = false;
            $scope.styleForBlock = function (index) {
                if (index === 6) {
                    return { 'border-right': '.5px solid lightgrey'};
                }
            };
            var setValidStartDate = function (viewDate) {
                const currentDate = new Date(viewDate);
                $scope.validStartDate = $scope.weekDates[0];
                while (currentDate > new Date($scope.weekDates[0])) {
                    const prev = new Date(currentDate);
                    currentDate.setDate(currentDate.getDate() - 1);
                    if ($scope.notesForWeek[currentDate.getDate()]) {
                        $scope.validStartDate = prev;
                        break;
                    }
                }
            };
            var setValidEndDate = function (viewDate) {
                const currentDate = new Date(viewDate);
                $scope.validEndDate = $scope.weekDates[6];
                while (currentDate < new Date($scope.weekDates[6])) {
                    const prev = new Date(currentDate);
                    currentDate.setDate(currentDate.getDate() + 1);
                    if ($scope.notesForWeek[currentDate.getDate()]) {
                        $scope.validEndDate = prev;
                        break;
                    }
                }
            };
            $scope.getNotesForDay = function (weekStartDate, index) {
                const date = new Date(weekStartDate);
                return $scope.notesForWeek[date.getDate() + index];
            };
            $scope.showNotesPopup = function (weekStartDate, addIndex) {
                const currentDate = new Date(weekStartDate);
                if (addIndex === undefined) {
                    addIndex = 0;
                }
                currentDate.setDate(currentDate.getDate() + addIndex);
                $scope.notesStartDate = currentDate;
                $scope.notesEndDate = currentDate;
                $scope.isModalVisible = true;
                $scope.isDayView = $state.weekOrDay === 'day';
                if (!$scope.isDayView) {
                    setValidStartDate(currentDate);
                    setValidEndDate(currentDate);
                }
            };
            $scope.showNotesPopupEdit = function (weekStartDate, addIndex, note) {
                const currentDate = new Date(weekStartDate);
                $scope.otNotesField = note;
                currentDate.setDate(currentDate.getDate() + addIndex);
                $scope.notesStartDate = currentDate;
                $scope.notesEndDate = currentDate;
                $scope.isModalVisible = true;
                $scope.isEdit = true;
            };
            $scope.closeNotes = function () {
                $scope.isModalVisible = false;
                $scope.startDateBeforeEndDateError = false;
                $scope.notesStartDate = undefined;
                $scope.notesEndDate = undefined;
                $scope.otNotesField = '';
                $scope.isEdit = false;
            };
            $scope.setNotesEndDate = function (date) {
                $scope.dateOutOfRangeError = date === undefined;
                $scope.startDateBeforeEndDateError = date < $scope.notesStartDate;
                $scope.notesEndDate = date;
            };

            $scope.setNotesStartDate = function (date) {
                $scope.dateOutOfRangeError = date === undefined;
                $scope.startDateBeforeEndDateError = date > $scope.notesEndDate;
                $scope.notesStartDate = date;
            };

            $scope.setNotes = function (notes) {
                $scope.otNotesField = notes;
                if (notes) {
                    $scope.emptyNoteError = false;
                }
            };
            $scope.saveNotes = function () {
                if ($scope.startDateBeforeEndDateError || $scope.dateOutOfRangeError) {
                    return;
                }
                if (!$scope.otNotesField) {
                    $scope.emptyNoteError = true;
                    return;
                }
                $state.go("otScheduling", {viewDate: $scope.viewDate}, {reload: true});
            };

            $scope.noteForTheDay = ''; // "Note";
            $scope.notesForWeek = {
                // 2: 'note for 2nd July',
                // 4: 'note for 3rd July'
            };

            var heightPerMin = 120 / $scope.dayViewSplit;
            var showToolTipForNotes = function () {
                $('.notes-text').tooltip({
                    content: function () {
                        var vm = (this);
                        return $(vm).prop('title');
                    },
                    track: true
                });
            };
            var init = function () {
                var dayStart = ($scope.dayViewStart || Bahmni.OT.Constants.defaultCalendarStartTime).split(':');
                var dayEnd = ($scope.dayViewEnd || Bahmni.OT.Constants.defaultCalendarEndTime).split(':');
                $scope.surgicalBlockSelected = {};
                $scope.surgicalAppointmentSelected = {};
                $scope.editDisabled = true;
                $scope.cancelDisabled = true;
                $scope.addActualTimeDisabled = true;
                $scope.otNotes = "";
                $scope.isModalVisible = false;
                $scope.dayViewSplit = parseInt($scope.dayViewSplit) > 0 ? parseInt($scope.dayViewSplit) : 60;
                $scope.calendarStartDatetime = Bahmni.Common.Util.DateUtil.addMinutes($scope.viewDate, (dayStart[0] * 60 + parseInt(dayStart[1])));
                $scope.calendarEndDatetime = Bahmni.Common.Util.DateUtil.addMinutes($scope.viewDate, (dayEnd[0] * 60 + parseInt(dayEnd[1])));
                updateCurrentDayTimeline();
                updateBlocksStartDatetimeAndBlocksEndDatetime();
                $scope.rows = $scope.getRowsForCalendar();
                return $q.all([locationService.getAllByTag('Operation Theater'),
                    surgicalAppointmentService.getSurgicalBlocksInDateRange($scope.blocksStartDatetime, $scope.blocksEndDatetime, false, true),
                    surgicalAppointmentService.getSurgeons()]).then(function (response) {
                        $scope.locations = response[0].data.results;
                        $scope.weekDates = $scope.getAllWeekDates();
                        var surgicalBlocksByLocation = _.map($scope.locations, function (location) {
                            return _.filter(response[1].data.results, function (surgicalBlock) {
                                return surgicalBlock.location.uuid === location.uuid;
                            });
                        });
                        var providerNames = appService.getAppDescriptor().getConfigValue("primarySurgeonsForOT");
                        $scope.surgeons = surgicalAppointmentHelper.filterProvidersByName(providerNames, response[2].data.results);
                        var surgicalBlocksBySurgeons = _.map($scope.surgeons, function (surgeon) {
                            return _.filter(response[1].data.results, function (surgicalBlock) {
                                return surgicalBlock.provider.uuid === surgeon.uuid;
                            });
                        });
                        $scope.surgicalBlocksByDate = _.map($scope.weekDates, function (weekDate) {
                            return _.filter(response[1].data.results, function (surgicalBlock) {
                                return $scope.isSurgicalBlockActiveOnGivenDate(surgicalBlock, weekDate);
                            });
                        });
                        $scope.blockedOtsOfTheWeek = getBlockedOtsOfTheWeek();
                        showToolTipForNotes();

                        var setOTView = function (providerToggle) {
                            $scope.providerToggle = providerToggle;
                            if (providerToggle) {
                                $scope.surgicalBlocks = surgicalBlocksBySurgeons;
                            } else {
                                $scope.surgicalBlocks = surgicalBlocksByLocation;
                            }
                        };
                        setOTView($rootScope.providerToggle);
                        $scope.$on("event:providerView", function (event, providerToggle) {
                            setOTView(providerToggle);
                        });
                    });
            };

            $scope.isSurgicalBlockActiveOnGivenDate = function (surgicalBlock, weekDate) {
                return Bahmni.Common.Util.DateUtil.isSameDate(moment(surgicalBlock.startDatetime).startOf('day').toDate(), weekDate)
                    || moment(surgicalBlock.endDatetime).toDate() > weekDate;
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
                    var weekDates = [];
                    for (var dayIndex = 0; dayIndex < 7; dayIndex++) {
                        weekDates.push(getWeekDate(dayIndex));
                    }
                    return weekDates;
                }
            };

            var getBlockedOtsOfTheWeek = function () {
                var blockedOtsOfWeeks = [];
                for (var dayIndex = 0; dayIndex < 7; dayIndex++) {
                    blockedOtsOfWeeks.push(getBlockedOtsOftheDay(dayIndex));
                }
                return blockedOtsOfWeeks;
            };

            var getBlockedOtsOftheDay = function (dayIndex) {
                var otsOfDay = [];
                if ($scope.weekOrDay === 'week') {
                    var blocksCount = $scope.surgicalBlocksByDate[dayIndex].length;
                    for (var blockIndex = 0; blockIndex < blocksCount; blockIndex++) {
                        if (!otsOfDay.includes($scope.surgicalBlocksByDate[dayIndex][blockIndex].location.uuid)) {
                            otsOfDay.push($scope.surgicalBlocksByDate[dayIndex][blockIndex].location.uuid);
                        }
                    }
                }
                return getOrderedOtsByLocation(otsOfDay);
            };

            var getOrderedOtsByLocation = function (otsOfDay) {
                var orderedOts = [];
                if ($scope.locations != null) {
                    orderedOts = _.map(_.filter($scope.locations, function (location) {
                        return otsOfDay.includes(location.uuid);
                    }), function (ot) {
                        return ot.uuid;
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
                    if (!Bahmni.Common.Util.DateUtil.isSameDate(oldValue, newValue)) {
                        spinner.forPromise(init());
                    }
                }
            });
            $scope.$watch("weekStartDate", function (newValue, oldValue) {
                if ($scope.weekOrDay === 'week') {
                    if (!Bahmni.Common.Util.DateUtil.isSameDate(moment(oldValue).toDate(), moment(newValue).toDate())) {
                        spinner.forPromise(init());
                    }
                }
            });
            spinner.forPromise(init());
        }]);
