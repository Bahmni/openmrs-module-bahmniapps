'use strict';

angular.module('bahmni.appointments')
    .controller('AppointmentsListViewController', ['$scope', '$state', '$rootScope', '$translate', '$stateParams', 'spinner',
        'appointmentsService', 'appService', 'appointmentsFilter', 'printer', 'checkinPopUp', 'confirmBox', 'ngDialog',
        function ($scope, $state, $rootScope, $translate, $stateParams, spinner, appointmentsService, appService,
                  appointmentsFilter, printer, checkinPopUp, confirmBox, ngDialog) {
            $scope.enableSpecialities = appService.getAppDescriptor().getConfigValue('enableSpecialities');
            $scope.enableServiceTypes = appService.getAppDescriptor().getConfigValue('enableServiceTypes');
            $scope.searchedPatient = false;
            var oldPatientData = [];
            $scope.$on('filterClosedOpen', function (event, args) {
                $scope.isFilterOpen = args.filterViewStatus;
            });
            $scope.tableInfo = [{heading: 'APPOINTMENT_PATIENT_ID', sortInfo: 'patient.identifier', enable: true},
                {heading: 'APPOINTMENT_PATIENT_NAME', sortInfo: 'patient.name', class: true, enable: true},
                {heading: 'APPOINTMENT_DATE', sortInfo: 'appointmentDate', enable: true},
                {heading: 'APPOINTMENT_START_TIME_KEY', sortInfo: 'startDateTime', enable: true},
                {heading: 'APPOINTMENT_END_TIME_KEY', sortInfo: 'endDateTime', enable: true},
                {heading: 'APPOINTMENT_PROVIDER', sortInfo: 'provider.name', class: true, enable: true},
                {heading: 'APPOINTMENT_SERVICE_SPECIALITY_KEY', sortInfo: 'service.speciality.name', enable: $scope.enableSpecialities},
                {heading: 'APPOINTMENT_SERVICE', sortInfo: 'service.name', class: true, enable: true},
                {heading: 'APPOINTMENT_SERVICE_TYPE_FULL', sortInfo: 'service.serviceType.name', class: true, enable: $scope.enableServiceTypes},
                {heading: 'APPOINTMENT_WALK_IN', sortInfo: 'appointmentKind', enable: true},
                {heading: 'APPOINTMENT_SERVICE_LOCATION_KEY', sortInfo: 'service.location.name', class: true, enable: true},
                {heading: 'APPOINTMENT_STATUS', sortInfo: 'status', enable: true},
                {heading: 'APPOINTMENT_CREATE_NOTES', sortInfo: 'comments', enable: true}];
            var init = function () {
                $scope.startDate = $stateParams.viewDate || moment().startOf('day').toDate();
                $scope.isFilterOpen = $stateParams.isFilterOpen;
                return $scope.getAppointmentsForDate($scope.startDate);
            };

            $scope.getAppointmentsForDate = function (viewDate) {
                $stateParams.viewDate = viewDate;
                $scope.selectedAppointment = undefined;
                var params = {forDate: viewDate};
                spinner.forPromise(appointmentsService.getAllAppointments(params).then(function (response) {
                    $scope.appointments = response.data;
                    $scope.filteredAppointments = appointmentsFilter($scope.appointments, $stateParams.filterParams);
                }));
            };

            $scope.displaySearchedPatient = function (appointments) {
                oldPatientData = $scope.filteredAppointments;
                $scope.filteredAppointments = appointments;
                $scope.searchedPatient = true;
                $stateParams.isFilterOpen = false;
                $stateParams.isSearchEnabled = true;
                $scope.isNoSearchResult = false;
                if ($scope.filteredAppointments.length === 0) {
                    $scope.isNoSearchResult = true;
                }
            };

            $scope.goBackToPreviousView = function () {
                $scope.searchedPatient = false;
                $scope.isNoSearchResult = false;
                $scope.filteredAppointments = oldPatientData;
                $stateParams.isFilterOpen = true;
                $stateParams.isSearchEnabled = false;
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
                    uuid: $scope.selectedAppointment.uuid
                });
            };

            $scope.checkinAppointment = function () {
                checkinPopUp({
                    scope: {
                        patientAppointment: $scope.selectedAppointment,
                        confirmAction: $scope.confirmAction
                    },
                    className: "ngdialog-theme-default app-dialog-container"
                });
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

            $scope.printPage = function () {
                var printTemplateUrl = appService.getAppDescriptor().getConfigValue("printListViewTemplateUrl") || 'views/manage/list/listView.html';
                printer.print(printTemplateUrl, {
                    filteredAppointments: $scope.filteredAppointments,
                    startDate: $scope.startDate,
                    enableServiceTypes: $scope.enableServiceTypes,
                    enableSpecialities: $scope.enableSpecialities
                });
            };

            $scope.confirmAction = function (toStatus, onDate) {
                var closeConfirmBox = function (closeConfirmBox) {
                    closeConfirmBox();
                };

                var changeStatus = function (toStatus, closeConfirmBox) {
                    return appointmentsService.changeStatus($scope.selectedAppointment.uuid, toStatus, onDate).then(function () {
                        ngDialog.close();
                        $state.go($state.current, $state.params, {reload: true});
                    }).then(closeConfirmBox);
                };
                var scope = {};
                scope.message = $translate.instant('APPOINTMENT_STATUS_CHANGE_CONFIRM_MESSAGE', {
                    toStatus: toStatus
                });
                scope.no = closeConfirmBox;
                scope.yes = _.partial(changeStatus, toStatus, _);
                confirmBox({
                    scope: scope,
                    actions: [{name: 'yes', display: 'YES_KEY'}, {name: 'no', display: 'NO_KEY'}],
                    className: "ngdialog-theme-default"
                });
            };

            init();
        }]);
