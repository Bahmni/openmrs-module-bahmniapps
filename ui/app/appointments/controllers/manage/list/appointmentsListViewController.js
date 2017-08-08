'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsListViewController', ['$scope', 'spinner', 'appointmentsService', 'appService',
        function ($scope, spinner, appointmentsService, appService) {
            $scope.startDate = moment().startOf('day').toDate();
            $scope.enableServiceTypes = appService.getAppDescriptor().getConfigValue('enableServiceTypes');
            var init = function () {
                return $scope.getAppointmentsForDate($scope.startDate);
            };

            $scope.getAppointmentsForDate = function (viewDate) {
                $scope.selectedAppointment = undefined;
                var params = {
                    forDate: viewDate
                };
                var promise = appointmentsService.getAllAppointments(params).then(function (response) {
                    $scope.appointments = response.data;
                });
                spinner.forPromise(promise);
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
