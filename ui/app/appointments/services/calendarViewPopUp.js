'use strict';

angular.module('bahmni.appointments')
    .service('calendarViewPopUp', ['$rootScope', 'ngDialog', '$state', '$translate', 'appointmentsService',
        'confirmBox', 'checkinPopUp', 'appService', 'messagingService',
        function ($rootScope, ngDialog, $state, $translate, appointmentsService, confirmBox, checkinPopUp, appService, messagingService) {
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
                popUpScope.ownAppointmentPrivilege = Bahmni.Appointments.Constants.privilegeOwnAppointments;
                popUpScope.allowedActions = appService.getAppDescriptor().getConfigValue('allowedActions') || [];
                popUpScope.allowedActionsByStatus = appService.getAppDescriptor().getConfigValue('allowedActionsByStatus') || {};

                popUpScope.navigateTo = function (state, appointment) {
                    var params = $state.params;
                    if (state === 'edit') {
                        ngDialog.close(dialog.id, false);
                        params.uuid = appointment.uuid;
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

                var closeConfirmBox = function (closeConfirmBox) {
                    closeConfirmBox();
                };

                var isCurrentUserHavePrivilege = function (privilege) {
                    return !_.isUndefined(_.find($rootScope.currentUser.privileges, function (userPrivilege) {
                        return userPrivilege.name === privilege;
                    }));
                };

                popUpScope.isUserAllowedToPerform = function () {
                    if (isCurrentUserHavePrivilege(popUpScope.manageAppointmentPrivilege)) {
                        return true;
                    }
                    else if (isCurrentUserHavePrivilege(popUpScope.ownAppointmentPrivilege)) {
                        return _.isNull(scope.appointments[0].provider) ||
                            scope.appointments[0].provider.uuid === $rootScope.currentProvider.uuid;
                    }
                    return false;
                };

                var changeStatus = function (appointment, toStatus, onDate, closeConfirmBox) {
                    var message = $translate.instant('APPOINTMENT_STATUS_CHANGE_SUCCESS_MESSAGE', {
                        toStatus: toStatus
                    });
                    return appointmentsService.changeStatus(appointment.uuid, toStatus, onDate).then(function () {
                        appointment.status = toStatus;
                        closeConfirmBox();
                        messagingService.showMessage('info', message);
                    });
                };

                popUpScope.checkinAppointment = function (patientAppointment) {
                    var scope = $rootScope.$new();
                    scope.message = $translate.instant('APPOINTMENT_STATUS_CHANGE_CONFIRM_MESSAGE', {
                        toStatus: 'CheckedIn'
                    });
                    scope.action = _.partial(changeStatus, patientAppointment, 'CheckedIn', _);
                    checkinPopUp({
                        scope: scope,
                        className: "ngdialog-theme-default app-dialog-container"
                    });
                };

                popUpScope.confirmAction = function (appointment, toStatus) {
                    var scope = {};
                    scope.message = $translate.instant('APPOINTMENT_STATUS_CHANGE_CONFIRM_MESSAGE', {
                        toStatus: toStatus
                    });
                    scope.no = closeConfirmBox;
                    scope.yes = _.partial(changeStatus, appointment, toStatus, undefined, _);
                    confirmBox({
                        scope: scope,
                        actions: [{name: 'yes', display: 'YES_KEY'}, {name: 'no', display: 'NO_KEY'}],
                        className: "ngdialog-theme-default"
                    });
                };

                popUpScope.isAllowedAction = function (action) {
                    return _.includes(popUpScope.allowedActions, action);
                };

                popUpScope.isValidAction = function (appointment, action) {
                    if (!appointment) {
                        return false;
                    }
                    if (!popUpScope.isUserAllowedToPerform()) {
                        return false;
                    }
                    var allowedActions = popUpScope.allowedActionsByStatus.hasOwnProperty(appointment.status) ? popUpScope.allowedActionsByStatus[appointment.status] : [];
                    return _.includes(allowedActions, action);
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
            };
            return calendarViewPopUp;
        }]);
