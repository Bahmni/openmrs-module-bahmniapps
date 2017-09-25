'use strict';

angular.module('bahmni.appointments')
    .service('calendarViewPopUp', ['$rootScope', 'ngDialog', '$state', '$translate', 'appointmentsService',
        'confirmBox', 'checkinPopUp',
        function ($rootScope, ngDialog, $state, $translate, appointmentsService, confirmBox, checkinPopUp) {
            var calendarViewPopUp = function (config) {
                var popUpScope = $rootScope.$new();
                var dialog;
                var scope = config.scope;
                scope.patientList = scope.appointments.map(function (appt) {
                    return appt.patient;
                });

                scope.patientAppointmentMap = scope.appointments.reduce(function (result, appt) {
                    result[appt.patient.uuid] = appt;
                    return result;
                }, {});

                popUpScope.scope = scope;
                popUpScope.patient = scope.patientList.length === 1 ? scope.patientList[0] : undefined;
                popUpScope.manageAppointmentPrivilege = Bahmni.Appointments.Constants.privilegeManageAppointments;

                popUpScope.checkinAppointment = function (patientAppointment) {
                    checkinPopUp({
                        scope: {
                            patientAppointment: patientAppointment,
                            confirmAction: confirmActionCurrent
                        },
                        className: "ngdialog-theme-default app-dialog-container"
                    });
                };

                popUpScope.navigateTo = function (state) {
                    var params = $state.params;
                    if (state === 'edit') {
                        ngDialog.close(dialog.id, false);
                        params.uuid = scope.patientAppointmentMap[popUpScope.patient.uuid].uuid;
                        $state.go('home.manage.appointments.calendar.edit', params, {reload: false});
                    } else if (state === 'new') {
                        ngDialog.close(dialog.id, false);
                        params.appointment = { startDateTime: scope.appointments[0].startDateTime,
                            endDateTime: scope.appointments[0].endDateTime,
                            provider: scope.appointments[0].provider,
                            appointmentKind: 'Scheduled'
                        };
                        $state.go('home.manage.appointments.calendar.new', params, {reload: false});
                    } else {
                        $state.go($state.current, $state.params, {reload: true});
                    }
                    popUpScope.$destroy();
                };

                popUpScope.confirmAction = function (appointment, toStatus, onDate) {
                    var scope = {};
                    scope.message = $translate.instant('APPOINTMENT_STATUS_CHANGE_CONFIRM_MESSAGE', {
                        toStatus: toStatus
                    });

                    var closeConfirmBox = function (closeConfirmBox) {
                        closeConfirmBox();
                    };

                    var changeStatus = function (appointment, toStatus, closeConfirmBox) {
                        return appointmentsService.changeStatus(appointment.uuid, toStatus, onDate).then(function () {
                            ngDialog.close();
                            appointment.status = toStatus;
                        }).then(closeConfirmBox);
                    };

                    scope.no = closeConfirmBox;
                    scope.yes = _.partial(changeStatus, appointment, toStatus, _);
                    confirmBox({
                        scope: scope,
                        actions: [{name: 'yes', display: 'YES_KEY'}, {name: 'no', display: 'NO_KEY'}],
                        className: "ngdialog-theme-default"
                    });
                };

                dialog = ngDialog.open({
                    template: '../appointments/views/manage/calendar/popUp.html',
                    scope: popUpScope,
                    className: config.className || 'ngdialog-theme-default'
                });

                dialog.closePromise.then(function (data) {
                    if (data.value !== false) {
                        popUpScope.navigateTo('calendar');
                    }
                });
                var confirmActionCurrent = function (toStatus, onDate) {
                    popUpScope.confirmAction(scope.patientAppointmentMap[popUpScope.patient.uuid], toStatus, onDate);
                };
            };
            return calendarViewPopUp;
        }]);
