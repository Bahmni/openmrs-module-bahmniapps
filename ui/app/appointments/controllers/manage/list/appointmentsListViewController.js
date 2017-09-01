'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsListViewController', ['$scope', '$state', '$stateParams', 'spinner', 'appointmentsService', 'appService', 'appointmentsFilter',
        function ($scope, $state, $stateParams, spinner, appointmentsService, appService, appointmentsFilter) {
            $scope.enableSpecialities = appService.getAppDescriptor().getConfigValue('enableSpecialities');
            $scope.enableServiceTypes = appService.getAppDescriptor().getConfigValue('enableServiceTypes');
            $scope.searchedPatient = false;
            var oldPatientData = [];
            var init = function () {
                $scope.startDate = $stateParams.viewDate || moment().startOf('day').toDate();
                return $scope.getAppointmentsForDate($scope.startDate);
            };

            $scope.getAppointmentsForDate = function (viewDate) {
                $scope.selectedAppointment = undefined;
                var params = {
                    forDate: viewDate
                };
                spinner.forPromise(appointmentsService.getAllAppointments(params).then(function (response) {
                    $scope.appointments = response.data;
                    $scope.filteredAppointments = appointmentsFilter($scope.appointments, $stateParams.filterParams);
                }));
            };

            $scope.displaySearchedPatient = function (appointments) {
                oldPatientData = $scope.filteredAppointments;
                $scope.filteredAppointments = appointments;
                $scope.searchedPatient = true;
            };

            $scope.goBackToPreviousView = function () {
                $scope.searchedPatient = false;
                $scope.filteredAppointments = oldPatientData;
            };

            $scope.isSelected = function (appointment) {
                return $scope.selectedAppointment === appointment;
            };

            $scope.select = function (appointment) {
                if ($scope.isSelected(appointment)) {
                    $scope.selectedAppointment = undefined;
                    return;
                }
                $scope.selectedAppointment = appointment;
            };

            $scope.isWalkIn = function (appointmentType) {
                return appointmentType === 'WalkIn' ? 'Yes' : 'No';
            };

            $scope.editAppointment = function () {
                $state.go('home.manage.appointments.list.edit', {
                    appointment: $scope.selectedAppointment,
                    uuid: $scope.selectedAppointment.uuid
                });
            };

            $scope.$watch(function () {
                return $stateParams.filterParams;
            }, function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $scope.filteredAppointments = appointmentsFilter($scope.appointments, $stateParams.filterParams);
                }
            }, true);

            init();
        }]);
