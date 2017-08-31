'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsListViewController', ['$scope', '$state', '$stateParams', 'spinner', 'appointmentsService', 'appService', 'appointmentsFilter',
        function ($scope, $state, $stateParams, spinner, appointmentsService, appService, appointmentsFilter) {
            $scope.tableInfo = [{heading: 'APPOINTMENT_PATIENT_ID', sortInfo: 'patient.identifier'},
                {heading: 'APPOINTMENT_PATIENT_NAME', sortInfo: 'patient.name', class: true},
                {heading: 'APPOINTMENT_DATE', sortInfo: 'appointmentDate'},
                {heading: 'APPOINTMENT_START_TIME_KEY', sortInfo: 'startDateTime'},
                {heading: 'APPOINTMENT_END_TIME_KEY', sortInfo: 'endDateTime'},
                {heading: 'APPOINTMENT_PROVIDER', sortInfo: 'provider.name', class: true},
                {heading: 'APPOINTMENT_SERVICE_SPECIALITY_KEY', sortInfo: 'service.speciality.name'},
                {heading: 'APPOINTMENT_SERVICE', sortInfo: 'service.name'},
                {heading: 'APPOINTMENT_SERVICE_TYPE_FULL', sortInfo: 'service.serviceType.name', class: true},
                {heading: 'APPOINTMENT_WALK_IN', sortInfo: 'appointmentKind'},
                {heading: 'APPOINTMENT_SERVICE_LOCATION_KEY', sortInfo: 'service.location.name', class: true},
                {heading: 'APPOINTMENT_STATUS', sortInfo: 'status'},
                {heading: 'APPOINTMENT_CREATE_NOTES', sortInfo: 'comments'}];

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
                    $scope.filteredAppointments = appointmentsFilter($scope.appointments, $stateParams.filterParams);
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

            $scope.editAppointment = function () {
                $state.go('home.manage.appointments.list.edit', {appointment: $scope.selectedAppointment, uuid: $scope.selectedAppointment.uuid});
            };

            $scope.$watch(function () {
                return $stateParams.filterParams;
            }, function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    $scope.filteredAppointments = appointmentsFilter($scope.appointments, $stateParams.filterParams);
                }
            }, true);

            $scope.sortSurgicalAppointmentsBy = function (sortColumn) {
                var emptyObjects = _.filter($scope.filteredAppointments, function (appointment) {
                    return !_.property(sortColumn)(appointment);
                });
                var nonEmptyObjects = _.difference($scope.filteredAppointments, emptyObjects);
                var sortedNonEmptyObjects = _.sortBy(nonEmptyObjects, sortColumn);
                if ($scope.reverseSort) {
                    sortedNonEmptyObjects.reverse();
                }
                $scope.filteredAppointments = sortedNonEmptyObjects.concat(emptyObjects);
                $scope.sortColumn = sortColumn;
                $scope.reverseSort = !$scope.reverseSort;
            };

            init();
        }]);
