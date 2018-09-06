'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsCalendarViewController', ['$scope', '$state', '$translate', 'spinner', 'appointmentsService', 'appointmentsFilter', '$rootScope',
        function ($scope, $state, $translate, spinner, appointmentsService, appointmentsFilter, $rootScope) {
            var init = function () {
                $scope.startDate = $state.params.viewDate || moment().startOf('day').toDate();
                $scope.$on('filterClosedOpen', function (event, args) {
                    $scope.isFilterOpen = args.filterViewStatus;
                });
                $scope.isFilterOpen = $state.params.isFilterOpen;
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

            var parseAppointments = function (allAppointments, filterParams) {
                if (allAppointments) {
                    var appointments = allAppointments.filter(function (appointment) {
                        return appointment.status !== 'Cancelled';
                    });

                    var resources = _.chain(appointments)
                        .filter(function (appointment) {
                            return !_.isEmpty(appointment.providers);
                        }).map(function (appointment) {
                            return appointment.providers;
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
                        return _.isEmpty(appointment.providers);
                    });

                    if (hasAppointmentsWithNoProvidersSpecified) {
                        resources.push({
                            id: $translate.instant("NO_PROVIDER_COLUMN_KEY"),
                            title: $translate.instant("NO_PROVIDER_COLUMN_KEY"),
                            provider: {name: $translate.instant("NO_PROVIDER_COLUMN_KEY"), display: $translate.instant("NO_PROVIDER_COLUMN_KEY"), uuid: 'no-provider-uuid'}
                        });
                    }

                    var events = appointments.reduce(function (result, appointment) {
                        if (appointment.providers && !_.isEmpty(appointment.providers)) {
                            if (filterParams && !_.isEmpty(filterParams.providerUuids)) {
                                appointment.providers.forEach(function (ap) {
                                    filterParams.providerUuids.find(function (uuid) { return uuid === ap.uuid; }) && createProviderEventForAppointment(ap, appointment, result);
                                });
                            } else {
                                appointment.providers.forEach(function (ap) {
                                    createProviderEventForAppointment(ap, appointment, result);
                                });
                            }
                        } else {
                            createProviderEventForAppointment(null, appointment, result);
                        }
                        return result;
                    }, []);

                    $scope.providerAppointments = {resources: resources, events: events};
                    $scope.shouldReload = true;
                }
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

            $scope.getAppointmentsForDate = function (viewDate) {
                $state.params.viewDate = viewDate;
                $scope.shouldReload = false;
                var params = {forDate: viewDate};
                $scope.$on('$stateChangeStart', function (event, toState, toParams) {
                    if (toState.tabName == 'list') {
                        toParams.doFetchAppointmentsData = false;
                    }
                });
                if ($state.params.doFetchAppointmentsData) {
                    return spinner.forPromise(appointmentsService.getAllAppointments(params).then(function (response) {
                        $scope.allAppointmentsForDay = response.data;
                        var filteredAppointments = appointmentsFilter($scope.allAppointmentsForDay, $state.params.filterParams);
                        $rootScope.appointmentsData = filteredAppointments;
                        return parseAppointments(filteredAppointments, $state.params.filterParams);
                    }));
                } else {
                    var filteredAppointments = appointmentsFilter($state.params.appointmentsData, $state.params.filterParams);
                    $state.params.doFetchAppointmentsData = true;
                    return parseAppointments(filteredAppointments, $state.params.filterParams);
                }
            };

            $scope.hasNoAppointments = function () {
                return _.isEmpty($scope.providerAppointments) || _.isEmpty($scope.providerAppointments.events);
            };
            return init();
        }]);
