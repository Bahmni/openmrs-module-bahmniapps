'use strict';

angular.module('bahmni.appointments').factory('appointmentConfigInitialization',
    ['locationService', 'specialityService', 'appointmentsServiceService', 'providerService', 'appService', 'spinner', '$q',
        function (locationService, specialityService, appointmentsServiceService, providerService, appService, spinner, $q) {
            return function ($stateParams) {
                var init = function () {
                    var promises = [];
                    var config = {};
                    promises.push(getAppointmentLocations(), getAllServices(), getAllProviders());

                    var enableSpecialities = appService.getAppDescriptor().getConfigValue('enableSpecialities');
                    if (enableSpecialities) {
                        promises.push(getAllSpecialities());
                    }
                    if ($stateParams.appointment && $stateParams.appointment.service) {
                        promises.push(getAppointmentService($stateParams.appointment.service.uuid));
                    }

                    return spinner.forPromise($q.all(promises).then(function (results) {
                        config.locations = results[0].data.results;
                        config.services = results[1].data;
                        config.providers = results[2];
                        if (enableSpecialities) { config.specialities = results[3].data; }
                        if ($stateParams.appointment && $stateParams.appointment.service) {
                            config.serviceTypes = results[4].data.serviceTypes;
                        }
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
                    return providerService.list().then(function (response) {
                        return _.filter(response.data.results, function (result) {
                            return result.display;
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
