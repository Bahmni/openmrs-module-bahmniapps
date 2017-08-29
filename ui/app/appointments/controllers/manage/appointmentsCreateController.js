'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsCreateController', ['$scope', '$q', '$window', '$state', '$translate', 'spinner', 'patientService',
        'appointmentsService', 'appointmentsServiceService', 'messagingService',
        'ngDialog', 'appService', '$stateParams', 'appointmentCreateConfig',
        function ($scope, $q, $window, $state, $translate, spinner, patientService, appointmentsService, appointmentsServiceService,
                  messagingService, ngDialog, appService, $stateParams, appointmentCreateConfig) {
            $scope.showConfirmationPopUp = true;
            $scope.enableSpecialities = appService.getAppDescriptor().getConfigValue('enableSpecialities');
            $scope.enableServiceTypes = appService.getAppDescriptor().getConfigValue('enableServiceTypes');
            $scope.today = Bahmni.Common.Util.DateUtil.getDateWithoutTime(Bahmni.Common.Util.DateUtil.now());
            $scope.timeRegex = Bahmni.Appointments.Constants.regexForTime;
            $scope.warning = {};
            $scope.minDuration = Bahmni.Appointments.Constants.minDurationForAppointment;
            $scope.appointmentCreateConfig = appointmentCreateConfig;

            var init = function () {
                wireAutocompleteEvents();
                $scope.appointment = Bahmni.Appointments.AppointmentViewModel.create($stateParams.appointment || {}, appointmentCreateConfig);
                if ($scope.appointment && $scope.appointment.service) {
                    return setServiceDetails($scope.appointment.service).then(setServiceType);
                }
            };

            var setServiceType = function () {
                if ($scope.selectedService && $scope.appointment.serviceType) {
                    $scope.appointment.serviceType = _.find($scope.selectedService.serviceTypes, {uuid: $scope.appointment.serviceType.uuid});
                }
            };

            $scope.save = function () {
                if ($scope.createAppointmentForm.$invalid) {
                    var message = $scope.createAppointmentForm.$error.pattern
                        ? 'INVALID_TIME_ERROR_MESSAGE' : 'INVALID_SERVICE_FORM_ERROR_MESSAGE';
                } else if (!moment($scope.appointment.startTime, 'hh:mm a')
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
                if (conflictingAppointments.length === 0) {
                    saveAppointment($scope.validatedAppointment);
                } else {
                    $scope.displayConflictConfirmationDialog();
                }
            };

            $scope.search = function () {
                return spinner.forPromise(patientService.search($scope.appointment.patient.label).then(function (response) {
                    return response.data.pageOfResults;
                }));
            };

            $scope.timeSource = function () {
                return $q(function (resolve) {
                    resolve($scope.startTimes);
                });
            };

            $scope.onSelectPatient = function (data) {
                $scope.appointment.patient = data;
                return spinner.forPromise(appointmentsService.search({patientUuid: data.uuid}).then(function (oldAppointments) {
                    $scope.patientAppointments = oldAppointments.data;
                }));
            };

            var isAppointmentTimeOutsideServiceAvailability = function (appointmentTime) {
                return moment(appointmentTime, 'hh:mm a').isBefore(moment($scope.allowedStartTime, 'hh:mm a')) ||
                    moment($scope.allowedEndTime, 'hh:mm a').isBefore(moment(appointmentTime, 'hh:mm a'));
            };

            var clearSlotsInfo = function () {
                delete $scope.currentLoad;
                delete $scope.maxAppointmentsLimit;
            };

            var getSlotsInfo = function () {
                var daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
                var selectedService = $scope.selectedService;
                var appointment = $scope.appointment;
                var startDateTime, endDateTime;
                var availabilityObject;
                clearSlotsInfo();
                if (!_.isEmpty(selectedService.weeklyAvailability)) {
                    var availability = _.find(selectedService.weeklyAvailability, function (avb) {
                        return daysOfWeek[appointment.date.getDay()] === avb.dayOfWeek &&
                            moment(avb.startTime, 'hh:mm a') <= moment(appointment.startTime, 'hh:mm a') &&
                            moment(appointment.endTime, 'hh:mm a') <= moment(avb.endTime, 'hh:mm a');
                    });
                    if (availability) {
                        availabilityObject = availability;
                        availabilityObject.durationMins = selectedService.durationMins || $scope.minDuration;
                    }
                } else {
                    if (moment(selectedService.startTime || "00:00", 'hh:mm a') <= moment(appointment.startTime, 'hh:mm a') &&
                        moment(appointment.endTime, 'hh:mm a') <= moment(selectedService.endTime || "23:59", 'hh:mm a')) {
                        availabilityObject = selectedService;
                    }
                }
                if (availabilityObject) {
                    $scope.maxAppointmentsLimit = availabilityObject.maxAppointmentsLimit || calculateMaxLoadFromDuration(availabilityObject);
                    startDateTime = getDateTime(appointment.date, availabilityObject.startTime || "00:00");
                    endDateTime = getDateTime(appointment.date, availabilityObject.endTime || "23:59");
                    appointmentsServiceService.getServiceLoad(selectedService.uuid, startDateTime, endDateTime).then(function (response) {
                        $scope.currentLoad = response.data;
                    });
                }
            };

            var dateUtil = Bahmni.Common.Util.DateUtil;
            var calculateMaxLoadFromDuration = function (avb) {
                if (avb.durationMins && avb.startTime && avb.endTime) {
                    var startTime = moment(avb.startTime, ["hh:mm a"]);
                    var endTime = moment(avb.endTime, ["hh:mm a"]);
                    return Math.round((dateUtil.diffInMinutes(startTime, endTime)) / avb.durationMins);
                }
            };

            var getDateTime = function (date, time) {
                var formattedTime = moment(time, ["hh:mm a"]).format("HH:mm");
                return dateUtil.parseServerDateToDate(dateUtil.getDateWithoutTime(date) + ' ' + formattedTime);
            };

            $scope.onSelectStartTime = function (data) {
                $scope.warning.startTime = false;
                if (moment($scope.appointment.startTime, 'hh:mm a').isValid()) {
                    $scope.appointment.endTime = moment($scope.appointment.startTime, 'hh:mm a').add($scope.minDuration, 'm').format('hh:mm a');
                    $scope.onSelectEndTime();
                }
            };

            $scope.onSelectEndTime = function (data) {
                $scope.warning.endTime = false;
                $scope.checkAvailability();
            };

            var triggerSlotCalculation = function () {
                if ($scope.appointment &&
                    $scope.appointment.service &&
                    $scope.appointment.date &&
                    $scope.appointment.startTime &&
                    $scope.appointment.endTime &&
                    _.isEmpty($scope.selectedService.serviceTypes)
                ) {
                    getSlotsInfo();
                }
            };

            $scope.responseMap = function (data) {
                return _.map(data, function (patientInfo) {
                    patientInfo.label = patientInfo.givenName + " " + patientInfo.familyName + " " + "(" + patientInfo.identifier + ")";
                    return patientInfo;
                });
            };

            var clearAvailabilityInfo = function () {
                $scope.warning.appointmentDate = false;
                $scope.warning.startTime = false;
                $scope.warning.endTime = false;
                clearSlotsInfo();
            };

            $scope.onSpecialityChange = function () {
                if (!$scope.appointment.specialityUuid) {
                    delete $scope.appointment.specialityUuid;
                }
                delete $scope.selectedService;
                delete $scope.appointment.service;
                delete $scope.appointment.serviceType;
                delete $scope.appointment.location;
                clearAvailabilityInfo();
            };

            $scope.onServiceChange = function () {
                clearAvailabilityInfo();
                if ($scope.appointment.service) {
                    setServiceDetails($scope.appointment.service);
                }
            };

            $scope.onServiceTypeChange = function () {
                if ($scope.appointment.serviceType) {
                    $scope.minDuration = $scope.appointment.serviceType.duration;
                }
                clearAvailabilityInfo();
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
                    } else {
                        $scope.allowedStartTime = undefined;
                        $scope.allowedEndTime = undefined;
                    }
                }
            };

            $scope.checkAvailability = function () {
                $scope.warning.appointmentDate = false;
                if ($scope.selectedService && $scope.appointment.date) {
                    setServiceAvailableTimesForADate($scope.appointment.date);
                    var dayOfWeek = moment($scope.appointment.date).format('dddd').toUpperCase();
                    if ($scope.selectedService.weeklyAvailability && $scope.selectedService.weeklyAvailability.length > 0) {
                        var allSlots = getAllSlots('', '', $scope.minDuration);
                        $scope.startTimes = getAvailableSlots(dayOfWeek, $scope.selectedService.weeklyAvailability, allSlots);
                        $scope.warning.appointmentDate = !getWeeklyAvailabilityOnADate($scope.appointment.date, $scope.selectedService.weeklyAvailability);
                    } else {
                        $scope.startTimes = getAllSlots($scope.selectedService.startTime, $scope.selectedService.endTime, $scope.minDuration);
                    }
                    $scope.warning.endTime = isAppointmentTimeOutsideServiceAvailability($scope.appointment.endTime);
                    $scope.warning.startTime = isAppointmentTimeOutsideServiceAvailability($scope.appointment.startTime);
                    triggerSlotCalculation();
                }
            };

            var setServiceDetails = function (service) {
                return appointmentsServiceService.getService(service.uuid).then(
                    function (response) {
                        $scope.selectedService = response.data;
                        $scope.appointment.location = $scope.selectedService.location;
                        var serviceTypes = $scope.selectedService.serviceTypes;
                        var duration = serviceTypes.length > 0 ? _.head(_.sortBy(serviceTypes, _.property('duration'))).duration : response.data.durationMins;
                        $scope.minDuration = duration || $scope.minDuration;
                        $scope.checkAvailability();
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

                while (current.valueOf() < end.valueOf()) {
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
                    $state.go('^', {viewDate: $scope.appointment.date}, {reload: true});
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
