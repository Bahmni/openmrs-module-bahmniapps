'use strict';

describe("AppointmentsHeaderController", function () {
    var controller, state, scope, appService, appDescriptor;

    appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    appDescriptor = jasmine.createSpyObj('appDescriptor', ['getExtensionById']);
    appService.getAppDescriptor.and.returnValue(appDescriptor);

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope, $state) {
            scope = $rootScope.$new();
            state = $state;
            controller = $controller;
        });
    });

    var createController = function () {
        controller('AppointmentsHeaderController', {
            $scope: scope,
            $state: state,
            appService: appService
        }
      );
    };

    it('should add all backlinks if configured on initialization', function () {
        appDescriptor.getExtensionById.and.returnValue({});
        createController();
        var backLinks = [{
            label: 'Home',
            url: '../home/',
            accessKey: 'h',
            icon: 'fa-home'
        }, {
            text: 'APPOINTMENTS_MANAGE',
            state: 'home.manage',
            accessKey: 'M'
        }, {
            text: 'APPOINTMENTS_ADMIN',
            state: 'home.admin.service',
            accessKey: 'A',
            requiredPrivilege: Bahmni.Appointments.Constants.privilegeForAdmin
        }];
        expect(appService.getAppDescriptor).toHaveBeenCalled();
        expect(appDescriptor.getExtensionById).toHaveBeenCalledWith('bahmni.appointments.admin', true);
        expect(state.get('home').data.backLinks.length).toBe(3);
        expect(state.get('home').data.backLinks).toEqual(backLinks);
    });

    it('should not add admin link if not configured', function () {
        appDescriptor.getExtensionById.and.returnValue(undefined);
        createController();
        var backLinks = [{
            label: 'Home',
            url: '../home/',
            accessKey: 'h',
            icon: 'fa-home'
        }, {
            text: 'APPOINTMENTS_MANAGE',
            state: 'home.manage',
            accessKey: 'M'
        }];
        expect(state.get('home').data.backLinks.length).toBe(2);
        expect(state.get('home').data.backLinks).toEqual(backLinks);
    });
});
