'use strict';

angular.module('bahmni.appointments')
    .service('calendarViewPopUp', ['$rootScope', 'ngDialog', '$state', '$translate', 'appointmentsService',
        'confirmBox', 'checkinPopUp', 'appService', 'messagingService', 'appointmentCommonService',
        function ($rootScope, ngDialog, $state, $translate, appointmentsService, confirmBox, checkinPopUp, appService, messagingService, appointmentCommonService) {
            var calendarViewPopUp = function (config) {
                var popUpScope = $rootScope.$new();
                var dialog;
                var scope = config.scope;
                var maxAppointmentProviders = appService.getAppDescriptor().getConfigValue('maxAppointmentProviders') || 1;
                var appointmentProviders = scope.appointments[0].providers;
                var currentUserPrivileges = $rootScope.currentUser.privileges;
                var currentProviderUuId = $rootScope.currentProvider.uuid;

                popUpScope.scope = scope;
                popUpScope.appointment = scope.appointments.length === 1 ? scope.appointments[0] : undefined;
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
                        $state.go($state.current, params, {reload: true});
                    }
                    popUpScope.$destroy();
                };

                var closeConfirmBox = function (closeConfirmBox) {
                    closeConfirmBox();
                };

                popUpScope.isUserAllowedToPerformEdit = function () {
                    return appointmentCommonService.isUserAllowedToPerformEdit(appointmentProviders, currentUserPrivileges, currentProviderUuId);
                };

                popUpScope.isEditAllowed = function () {
                    return maxAppointmentProviders > 1 ? true :
                        appointmentCommonService.isUserAllowedToPerformEdit(appointmentProviders, currentUserPrivileges, currentProviderUuId);
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

                popUpScope.isValidActionAndIsUserAllowedToPerformEdit = function (appointment, action) {
                    return !appointment ? false :
                        !appointmentCommonService.isUserAllowedToPerformEdit(appointmentProviders, currentUserPrivileges, currentProviderUuId)
                            ? false : isValidAction(appointment, action);
                };

                var isValidAction = function (appointment, action) {
                    var allowedActions = popUpScope.allowedActionsByStatus.hasOwnProperty(appointment.status) ? popUpScope.allowedActionsByStatus[appointment.status] : [];
                    return _.includes(allowedActions, action);
                };

                popUpScope.getAppointmentProviderNames = function (appointment) {
                    if (appointment.providers) {
                        var providerNames = appointment.providers.filter(function (p) {
                            return p.response !== Bahmni.Appointments.Constants.providerResponses.CANCELLED;
                        }).map(function (p) {
                            return p.name;
                        }).join(', ');
                        return providerNames;
                    }
                    return '';
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
