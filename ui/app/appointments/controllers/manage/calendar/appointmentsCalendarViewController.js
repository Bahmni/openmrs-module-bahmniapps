'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsCalendarViewController', ['$scope', 'spinner', 'appointmentsService', 'appointmentsContext', '$translate',
        function ($scope, spinner, appointmentsService, appointmentsContext, $translate) {
            var init = function () {
                var parseAppointments = function (allAppointments) {
                    var appointments = allAppointments.filter(function (appointment) {
                        return appointment.status !== "Cancelled";
                    });
                    var providers = appointments.map(function (appointment) {
                        return appointment.provider;
                    });
                    var resources = [];
                    providers.reduce(function (result, provider) {
                        if (provider) {
                            var resource = { id: provider.name, title: provider.name };
                            var exists = _.find(result, resource);
                            if (!exists) {
                                result.push(resource);
                            }
                        }
                        return result;
                    }, resources);
                    resources.push({id: '[No Provider]', title: $translate.instant("NO_PROVIDER_COLUMN_KEY")});

                    var events = [];
                    appointments.reduce(function (result, appointment) {
                        var event = {};
                        event.resourceId = appointment.provider ? appointment.provider.name : '[No Provider]';
                        event.start = appointment.startDateTime;
                        event.end = appointment.endDateTime;
                        event.color = appointment.service.color;
                        event.serviceName = appointment.service.name;
                        var existingEvent = _.find(result, event);
                        var patientName = appointment.patient.name + "(" + appointment.patient.identifier + ")";
                        if (existingEvent) {
                            existingEvent.title = [existingEvent.title, patientName].join(',');
                        } else {
                            event.title = patientName;
                            result.push(event);
                        }
                        return result;
                    }, events);

                    $scope.providerAppointments = {resources: resources, events: events};
                    $scope.shouldReload = true;
                };
                parseAppointments(appointmentsContext.appointments);

                $scope.getAppointmentsForDate = function (viewDate) {
                    $scope.shouldReload = false;
                    var params = { forDate: viewDate };
                    return spinner.forPromise(appointmentsService.getAllAppointments(params).then(function (response) {
                        return parseAppointments(response.data);
                    }));
                };
            };
            return init();
        }]);
