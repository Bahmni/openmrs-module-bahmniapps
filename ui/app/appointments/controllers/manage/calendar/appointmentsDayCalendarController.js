'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsDayCalendarController', ['$scope', '$state', 'uiCalendarConfig', 'appService', 'calendarViewPopUp',
        function ($scope, $state, uiCalendarConfig, appService, calendarViewPopUp) {
            $scope.eventSources = [];
            var init = function () {
                $scope.events = $scope.appointments.events;

                $scope.alertOnEventClick = function (event, jsEvent, view) {
                    var createAppointment = function (closeDialog) {
                        closeDialog();
                        $state.go('home.manage.appointments.calendar.new', {appointment: {startDateTime: event.start, endDateTime: event.end, provider: event.appointments[0].provider}});
                    };

                    var editAppointment = function (closeDialog, appointment) {
                        closeDialog();
                        $state.go('home.manage.appointments.calendar.edit', {appointment: appointment, uuid: appointment.uuid});
                    };

                    calendarViewPopUp({
                        scope: { appointments: event.appointments, editAppointment: editAppointment, createAppointment: isSelectable() ? createAppointment : undefined },
                        className: "ngdialog-theme-default delete-program-popup app-dialog-container"
                    });
                };

                $scope.alertOnDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
                    $scope.alertMessage = ('Event Dropped to make dayDelta ' + delta);
                };

                $scope.alertOnResize = function (event, delta, revertFunc, jsEvent, ui, view) {
                    $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
                };

                $scope.addRemoveEventSource = function (sources, source) {
                    var canAdd = 0;
                    angular.forEach(sources, function (value, key) {
                        if (sources[key] === source) {
                            sources.splice(key, 1);
                            canAdd = 1;
                        }
                    });
                    if (canAdd === 0) {
                        sources.push(source);
                    }
                };

                $scope.remove = function (index) {
                    $scope.events.splice(index, 1);
                };

                $scope.changeView = function (view, calendar) {
                    uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
                };

                $scope.createAppointment = function (start, end, jsEvent, view, resource) {
                    $state.go('home.manage.appointments.calendar.new', {appointment: {startDateTime: start, endDateTime: end, provider: resource.provider}});
                };

                var isSelectable = function () {
                    return !(Bahmni.Common.Util.DateUtil.isBeforeDate($scope.date, moment().startOf('day')));
                };

                $scope.uiConfig = {
                    calendar: {
                        height: document.getElementsByClassName('app-calendar-container')[0].clientHeight,
                        editable: false,
                        defaultDate: $scope.date,
                        header: false,
                        timezone: 'local',
                        defaultView: 'agendaDay',
                        resources: $scope.appointments.resources,
                        businessHours: {
                            start: appService.getAppDescriptor().getConfigValue('startOfDay') || Bahmni.Appointments.Constants.defaultCalendarStartTime,
                            end: appService.getAppDescriptor().getConfigValue('endOfDay') || Bahmni.Appointments.Constants.defaultCalendarEndTime
                        },
                        scrollTime: appService.getAppDescriptor().getConfigValue('startOfDay') || Bahmni.Appointments.Constants.defaultCalendarStartTime,
                        groupByResource: true,
                        selectable: isSelectable(),
                        select: $scope.createAppointment,
                        slotLabelInterval: appService.getAppDescriptor().getConfigValue('calendarSlotLabelInterval') || Bahmni.Appointments.Constants.defaultCalendarSlotLabelInterval,
                        slotDuration: appService.getAppDescriptor().getConfigValue('calendarSlotDuration') || Bahmni.Appointments.Constants.defaultCalendarSlotDuration,
                        eventLimit: true,
                        allDaySlot: false,
                        allDayDefault: false,
                        eventClick: $scope.alertOnEventClick,
                        eventDrop: $scope.alertOnDrop,
                        eventResize: $scope.alertOnResize,
                        eventRender: $scope.eventRender,
                        schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source'
                    }
                };

                $scope.eventSources = [$scope.events];
            };

            var resetEvents = function () {
                if (!_.isEmpty($scope.eventSources)) {
                    $scope.eventSources.splice(0, $scope.eventSources.length);
                }
                if (!_.isEmpty($scope.appointments.events)) {
                    $scope.eventSources.push($scope.appointments.events);
                }
                $scope.uiConfig.calendar.resources = $scope.appointments.resources;
            };

            $scope.$watch("appointments", function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    resetEvents();
                }
            });
            init();
        }]);
