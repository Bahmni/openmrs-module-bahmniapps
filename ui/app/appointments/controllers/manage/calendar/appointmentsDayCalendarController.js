'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsDayCalendarController', ['$scope', 'uiCalendarConfig',
        function ($scope, uiCalendarConfig) {
            var init = function () {
                $scope.changeTo = 'Hungarian';

                /* event source that contains custom events on the scope */
                $scope.events = $scope.appointments.events;

                /* alert on eventClick */
                $scope.alertOnEventClick = function (date, jsEvent, view) {
                    $scope.alertMessage = (date.title + ' for ' + date.resourceId + ' was clicked ');
                    alert($scope.alertMessage);
                };
                /* alert on Drop */
                $scope.alertOnDrop = function (event, delta, revertFunc, jsEvent, ui, view) {
                    $scope.alertMessage = ('Event Dropped to make dayDelta ' + delta);
                };
                /* alert on Resize */
                $scope.alertOnResize = function (event, delta, revertFunc, jsEvent, ui, view) {
                    $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
                };
                /* add and removes an event source of choice */
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

                /* remove event */
                $scope.remove = function (index) {
                    $scope.events.splice(index, 1);
                };
                /* Change View */
                $scope.changeView = function (view, calendar) {
                    uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
                };

                $scope.createAppointment = function (start, end, jsEvent, view, resource) {
                    alert("startTime is " + start + " endTime is " + end + ' for ' + resource.title);
                };

                /* config object */
                $scope.uiConfig = {
                    calendar: {
                        height: 700,
                        editable: true,
                        defaultView: 'agendaDay',
                        header: false,
                        resources: $scope.appointments.resources,
                        businessHours: {
                            // days of week. an array of zero-based day of week integers (0=Sunday)
                            dow: [1, 2, 3, 4, 5, 6], // Monday - Thursday

                            start: '7:00', // a start time (10am in this example)
                            end: '18:00' // an end time (6pm in this example)
                        },
                        groupByResource: true,
                        selectable: true,
                        select: $scope.createAppointment,
                        slotDuration: '00:10:00',
                        eventLimit: true,
                        allDaySlot: false,
                        eventClick: $scope.alertOnEventClick,
                        eventDrop: $scope.alertOnDrop,
                        eventResize: $scope.alertOnResize,
                        eventRender: $scope.eventRender,
                        schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source'
                    }
                };

                $scope.changeLang = function () {
                    if ($scope.changeTo === 'Hungarian') {
                        $scope.uiConfig.calendar.dayNames = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
                        $scope.uiConfig.calendar.dayNamesShort = ["Vas", "Hét", "Kedd", "Sze", "Csüt", "Pén", "Szo"];
                        $scope.changeTo = 'English';
                    } else {
                        $scope.uiConfig.calendar.dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                        $scope.uiConfig.calendar.dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                        $scope.changeTo = 'Hungarian';
                    }
                };
                /* event sources array */
                $scope.eventSources = [$scope.events, {}, {}];
            };
            return init();
        }]);
