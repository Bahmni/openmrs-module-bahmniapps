'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsCreateController', ['$scope', '$q', 'spinner', '$window', '$state', '$translate', 'patientService',
        'appointmentsService', 'appointmentsServiceService', 'locationService', 'messagingService', 'specialityService',
        'ngDialog', 'appService', 'providerService',
        function ($scope, $q, spinner, $window, $state, $translate, patientService, appointmentsService, appointmentsServiceService, locationService,
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
                // if ($scope.createServiceForm.$invalid) {
                //     messagingService.showMessage('error', 'INVALID_SERVICE_FORM_ERROR_MESSAGE');
                //     return;
                // }
                // var service = Bahmni.Appointments.Service.create($scope.service);
                // appointmentsServiceService.save(service).then(function () {
                //     messagingService.showMessage('info', 'APPOINTMENT_SERVICE_SAVE_SUCCESS');
                //     $scope.showConfirmationPopUp = false;
                //     $state.go('home.admin.service');
                // });
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
                    resolve(["11:00 am", " 12:00 am"]);
                });
            };

            $scope.startTimeResponseMap = function (data) {
                return _.map(data, function (time) {
                    return time;
                });
            };

            $scope.onSelectPatient = function (data) {
                $scope.selectedPatient = data;
            };

            $scope.responseMap = function (data) {
                return _.map(data, function (patientInfo) {
                    patientInfo.label = patientInfo.givenName + " " + patientInfo.familyName + " " + "(" + patientInfo.identifier + ")";
                    return patientInfo;
                });
            };

            $scope.onServiceChange = function () {
                var serviceSelected = _.find($scope.services, {uuid: $scope.appointment.serviceUuid});
                $scope.serviceTypes = serviceSelected.serviceTypes;
                $scope.appointment.locationUuid = serviceSelected.location.uuid;
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
