'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsDayCalendarController', ['$scope', 'uiCalendarConfig', 'appService',
        function ($scope, uiCalendarConfig, appService) {
            var init = function () {
                $scope.events = $scope.appointments.events;

                $scope.alertOnEventClick = function (date, jsEvent, view) {
                    $scope.alertMessage = (date.title + ' for ' + date.resourceId + ' was clicked ');
                    alert($scope.alertMessage);
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
                    alert("startTime is " + start + " endTime is " + end + ' for ' + resource.title);
                };

                $scope.uiConfig = {
                    calendar: {
                        height: 700,
                        editable: true,
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
                        selectable: true,
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
            return init();
        }]);
