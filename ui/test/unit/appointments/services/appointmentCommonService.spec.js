'use strict';

describe('AppointmentCommonService', function () {
    var appointmentCommonService;

    beforeEach(function () {
        module('bahmni.appointments');
    });

    beforeEach(inject(['appointmentCommonService', function (appointmentCommonServiceInjected) {
        appointmentCommonService = appointmentCommonServiceInjected;
    }]));

    describe('isCurrentUserHavingPrivilege', function () {
        it('should return true if current user does not have the given privilege ', function () {
            var privilege = 'testPrivilege';
            var currentUserPrivileges = [{name: Bahmni.Appointments.Constants.privilegeManageAppointments},
                {name: 'testPrivilege'}];
            expect(appointmentCommonService.isCurrentUserHavingPrivilege(privilege, currentUserPrivileges)).toBeTruthy();
        });
        it('should return false if current user does not have the given privilege ', function () {
            var privilege = 'testPrivilege';
            var currentUserPrivileges = [{name: Bahmni.Appointments.Constants.privilegeManageAppointments}];
            expect(appointmentCommonService.isCurrentUserHavingPrivilege(privilege, currentUserPrivileges)).toBeFalsy();
        });
    });

    describe('isUserAllowedToPerformEdit', function () {
        it('should return true if currentUser has manageAppointments privilege', function () {
            var currentUser = {
                privileges: [{
                    name: Bahmni.Appointments.Constants.privilegeManageAppointments
                }]
            };
            var appointmentProvider = {uuid: 'provider1Uuid'};
            var currentProvider = {uuid: 'providerUuId'};

            expect(appointmentCommonService.isUserAllowedToPerformEdit(appointmentProvider,currentUser.privileges,currentProvider.uuid)).toBeTruthy();
        });

        it('should return false if currentUser does not have manage/ownAppointment privileges', function () {
            var currentUser = {privileges: []};
            var appointmentProvider = {uuid: 'provider1Uuid'};
            var currentProvider = {uuid: 'providerUuId'};
            expect(appointmentCommonService.isUserAllowedToPerformEdit(appointmentProvider,currentUser.privileges,currentProvider.uuid)).toBeFalsy();
        });

        it('should return true if currentUser has ownAppointment privilege and selected appointment\'s providers list is empty', function () {
            var currentUser = {
                privileges: [
                    {name: Bahmni.Appointments.Constants.privilegeOwnAppointments}
                ]
            };
            var appointmentProvider = [];
            var currentProvider = {uuid: 'providerUuId'};

            expect(appointmentCommonService.isUserAllowedToPerformEdit(appointmentProvider,currentUser.privileges,currentProvider.uuid)).toBeTruthy();
        });

        it('should return true if currentUser has ownAppointment privilege and is the provider in the selected appointment\'s providers list', function () {
            var currentUser = {
                privileges: [
                    {name: Bahmni.Appointments.Constants.privilegeOwnAppointments}
                ]
            };
            var appointmentProvider = [{uuid: 'providerUuId', response: 'ACCEPTED'}];
            var currentProvider = {uuid: 'providerUuId'};

            expect(appointmentCommonService.isUserAllowedToPerformEdit(appointmentProvider,currentUser.privileges,currentProvider.uuid)).toBeTruthy();
        });

        it('should return false if currentUser has ownAppointment privilege and is not the provider in the selected appointment\'s providers list', function () {
            var currentUser = {
                privileges: [
                    {name: Bahmni.Appointments.Constants.privilegeOwnAppointments}
                ]
            };
            var appointmentProvider = [{uuid: 'provider1UuId',response: 'ACCEPTED'}];
            var currentProvider={uuid: 'providerUuId'};

            expect(appointmentCommonService.isUserAllowedToPerformEdit(appointmentProvider,currentUser.privileges,currentProvider.uuid)).toBeFalsy();
        });
    });

});

