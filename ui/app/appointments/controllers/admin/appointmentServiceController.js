'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentServiceController', ['$scope', '$q', 'spinner', '$state', 'appointmentsServiceService',
        'locationService', 'messagingService', 'specialityService', 'ngDialog', 'appService', 'appointmentServiceContext',
        'confirmBox',
        function ($scope, $q, spinner, $state, appointmentsServiceService, locationService,
                  messagingService, specialityService, ngDialog, appService, appointmentServiceContext, confirmBox) {
            $scope.showConfirmationPopUp = true;
            $scope.enableSpecialities = appService.getAppDescriptor().getConfigValue('enableSpecialities');
            $scope.enableServiceTypes = appService.getAppDescriptor().getConfigValue('enableServiceTypes');
            $scope.enableCalendarView = appService.getAppDescriptor().getConfigValue('enableCalendarView');
            $scope.colorsForAppointmentService = appService.getAppDescriptor().getConfigValue('colorsForAppointmentService');
            var serviceDetails = appointmentServiceContext ? appointmentServiceContext.service : {};
            $scope.service = Bahmni.Appointments.AppointmentServiceViewModel.createFromResponse(serviceDetails);
            $scope.service.color = $scope.service.color || $scope.colorsForAppointmentService && $scope.colorsForAppointmentService[0] || "#008000";

            var save = function () {
                clearValuesIfDisabledAndInvalid();
                if ($scope.createServiceForm.$invalid) {
                    messagingService.showMessage('error', 'INVALID_SERVICE_FORM_ERROR_MESSAGE');
                    return;
                }
                var service = Bahmni.Appointments.AppointmentService.createFromUIObject($scope.service);
                appointmentsServiceService.save(service).then(function () {
                    messagingService.showMessage('info', 'APPOINTMENT_SERVICE_SAVE_SUCCESS');
                    $scope.showConfirmationPopUp = false;
                    $state.go('home.admin.service');
                });
                ngDialog.close();
            };

            var clearValuesIfDisabledAndInvalid = function () {
                var form = $scope.createServiceForm;
                if (form.serviceTime.$invalid && $scope.hasWeeklyAvailability()) {
                    delete $scope.service.startTime;
                    delete $scope.service.endTime;
                    form.serviceTime.$setValidity('timeSequence', true);
                }
                if (form.serviceMaxLoad.$invalid && ($scope.hasWeeklyAvailability() || $scope.hasServiceTypes())) {
                    delete $scope.service.maxAppointmentsLimit;
                    form.serviceMaxLoad.$setValidity('min', true);
                }
                if (form.serviceMaxLoad.$invalid && ($scope.hasServiceTypes())) {
                    delete $scope.service.maxAppointmentsLimit;
                    form.serviceMaxLoad.$setValidity('min', true);
                }
            };

            $scope.hasWeeklyAvailability = function () {
                return ($scope.service.weeklyAvailability.length > 0);
            };

            $scope.hasServiceTypes = function () {
                return ($scope.service.serviceTypes.length > 0);
            };

            var isNew = function () {
                return !$scope.service.uuid;
            };

            $scope.confirmSave = function () {
                if (isNew()) {
                    save();
                    return;
                }
                var childScope = {};
                childScope.message = 'CONFIRM_EDIT_SERVICE_MESSAGE_KEY';
                childScope.cancel = cancelSave;
                childScope.ok = save;
                confirmBox({
                    scope: childScope,
                    actions: [{name: 'cancel', display: 'CANCEL_KEY'}, {name: 'ok', display: 'OK_KEY'}],
                    className: "ngdialog-theme-default delete-program-popup"
                });
            };

            var cancelSave = function (closeDialog) {
                closeDialog();
            };

            $scope.validateServiceName = function () {
                $scope.createServiceForm.name.$setValidity('uniqueServiceName', isServiceNameUnique($scope.service));
            };

            var isServiceNameUnique = function (service) {
                if (!service.name) {
                    return true;
                }
                return !$scope.services.some(function (existingService) {
                    var isConflictingName = existingService.name.toLowerCase() === service.name.toLowerCase();
                    return service.uuid ? isConflictingName && (service.uuid !== existingService.uuid) : isConflictingName;
                });
            };

            var initAppointmentLocations = function () {
                return locationService.getAllByTag('Appointment Location').then(function (response) {
                    $scope.locations = response.data.results;
                }
                );
            };

            var initSpecialities = function () {
                return specialityService.getAllSpecialities().then(function (response) {
                    $scope.specialities = response.data;
                });
            };

            var initServices = function () {
                return appointmentsServiceService.getAllServices().then(function (response) {
                    $scope.services = response.data;
                });
            };

            var init = function () {
                var promises = [];
                promises.push(initAppointmentLocations());
                promises.push(initServices());
                if ($scope.enableSpecialities) {
                    promises.push(initSpecialities());
                }
                return spinner.forPromise($q.all(promises));
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
                    template: 'views/admin/appointmentServiceNavigationConfirmation.html',
                    scope: $scope,
                    closeByEscape: true
                });
            };

            var cleanUpListenerStateChangeStart = $scope.$on('$stateChangeStart',
                function (event, toState, toParams) {
                    if ($scope.showConfirmationPopUp) {
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
