'use strict';

angular.module('bahmni.appointments')
    .service('appointmentCommonService', ['$rootScope', 'ngDialog', '$state', '$translate', 'appointmentsService',
        'confirmBox', 'checkinPopUp', 'appService', 'messagingService',
        function ($rootScope, ngDialog, $state, $translate, appointmentsService, confirmBox, checkinPopUp, appService, messagingService) {
            var manageAppointmentPrivilege = Bahmni.Appointments.Constants.privilegeManageAppointments;
            var ownAppointmentPrivilege = Bahmni.Appointments.Constants.privilegeOwnAppointments;

            this.isCurrentUserHasPrivilege = function (privilege, currentUserPrivileges) {
                return !_.isUndefined(_.find(currentUserPrivileges, function (userPrivilege) {
                    return userPrivilege.name === privilege;
                }));
            };

            var isOwnPrivilegedUserAllowedToPerformEdit = function (appointmentProvider, currentProviderUuId) {
                return _.isEmpty(appointmentProvider) ||
                    !_.isUndefined(_.find(appointmentProvider, function (provider) {
                        return provider.uuid === currentProviderUuId && provider.response === "ACCEPTED";
                    }));
            };

            this.isUserAllowedToPerformEdit = function (appointmentProvider, currentUserPrivileges, currentProviderUuId) {
                return this.isCurrentUserHasPrivilege(manageAppointmentPrivilege, currentUserPrivileges)
                    ? true : this.isCurrentUserHasPrivilege(ownAppointmentPrivilege, currentUserPrivileges)
                        ? isOwnPrivilegedUserAllowedToPerformEdit(appointmentProvider, currentProviderUuId) : false;
            };
        }]);
