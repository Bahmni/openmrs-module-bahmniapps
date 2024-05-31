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
            $scope.showDeletePopUp = false;
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
                    if ($scope.notesForWeek[currentDate]) {
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
                    if ($scope.notesForWeek[currentDate]) {
                        $scope.validEndDate = prev;
                        break;
                    }
                }
            };

            $scope.showNotesPopup = function (weekStartDate, addIndex) {
                const currentDate = new Date(weekStartDate);
                const isDayView = addIndex === undefined;
                if (isDayView) {
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
                $scope.hostData = {
                    notes: '',
                    noteId: '',
                    isDayView: isDayView,
                    weekStartDateTime: $scope.validStartDate,
                    weekEndDateTime: $scope.validEndDate,
                    noteDate: currentDate
                };
            };
            $scope.showNotesPopupEdit = function (weekStartDate, addIndex) {
                $scope.isModalVisible = true;
                const getNoteForTheDay = $scope.getNotesForWeek(weekStartDate, addIndex);
                $scope.hostData = {
                    notes: getNoteForTheDay[0].noteText,
                    noteId: getNoteForTheDay[0].noteId,
                    isDayView: $state.weekOrDay === 'day',
                    weekStartDateTime: $scope.validStartDate,
                    weekEndDateTime: $scope.validEndDate,
                    noteDate: new Date(getNoteForTheDay[0].noteDate),
                    providerUuid: $rootScope.currentProvider.uuid
                };
            };

            $scope.openDeletePopup = function (weekStartDate, index) {
                if (weekStartDate) {
                    $scope.currentDate = new Date(weekStartDate);
                    $scope.currentDate.setDate($scope.currentDate.getDate() + index);
                    $scope.hostData = {
                        noteId: $scope.getNotesForWeek(weekStartDate, index)[0].noteId
                    };
                } else {
                    $scope.hostData = {
                        noteId: $scope.noteId
                    };
                }
                $scope.showDeletePopUp = true;
            };

            $scope.hostApi = {
                onSuccess: function () {
                    $state.go("otScheduling", {viewDate: $scope.viewDate}, {reload: true});
                },
                onClose: function () {
                    $scope.$apply(function () {
                        $scope.showDeletePopUp = false;
                        $scope.isModalVisible = false;
                    });
                }
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
            const getNotes = function () {
                if ($scope.weekOrDay === 'day') {
                    return surgicalAppointmentService.getBulkNotes(new Date($scope.viewDate));
                } else if ($scope.weekOrDay === 'week') {
                    return surgicalAppointmentService.getBulkNotes($scope.weekStartDate, getWeekDate(7));
                }
            };
            var init = function () {
                var dayStart = ($scope.dayViewStart || Bahmni.OT.Constants.defaultCalendarStartTime).split(':');
                var dayEnd = ($scope.dayViewEnd || Bahmni.OT.Constants.defaultCalendarEndTime).split(':');
                $scope.surgicalBlockSelected = {};
                $scope.surgicalAppointmentSelected = {};
                $scope.editDisabled = true;
                $scope.cancelDisabled = true;
                $scope.addActualTimeDisabled = true;
                $scope.isModalVisible = false;
                $scope.showDeletePopUp = false;
                $scope.dayViewSplit = parseInt($scope.dayViewSplit) > 0 ? parseInt($scope.dayViewSplit) : 60;
                $scope.calendarStartDatetime = Bahmni.Common.Util.DateUtil.addMinutes($scope.viewDate, (dayStart[0] * 60 + parseInt(dayStart[1])));
                $scope.calendarEndDatetime = Bahmni.Common.Util.DateUtil.addMinutes($scope.viewDate, (dayEnd[0] * 60 + parseInt(dayEnd[1])));
                updateCurrentDayTimeline();
                updateBlocksStartDatetimeAndBlocksEndDatetime();
                $scope.rows = $scope.getRowsForCalendar();
                return $q.all([locationService.getAllByTag('Operation Theater'),
                    surgicalAppointmentService.getSurgicalBlocksInDateRange($scope.blocksStartDatetime, $scope.blocksEndDatetime, false, true),
                    surgicalAppointmentService.getSurgeons(),
                    getNotes()]).then(function (response) {
                        $scope.locations = response[0].data.results;
                        $scope.weekDates = $scope.getAllWeekDates();
                        var surgicalBlocksByLocation = _.map($scope.locations, function (location) {
                            return _.filter(response[1].data.results, function (surgicalBlock) {
                                return surgicalBlock.location.uuid === location.uuid;
                            });
                        });
                        if (response[3] && response[3].status === 200) {
                            $scope.noteForTheDay = response[3].data.length > 0 ? response[3].data[0].noteText : '';
                            $scope.noteId = response[3].data.length > 0 ? response[3].data[0].noteId : '';
                        } else {
                            $scope.noteForTheDay = '';
                            $scope.noteId = '';
                        }
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

                        $scope.getNotesForWeek = function (weekStartDate, index) {
                            const date = new Date(weekStartDate);
                            if (index === undefined) {
                                const notesForAWeek = {};
                                response[3].data.map(function (note) {
                                    notesForAWeek[new Date(note.noteDate)] = note;
                                });
                                return notesForAWeek;
                            }
                            return _.filter(response[3].data, function (note) {
                                const currentDate = new Date(date);
                                currentDate.setDate(date.getDate() + index);
                                return new Date(note.noteDate).getDate() === (currentDate).getDate();
                            });
                        };

                        if ($scope.weekOrDay === 'week') {
                            $scope.notesForWeek = $scope.getNotesForWeek();
                        }

                        $scope.getNotesForDay = function (weekStartDate, index) {
                            var notes = $scope.getNotesForWeek(weekStartDate, index);
                            return notes.length > 0 ? notes[0].noteText : '';
                        };

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
                return Bahmni.Common.Util.DateUtil.isSameDate(moment(surgicalBlock.startDatetime).startOf('day').toDate(), weekDate) ||
                    moment(surgicalBlock.endDatetime).toDate() > weekDate;
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
