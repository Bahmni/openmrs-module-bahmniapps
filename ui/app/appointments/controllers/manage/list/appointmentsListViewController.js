'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsListViewController', ['$scope', '$stateParams', 'spinner', 'appointmentsService', 'appService',
        function ($scope, $stateParams, spinner, appointmentsService, appService) {
            $scope.enableSpecialities = appService.getAppDescriptor().getConfigValue('enableSpecialities');
            $scope.enableServiceTypes = appService.getAppDescriptor().getConfigValue('enableServiceTypes');
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
                }));
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

            init();
        }]);
