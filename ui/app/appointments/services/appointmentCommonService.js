'use strict';

angular.module('bahmni.appointments')
    .service('appointmentCommonService', ['$rootScope', 'ngDialog', '$state', '$translate', 'appointmentsService',
        'confirmBox', 'checkinPopUp', 'appService', 'messagingService',
        function ($rootScope, ngDialog, $state, $translate, appointmentsService, confirmBox, checkinPopUp, appService, messagingService) {
            this.isCurrentUserHavingPrivilege = function (privilege, currentUserPrivileges) {
                return !_.isUndefined(_.find(currentUserPrivileges, function (userPrivilege) {
                    return userPrivilege.name === privilege;
                }));
            };

            var isOwnPrivilegedUserAllowedToPerformEdit = function (appointmentProviders, currentProviderUuId) {
                return _.isEmpty(appointmentProviders) ||
                    !_.isUndefined(_.find(appointmentProviders, function (provider) {
                        return provider.uuid === currentProviderUuId && provider.response === "ACCEPTED";
                    })) || _.isUndefined(_.find(appointmentProviders, function (provider) {
                        return provider.response == "ACCEPTED";
                    }));
            };

            this.isUserAllowedToPerformEdit = function (appointmentProviders, currentUserPrivileges, currentProviderUuId) {
                return this.isCurrentUserHavingPrivilege(Bahmni.Appointments.Constants.privilegeManageAppointments, currentUserPrivileges)
                    ? true : this.isCurrentUserHavingPrivilege(Bahmni.Appointments.Constants.privilegeOwnAppointments, currentUserPrivileges)
                        ? isOwnPrivilegedUserAllowedToPerformEdit(appointmentProviders, currentProviderUuId) : false;
            };
        }]);
