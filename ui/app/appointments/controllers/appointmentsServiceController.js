'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsServiceController', ['$scope', '$q', 'spinner', '$window', '$state', '$translate',
        'appointmentsServiceService', 'locationService', 'messagingService', 'specialityService', 'ngDialog',
        function ($scope, $q, spinner, $window, $state, $translate, appointmentsServiceService, locationService,
                  messagingService, specialityService, ngDialog) {
            $scope.showConfirmationPopUp = true;
            $scope.service = $scope.service || {};
            $scope.save = function () {
                var service = Bahmni.Appointments.Service.create($scope.service);
                appointmentsServiceService.save(service).then(function () {
                    messagingService.showMessage('info', 'APPOINTMENT_SERVICE_SAVE_SUCCESS');
                    $scope.showConfirmationPopUp = false;
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

            var init = function () {
                return spinner.forPromise(getAppointmentLocations(), getAllSpecialities());
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
                return !_.every(_.values($scope.service), function (value) { return !value; });
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
