'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentServiceController', ['$scope', '$q', 'spinner', '$window', '$state', '$translate',
        'appointmentsServiceService', 'locationService', 'messagingService', 'specialityService', 'ngDialog',
        'appService',
        function ($scope, $q, spinner, $window, $state, $translate, appointmentsServiceService, locationService,
                  messagingService, specialityService, ngDialog, appService) {
            $scope.showConfirmationPopUp = true;
            $scope.enableSpecialities = appService.getAppDescriptor().getConfigValue('enableSpecialities');
            $scope.enableServiceTypes = appService.getAppDescriptor().getConfigValue('enableServiceTypes');
            $scope.enableCalendarView = appService.getAppDescriptor().getConfigValue('enableCalendarView');
            $scope.colorsForAppointmentService = appService.getAppDescriptor().getConfigValue('colorsForAppointmentService');
            $scope.service = Bahmni.Appointments.AppointmentServiceViewModel.createFromResponse({});
            $scope.service.color = $scope.service.color || $scope.colorsForAppointmentService && $scope.colorsForAppointmentService[0] || "#008000";
            $scope.save = function () {
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
            };

            $scope.hasWeeklyAvailability = function () {
                return ($scope.service.weeklyAvailability.length > 0);
            };

            $scope.validateServiceName = function () {
                $scope.createServiceForm.name.$setValidity('uniqueServiceName', isServiceNameUnique($scope.service.name));
            };

            var isServiceNameUnique = function (serviceName) {
                if (!serviceName) {
                    return true;
                }
                return !$scope.services.some(function (service) {
                    return service.name.toLowerCase() === serviceName.toLowerCase();
                });
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
                    });
                return deferrable.promise;
            };

            var init = function () {
                var promises = [];
                promises.push(getAppointmentLocations(), getAllServices());
                if ($scope.enableSpecialities) {
                    promises.push(getAllSpecialities());
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
                    template: 'views/admin/appointmentServiceSaveConfirmation.html',
                    scope: $scope,
                    closeByEscape: true
                });
            };

            var isAtLeastOneValueIsSet = function () {
                return _.values(_.omit($scope.service, 'color')).some(function (value) {
                    return _.isArray(value) ? !_.isEmpty(value) : value;
                });
            };

            var cleanUpListenerStateChangeStart = $scope.$on('$stateChangeStart',
                function (event, toState, toParams) {
                    if (isAtLeastOneValueIsSet() && $scope.showConfirmationPopUp) {
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
