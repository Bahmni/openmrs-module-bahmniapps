'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsCreateController', ['$scope', '$q', '$window', '$state', '$translate', 'spinner', 'patientService',
        'appointmentsService', 'appointmentsServiceService', 'locationService', 'messagingService', 'specialityService',
        'ngDialog', 'appService', 'providerService',
        function ($scope, $q, $window, $state, $translate, spinner, patientService, appointmentsService, appointmentsServiceService,
                  locationService, messagingService, specialityService, ngDialog, appService, providerService) {
            var init = function () {
                var promises = [];
                $scope.showConfirmationPopUp = true;
                $scope.appointment = $scope.appointment || {};
                $scope.enableSpecialities = appService.getAppDescriptor().getConfigValue('enableSpecialities');
                $scope.enableServiceTypes = appService.getAppDescriptor().getConfigValue('enableServiceTypes');
                $scope.today = Bahmni.Common.Util.DateUtil.getDateWithoutTime(Bahmni.Common.Util.DateUtil.now());
                $scope.timeRegex = /^(?:(?:1[0-2]|0?[1-9]):[0-5]\d\s*[AaPp][Mm])?$/;
                $scope.warning = {
                    startTime: false,
                    endTime: false,
                    appointmentDate: false
                };

                wireAutocompleteEvents();

                promises.push(getAppointmentLocations(), getAllServices(), getAllProviders());
                if ($scope.enableSpecialities) {
                    promises.push(getAllSpecialities());
                }
                return spinner.forPromise($q.all(promises));
            };

            $scope.save = function () {
                if ($scope.createAppointmentForm.$invalid) {
                    var message = $scope.createAppointmentForm.$error.pattern ?
                        'INVALID_TIME_ERROR_MESSAGE' : 'INVALID_SERVICE_FORM_ERROR_MESSAGE';
                }
                else if (!moment($scope.appointment.startTime, 'hh:mm a')
                        .isBefore(moment($scope.appointment.endTime, 'hh:mm a'), 'minutes')) {
                    var message = 'TIME_SEQUENCE_ERROR_MESSAGE';
                }
                if (message) {
                    messagingService.showMessage('error', message);
                    return;
                }
                defaultsForNewAppointment();

                $scope.validatedAppointment = Bahmni.Appointments.Appointment.create($scope.appointment);
                var conflictingAppointments = checkForOldConflicts($scope.validatedAppointment);
                if (conflictingAppointments.length == 0) {
                    saveAppointment($scope.validatedAppointment);
                } else {
                    $scope.displayConflictConfirmationDialog();
                }
            };

            $scope.search = function () {
                return spinner.forPromise(patientService.search($scope.patient).then(function (response) {
                    return response.data.pageOfResults;
                }));
            };

            $scope.timeSource = function () {
                return $q(function (resolve) {
                    resolve($scope.startTimes);
                });
            };

            $scope.onSelectPatient = function (data) {
                $scope.appointment.patientUuid = data.uuid;
                var appointment = Bahmni.Appointments.Appointment.create({patientUuid: data.uuid});
                spinner.forPromise(appointmentsService.search(appointment).then(function (oldAppointments) {
                    $scope.patientAppointments = oldAppointments.data;
                }));
            };

            var isAppointmentTimeOutsideServiceAvailability = function (appointmentTime) {
                return moment(appointmentTime, 'hh:mm a').isBefore(moment($scope.allowedStartTime, 'hh:mm a')) ||
                    moment($scope.allowedEndTime, 'hh:mm a').isBefore(moment(appointmentTime, 'hh:mm a'));
            };

            $scope.onSelectStartTime = function (data) {
                if (data) {
                    $scope.appointment.startTime = data.value;
                }
                $scope.warning.startTime = isAppointmentTimeOutsideServiceAvailability($scope.appointment.startTime);
                if (moment($scope.appointment.startTime, 'hh:mm a').isValid()) {
                    var data = {value: moment($scope.appointment.startTime, 'hh:mm a').add($scope.minDuration, 'm').format('hh:mm a')};
                    $scope.onSelectEndTime(data);
                }
            };

            $scope.onSelectEndTime = function (data) {
                if (data) {
                    $scope.appointment.endTime = data.value;
                }
                $scope.warning.endTime = isAppointmentTimeOutsideServiceAvailability($scope.appointment.endTime);
            };

            $scope.responseMap = function (data) {
                return _.map(data, function (patientInfo) {
                    patientInfo.label = patientInfo.givenName + " " + patientInfo.familyName + " " + "(" + patientInfo.identifier + ")";
                    return patientInfo;
                });
            };

            var clearDateTime = function () {
                delete $scope.appointment.date;
                delete $scope.appointment.startTime;
                delete $scope.appointment.endTime;
                $("#startTimeID").val('');
                $("#endTimeID").val('');
                $scope.warning.appointmentDate = false;
                $scope.warning.startTime = false;
                $scope.warning.endTime = false;
            };

            $scope.onSpecialityChange = function () {
                if (!$scope.appointment.specialityUuid) {
                    delete $scope.appointment.specialityUuid;
                }
                delete $scope.appointment.serviceUuid;
                delete $scope.appointment.serviceTypeUuid;
                delete $scope.appointment.locationUuid;
                clearDateTime();
            };

            $scope.onServiceChange = function () {
                if ($scope.appointment.serviceUuid) {
                    setServiceDetails($scope.appointment.serviceUuid);
                }
                clearDateTime();
            };

            $scope.onServiceTypeChange = function () {
                if ($scope.appointment.serviceTypeUuid) {
                    var type = _.find($scope.serviceTypes, function (serviceType) {
                        return serviceType.uuid === $scope.appointment.serviceTypeUuid;
                    });
                    $scope.minDuration = type.duration;
                }
                clearDateTime();
            };

            var getWeeklyAvailabilityOnADate = function (date, weeklyAvailability) {
                return _.find(weeklyAvailability, function (o) {
                    return o.dayOfWeek === moment(date).format('dddd').toUpperCase();
                });
            };

            var setServiceAvailableTimesForADate = function (date) {
                $scope.allowedStartTime = $scope.selectedService.startTime || '08:00 am';
                $scope.allowedEndTime = $scope.selectedService.endTime || '09:00 pm';

                if ($scope.selectedService.weeklyAvailability && $scope.selectedService.weeklyAvailability.length > 0) {
                    var weeklyAvailability = getWeeklyAvailabilityOnADate(date, $scope.selectedService.weeklyAvailability);
                    if (weeklyAvailability) {
                        $scope.allowedStartTime = weeklyAvailability.startTime;
                        $scope.allowedEndTime = weeklyAvailability.endTime;
                    }
                    else {
                        $scope.allowedStartTime = undefined;
                        $scope.allowedEndTime = undefined;
                    }
                }
            };

            $scope.OnDateChange = function () {
                $scope.warning.appointmentDate = false;
                if ($scope.appointment.date) {
                    setServiceAvailableTimesForADate($scope.appointment.date);
                    var dayOfWeek = moment($scope.appointment.date).format('dddd').toUpperCase();
                    if ($scope.selectedService.weeklyAvailability && $scope.selectedService.weeklyAvailability.length > 0) {
                        var allSlots = getAllSlots('', '', $scope.minDuration);
                        $scope.startTimes = getAvailableSlots(dayOfWeek, $scope.selectedService.weeklyAvailability, allSlots);
                        $scope.warning.appointmentDate = !getWeeklyAvailabilityOnADate($scope.appointment.date, $scope.selectedService.weeklyAvailability);
                    }
                    else {
                        $scope.startTimes = getAllSlots($scope.selectedService.startTime, $scope.selectedService.endTime, $scope.minDuration);
                    }
                    $scope.warning.endTime = isAppointmentTimeOutsideServiceAvailability($scope.appointment.endTime);
                    $scope.warning.startTime = isAppointmentTimeOutsideServiceAvailability($scope.appointment.startTime);
                }
            };

            var setServiceDetails = function (serviceUuid) {
                appointmentsServiceService.getService(serviceUuid).then(
                    function (response) {
                        $scope.serviceTypes = response.data.serviceTypes;
                        $scope.appointment.locationUuid = response.data.location.uuid;
                        $scope.selectedService = response.data;
                        var duration = $scope.serviceTypes.length > 0 ?
                            _.head(_.sortBy($scope.serviceTypes, _.property('duration'))).duration :
                            response.data.durationMins;
                        $scope.minDuration = duration ? duration : 30;
                    });
            };

            var getAppointmentLocations = function () {
                locationService.getAllByTag('Appointment Location').then(
                    function (response) {
                        $scope.locations = response.data.results;
                    });
            };

            var getAllSpecialities = function () {
                return specialityService.getAllSpecialities().then(
                    function (response) {
                        $scope.specialities = response.data;
                    });
            };

            var getAllServices = function () {
                return appointmentsServiceService.getAllServices().then(
                    function (response) {
                        $scope.services = response.data;
                    }
                );
            };

            var getAllProviders = function () {
                return providerService.list().then(
                    function (response) {
                        $scope.providers = _.filter(response.data.results,
                            function (result) {
                                return result.display;
                            });
                    });
            };

            $scope.continueWithoutSaving = function () {
                $scope.showConfirmationPopUp = false;
                $state.go($scope.toStateConfig.toState, $scope.toStateConfig.toParams);
                ngDialog.close();
            };

            $scope.continueWithSaving = function () {
                saveAppointment($scope.validatedAppointment);
                ngDialog.close();
            };

            $scope.cancelTransition = function () {
                $scope.showConfirmationPopUp = true;
                ngDialog.close();
            };

            $scope.displayConfirmationDialog = function () {
                ngDialog.openConfirm({
                    template: 'views/admin/appointmentServiceNavigationConfirmation.html',
                    scope: $scope,
                    closeByEscape: true
                });
            };

            $scope.displayConflictConfirmationDialog = function () {
                ngDialog.openConfirm({
                    template: 'views/manage/appointmentConflictConfirmation.html',
                    scope: $scope,
                    closeByEscape: true
                });
            };

            $scope.$on("$destroy", function () {
                cleanUpListenerStateChangeStart();
            });

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

            var defaultsForNewAppointment = function () {
                if (!($scope.appointment.status && $scope.appointment.status.length > 0)) {
                    $scope.appointment.status = Bahmni.Appointments.Constants.defaultAppointmentStatus;
                }
                if (!$scope.appointment.appointmentKind) {
                    $scope.appointment.appointmentKind = 'Scheduled';
                }
            };

            var checkForOldConflicts = function (appointment) {
                return _.filter($scope.patientAppointments, function (apt) {
                    var s1 = moment(apt.startDateTime),
                        e1 = moment(apt.endDateTime),
                        s2 = moment(appointment.startDateTime),
                        e2 = moment(appointment.endDateTime);

                    return s1.diff(s2, 'days') === 0 &&
                        ((s1 >= s2 && s1 <= e2) || (s2 >= s1 && s2 <= e1));
                });
            };

            var saveAppointment = function (appointment) {
                appointmentsService.save(appointment).then(function () {
                    messagingService.showMessage('info', 'APPOINTMENT_SAVE_SUCCESS');
                    $scope.showConfirmationPopUp = false;
                    $state.go('^');
                });
            };

            var wireAutocompleteEvents = function () {
                $("#endTimeID").bind('focus', function () {
                    $("#endTimeID").autocomplete("search");
                });
                var $startTimeID = $("#startTimeID");
                $startTimeID.bind('focus', function () {
                    $("#startTimeID").autocomplete("search");
                });
                $startTimeID.bind('focusout', function () {
                    $scope.onSelectStartTime();
                });
            };

            return init();
        }]);
