'use strict';

angular.module('bahmni.appointments').factory('appointmentConfigInitialization',
    ['locationService', 'specialityService', 'appointmentsServiceService', 'providerService', 'appService', 'spinner', '$q',
        function (locationService, specialityService, appointmentsServiceService, providerService, appService, spinner, $q) {
            return function (appointmentContext) {
                var init = function () {
                    var promises = [];
                    var config = {};
                    promises.push(getAppointmentLocations(), getAllServices(), getAllProviders());

                    var enableSpecialities = appService.getAppDescriptor().getConfigValue('enableSpecialities');
                    if (enableSpecialities) {
                        promises.push(getAllSpecialities().then(function (response) {
                            config.specialities = response.data;
                        }));
                    }
                    if (appointmentContext.appointment && appointmentContext.appointment.service) {
                        promises.push(getAppointmentService(appointmentContext.appointment.service.uuid).then(function (response) {
                            config.selectedService = response.data;
                        }));
                    }

                    return spinner.forPromise($q.all(promises).then(function (results) {
                        config.locations = results[0].data.results;
                        config.services = results[1].data;
                        config.providers = results[2];
                        return config;
                    }));
                };

                var getAppointmentLocations = function () {
                    return locationService.getAllByTag('Appointment Location');
                };

                var getAllSpecialities = function () {
                    return specialityService.getAllSpecialities();
                };

                var getAllServices = function () {
                    return appointmentsServiceService.getAllServices();
                };

                var getAllProviders = function () {
                    var params = {v: "custom:(display,person,uuid,retired)"};
                    return providerService.list(params).then(function (response) {
                        var results = _.filter(response.data.results, function (provider) {
                            return !provider.retired;
                        });
                        return _.uniqBy(results, function (result) {
                            return result.person && result.person.display;
                        });
                    });
                };

                var getAppointmentService = function (uuid) {
                    return appointmentsServiceService.getService(uuid);
                };

                return init();
            };
        }]
);
