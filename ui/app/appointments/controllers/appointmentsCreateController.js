'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsCreateController', ['$scope', '$q', '$window', '$state', '$translate', 'spinner', 'patientService',
        'appointmentsService', 'appointmentsServiceService', 'locationService', 'messagingService', 'specialityService',
        'ngDialog', 'appService', 'providerService',
        function ($scope, $q, $window, $state, $translate, spinner, patientService, appointmentsService, appointmentsServiceService, locationService,
                  messagingService, specialityService, ngDialog, appService, providerService) {
            var init = function () {
                var promises = [];
                $scope.showConfirmationPopUp = true;
                $scope.appointment = $scope.appointment || {};
                $scope.selectedPatient = $scope.ngDialogData && $scope.ngDialogData.patient;
                $scope.patient = $scope.ngDialogData && $scope.ngDialogData.patient && ($scope.ngDialogData.patient.value || $scope.ngDialogData.patient.display);
                $scope.enableSpecialities = appService.getAppDescriptor().getConfigValue('enableSpecialities');

                promises.push(getAppointmentLocations(), getAllServices(), getAllProviders());
                if ($scope.enableSpecialities) {
                    promises.push(getAllSpecialities());
                }
                return spinner.forPromise($q.all(promises));
            };

            $scope.save = function () {
                if ($scope.createAppointmentForm.$invalid) {
                    messagingService.showMessage('error', 'INVALID_SERVICE_FORM_ERROR_MESSAGE');
                    return;
                }
                var appointment = Bahmni.Appointments.Appointment.create($scope.appointment);
                appointmentsService.save(appointment).then(function () {
                    messagingService.showMessage('info', 'APPOINTMENT_SERVICE_SAVE_SUCCESS');
                    $scope.showConfirmationPopUp = false;
                    //$state.go('home.admin.service');
                });
            };

            $scope.shouldBeDisabled = function () {
                return $scope.patient && $scope.ngDialogData && $scope.ngDialogData.id;
            };

            $scope.search = function () {
                var defer = $q.defer();
                spinner.forPromise(defer.promise);
                return patientService.search($scope.patient).then(function (response) {
                    defer.resolve();
                    return response.data.pageOfResults;
                });
            };

            $scope.startTimeSource = function () {
                return $q(function (resolve) {
                    resolve($scope.startTimes);
                });
            };

            $scope.startTimeResponseMap = function (data) {
                return _.map(data, function (time) {
                    return time;
                });
            };

            $scope.onSelectPatient = function (data) {
                $scope.selectedPatient = data;
                $scope.appointment.patientUuid = data.uuid;
            };

            $scope.onSelectStartTime = function (data) {
                $scope.appointment.startTime = data.value;
            };

            $scope.onSelectEndTime = function (data) {
                $scope.appointment.endTime = data.value;
            };

            $scope.responseMap = function (data) {
                return _.map(data, function (patientInfo) {
                    patientInfo.label = patientInfo.givenName + " " + patientInfo.familyName + " " + "(" + patientInfo.identifier + ")";
                    return patientInfo;
                });
            };

            $scope.onServiceChange = function () {
                if ($scope.appointment.serviceUuid) {
                    setServiceDetails($scope.appointment.serviceUuid);
                }
            };

            $scope.OnDateChange = function () {
                var dayOfWeek = moment($scope.appointment.date).format('dddd').toUpperCase();
                var allSlots = getAllSlots($scope.selectedService.startTime, $scope.selectedService.endTime, $scope.minDuration);
                $scope.startTimes = $scope.selectedService.weeklyAvailability && $scope.selectedService.weeklyAvailability.length > 0 ?
                    getAvailableSlots(dayOfWeek, $scope.selectedService.weeklyAvailability, allSlots) : allSlots;
            };

            var setServiceDetails = function (serviceUuid) {
                appointmentsServiceService.getService(serviceUuid).then(
                    function (response) {
                        $scope.serviceTypes = response.data.serviceTypes;
                        $scope.appointment.locationUuid = response.data.location.uuid;
                        $scope.minDuration = $scope.serviceTypes.length > 0 ?
                            _.head(_.sortBy($scope.serviceTypes, _.property('duration'))).duration :
                            response.data.durationMins;
                        $scope.selectedService = response.data;
                    },
                    function (response) {
                        if (response.status) {
                            response = 'MESSAGE_GET_SERVICES_ERROR';
                        }
                        messagingService.showMessage('error', response);
                    }
                );
            };

            var getAppointmentLocations = function () {
                var deferrable = $q.defer();
                locationService.getAllByTag('Appointment Location').then(
                    function (response) {
                        $scope.locations = response.data.results;
                        deferrable.resolve($scope.locations);
                    },
                    function (response) {
                        if (response.status) {
                            response = 'MESSAGE_GET_LOCATIONS_ERROR';
                        }
                        messagingService.showMessage('error', response);
                        deferrable.reject();
                    }
                );
                return deferrable.promise;
            };

            var getAllSpecialities = function () {
                var deferrable = $q.defer();
                specialityService.getAllSpecialities().then(
                    function (response) {
                        $scope.specialities = response.data;
                        deferrable.resolve($scope.locations);
                    },
                    function (response) {
                        if (response.status) {
                            response = 'MESSAGE_GET_SPECIALITIES_ERROR';
                        }
                        messagingService.showMessage('error', response);
                        deferrable.reject();
                    }
                );
                return deferrable.promise;
            };

            var getAllServices = function () {
                var deferrable = $q.defer();
                appointmentsServiceService.getAllServices().then(
                    function (response) {
                        $scope.services = response.data;
                        deferrable.resolve($scope.services);
                    },
                    function (response) {
                        if (response.status) {
                            response = 'MESSAGE_GET_SERVICES_ERROR';
                        }
                        messagingService.showMessage('error', response);
                        deferrable.reject();
                    }
                );
                return deferrable.promise;
            };

            var getAllProviders = function () {
                var deferrable = $q.defer();
                providerService.list().then(
                    function (response) {
                        $scope.providers = response.data.results;
                        deferrable.resolve($scope.providers);
                    },
                    function (response) {
                        if (response.status) {
                            response = 'MESSAGE_GET_PROVIDERS_ERROR';
                        }
                        messagingService.showMessage('error', response);
                        deferrable.reject();
                    }
                );
                return deferrable.promise;
            };

            $scope.continueWithoutSaving = function () {
                $scope.showConfirmationPopUp = false;
                $state.go($scope.toStateConfig.toState, $scope.toStateConfig.toParams);
                ngDialog.close();
            };

            $scope.cancelTransition = function () {
                $scope.showConfirmationPopUp = true;
                ngDialog.close();
            };

            $scope.displayConfirmationDialog = function () {
                ngDialog.openConfirm({
                    template: 'views/appointmentServiceSaveConfirmation.html',
                    scope: $scope,
                    closeByEscape: true
                });
            };

            var getAvailableSlots = function (dayOfWeek, weeklyAvailability, allSlots) {
                return _.filter(allSlots, function (slot) {
                    var currentSlot = moment(slot, 'hh:mm a');
                    var dayAvailability = _.find(weeklyAvailability, function (o) {
                        return o.dayOfWeek === dayOfWeek;
                    });
                    return dayAvailability &&
                        moment(dayAvailability.startTime, 'hh:mm a') <= currentSlot &&
                        moment(dayAvailability.endTime, 'hh:mm a') > currentSlot;
                });
            };

            var getAllSlots = function (startString, endString, durationInMin) {
                startString = (startString && startString.length > 0) ? startString : '08:00 am';
                endString = (endString && endString.length > 0) ? endString : '9:00 pm';

                var start = moment(startString, 'hh:mm a');
                var end = moment(endString, 'hh:mm a');
                start.minutes(Math.ceil(start.minutes() / durationInMin) * durationInMin);

                var result = [];
                var current = moment(start);

                while (current.valueOf() <= end.valueOf()) {
                    result.push(current.format('hh:mm a'));
                    current.add(durationInMin, 'minutes');
                }
                return result;
            };

            var isFormFilled = function () {
                return !_.every(_.values($scope.appointment), function (value) {
                    return !value;
                });
            };

            var cleanUpListenerStateChangeStart = $scope.$on('$stateChangeStart',
                function (event, toState, toParams, fromState, fromParams) {
                    if (isFormFilled() && $scope.showConfirmationPopUp) {
                        event.preventDefault();
                        ngDialog.close();
                        $scope.toStateConfig = {toState: toState, toParams: toParams};
                        $scope.displayConfirmationDialog();
                    }
                }
            );

            $scope.$on("$destroy", function () {
                cleanUpListenerStateChangeStart();
            });

            return init();
        }]);
