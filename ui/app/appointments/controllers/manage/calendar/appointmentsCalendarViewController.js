'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsCalendarViewController', ['$scope', '$state', '$translate', 'spinner', 'appointmentsService', 'appointmentsFilter', '$rootScope', '$interval', 'appService',
        function ($scope, $state, $translate, spinner, appointmentsService, appointmentsFilter, $rootScope, $interval, appService) {
            var autoRefreshIntervalInSeconds = parseInt(appService.getAppDescriptor().getConfigValue('autoRefreshIntervalInSeconds'));
            var enableAutoRefresh = !isNaN(autoRefreshIntervalInSeconds);
            var autoRefreshStatus = true;
            const SECONDS_TO_MILLISECONDS_FACTOR = 1000;
            var init = function () {
                $scope.weekView = $rootScope.weekView || $state.params.weekView;
                $state.params.viewDate = $state.params.viewDate || moment().startOf('day').toDate();
                if ($scope.weekView) {
                    $state.params.viewDate = getViewDate($state.params.viewDate);
                }
                $scope.startDate = $state.params.viewDate;
                $scope.$on('filterClosedOpen', function (event, args) {
                    $scope.isFilterOpen = args.filterViewStatus;
                });
                $scope.isFilterOpen = $state.params.isFilterOpen;
                var weekStartDay = appService.getAppDescriptor().getConfigValue('startOfWeek')
                    || Bahmni.Appointments.Constants.defaultWeekStartDayName;
                $scope.weekStart = Bahmni.Appointments.Constants.weekDays[weekStartDay];
            };

            var createProviderEventForAppointment = function (provider, appointment, eventList) {
                var event = {};
                event.resourceId = provider ? provider.name : $translate.instant("NO_PROVIDER_COLUMN_KEY");
                event.start = appointment.startDateTime;
                event.end = appointment.endDateTime;
                event.color = appointment.service.color;
                event.serviceName = appointment.service.name;
                var existingEvent = _.find(eventList, event);
                var patientName = appointment.patient.name + " (" + appointment.patient.identifier + ")";
                var isBedAssigned = appointment.additionalInfo && appointment.additionalInfo.BED_NUMBER_KEY;
                if (existingEvent) {
                    existingEvent.title = [existingEvent.title, patientName].join(', ');
                    existingEvent.className = 'appointmentIcons multiplePatients' + (isBedAssigned ? ' bed-accom' : '');
                    existingEvent.appointments.push(appointment);
                } else {
                    event.title = patientName;
                    event.className = 'appointmentIcons ' + appointment.status + (isBedAssigned ? ' bed-accom' : '');
                    event.appointments = [];
                    event.appointments.push(appointment);
                    eventList.push(event);
                }
            };

            $scope.toggleWeekView = function () {
                $scope.weekView = !$scope.weekView;
                $rootScope.weekView = $scope.weekView;
                $state.params.weekView = $scope.weekView;
                fetchAppointmentsData();
            };

            $scope.getAppointmentsForDate = function (viewDate) {
                if ($scope.weekView) {
                    return;
                }
                $state.params.viewDate = viewDate;
                $scope.shouldReload = false;
                var params = {forDate: viewDate};
                $scope.$on('$stateChangeStart', function (event, toState, toParams) {
                    if (toState.tabName == 'list' && !$scope.weekView) {
                        toParams.doFetchAppointmentsData = false;
                    }
                });
                if ($state.params.doFetchAppointmentsData) {
                    return spinner.forPromise(setAppointments(params));
                } else {
                    var filteredAppointments = appointmentsFilter($state.params.appointmentsData, $state.params.filterParams);
                    $state.params.doFetchAppointmentsData = true;
                    return parseAppointments(filteredAppointments, $state.params.filterParams);
                }
            };

            $scope.getAppointmentsForWeek = function (startDate, endDate) {
                if (!$scope.weekView) {
                    return;
                }
                $state.params.viewDate = $scope.startDate;
                $scope.shouldReload = false;
                var data = {startDate: startDate, endDate: endDate};
                $state.params.doFetchAppointmentsData = true;
                return spinner.forPromise(setAppointments(data));
            };

            $scope.$watch(function () {
                return $state.params.filterParams;
            }, function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    var filteredAppointments = appointmentsFilter($scope.allAppointmentsForDay || $state.params.appointmentsData, $state.params.filterParams);
                    if (filteredAppointments) {
                        parseAppointments(filteredAppointments, $state.params.filterParams);
                    }
                }
            }, true);

            $scope.hasNoAppointments = function () {
                return _.isEmpty($scope.providerAppointments) || _.isEmpty($scope.providerAppointments.events);
            };

            var fetchAppointmentsData = function () {
                var viewDate = $scope.startDate || moment().startOf('day').toDate();
                if ($scope.weekView) {
                    var weekStartDate = getWeekStartDate(viewDate);
                    var weekEndDate = getWeekEndDate(weekStartDate);
                    $scope.getAppointmentsForWeek(weekStartDate, weekEndDate);
                }
                else {
                    $scope.getAppointmentsForDate(viewDate);
                }
            };

            var getWeekStartDate = function (date) {
                var daysToBeSubtracted = daysToSubtract(date, $scope.weekStart);
                return moment(date).subtract(daysToBeSubtracted, 'days').toDate();
            };

            var getWeekEndDate = function (date) {
                return moment(date).add(6, 'days').toDate();
            };

            var getViewDate = function (date) {
                var weekStartDate = getWeekStartDate(date);
                var weekEndDate = getWeekEndDate(weekStartDate);
                var isoWeekdayForToday = moment().isoWeekday();
                var weekStart = $scope.weekStart;
                var daysBetweenTodayAndWeekStart = weekStart - isoWeekdayForToday;
                if (daysBetweenTodayAndWeekStart > 0) {
                    var daysToSubtract = daysBetweenTodayAndWeekStart - 1;
                    return moment(weekEndDate).subtract(daysToSubtract, 'days').toDate();
                }
                else {
                    var daysToAdd = Math.abs(daysBetweenTodayAndWeekStart);
                    return moment(weekStartDate).add(daysToAdd, 'days').toDate();
                }
            };

            var parseAppointments = function (allAppointments, filterParams) {
                if (allAppointments) {
                    var appointments = allAppointments.filter(function (appointment) {
                        return appointment.status !== 'Cancelled';
                    });

                    var resources = _.chain(appointments)
                        .filter(function (appointment) {
                            return !_.isEmpty(appointment.providers);
                        }).map(function (appointment) {
                            return appointment.providers.filter(function (p) {
                                return p.response !== Bahmni.Appointments.Constants.providerResponses.CANCELLED;
                            });
                            // return appointment.provider;
                        }).reduce(function (list, p) {
                            if (p != undefined) {
                                return list.concat(p.filter(function (pi) {
                                    if (filterParams && !_.isEmpty(filterParams.providerUuids)) {
                                        return filterParams.providerUuids.find(function (uuid) { return uuid === pi.uuid; });
                                    } else {
                                        return true;
                                    }
                                }));
                            } else {
                                return list;
                            }
                        }, []).uniqBy('name')
                        .map(function (provider) {
                            return {id: provider.name, title: provider.name, provider: provider};
                        }).sortBy(function (provider) {
                            return provider.id && provider.id.toLowerCase();
                        })
                        .value();

                    var hasAppointmentsWithNoProvidersSpecified = _.find(appointments, function (appointment) {
                        return _.every(appointment.providers, {"response": Bahmni.Appointments.Constants.providerResponses.CANCELLED }) || _.isEmpty(appointment.providers);
                    });

                    if (hasAppointmentsWithNoProvidersSpecified) {
                        resources.push({
                            id: $translate.instant("NO_PROVIDER_COLUMN_KEY"),
                            title: $translate.instant("NO_PROVIDER_COLUMN_KEY"),
                            provider: {name: $translate.instant("NO_PROVIDER_COLUMN_KEY"), display: $translate.instant("NO_PROVIDER_COLUMN_KEY"), uuid: 'no-provider-uuid'}
                        });
                    }

                    var events = appointments.reduce(function (result, appointment) {
                        var appProviderList = appointment.providers && !_.isEmpty(appointment.providers) ?
                            appointment.providers.filter(function (ap) { return ap.response != Bahmni.Appointments.Constants.providerResponses.CANCELLED; }) : [];

                        appProviderList.forEach(function (ap) {
                            if (filterParams && !_.isEmpty(filterParams.providerUuids)) {
                                filterParams.providerUuids.find(function (uuid) { return uuid === ap.uuid; }) && createProviderEventForAppointment(ap, appointment, result);
                            } else {
                                createProviderEventForAppointment(ap, appointment, result);
                            }
                        });

                        if (appProviderList.length == 0) {
                            createProviderEventForAppointment(null, appointment, result);
                        }
                        return result;
                    }, []);

                    $scope.providerAppointments = {resources: resources, events: events};
                    $scope.shouldReload = true;
                }
            };

            var daysToSubtract = function (date, weekStart) {
                return moment(date).isoWeekday() >= weekStart ?
                    moment(date).isoWeekday() - weekStart :
                    7 + moment(date).isoWeekday() - weekStart;
            };

            var setAppointments = function (params) {
                autoRefreshStatus = false;
                if (!$scope.weekView) {
                    return appointmentsService.getAllAppointments(params).then(resolveAppointmentsData);
                }
                return appointmentsService.searchAppointments(params).then(resolveAppointmentsData);
            };

            var resolveAppointmentsData = function (response) {
                $scope.allAppointmentsForDay = response.data;
                var filteredAppointments = appointmentsFilter($scope.allAppointmentsForDay, $state.params.filterParams);
                $rootScope.appointmentsData = filteredAppointments;
                autoRefreshStatus = true;
                return parseAppointments(filteredAppointments, $state.params.filterParams);
            };

            var setAppointmentsInAutoRefresh = function () {
                if (!autoRefreshStatus) {
                    return;
                }
                var viewDate = $scope.startDate || moment().startOf('day').toDate();
                var params = {forDate: viewDate};
                if ($scope.weekView) {
                    var weekStartDate = getWeekStartDate(viewDate);
                    var weekEndDate = getWeekEndDate(weekStartDate);
                    params = {startDate: weekStartDate, endDate: weekEndDate};
                }
                setAppointments(params);
            };

            var autoRefresh = (function () {
                if (!enableAutoRefresh) {
                    return;
                }
                var autoRefreshIntervalInMilliSeconds = autoRefreshIntervalInSeconds * SECONDS_TO_MILLISECONDS_FACTOR;
                return $interval(setAppointmentsInAutoRefresh, autoRefreshIntervalInMilliSeconds);
            })();

            $scope.$on('$destroy', function () {
                if (enableAutoRefresh) {
                    $interval.cancel(autoRefresh);
                }
            });

            return init();
        }]);
