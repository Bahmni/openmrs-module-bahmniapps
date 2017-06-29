'use strict';

describe("AppointmentsHeaderController", function () {
    var appointmentsHeaderController, state, scope;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope, $state) {
            scope = $rootScope.$new();
            state = $state;
            appointmentsHeaderController = $controller('AppointmentsHeaderController', {
                $scope: scope,
                $state: state
            }
            );
        });
    });

    it('should add backlinks on initialization', function () {
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
            state: 'home.admin',
            accessKey: 'A'
        }];
        expect(state.get('home').data.backLinks).toEqual(backLinks);
    });
});
