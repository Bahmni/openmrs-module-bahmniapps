'use strict';

describe("AppointmentsAdminController", function () {
    var appointmentsAdminController, location, scope;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function($controller, $rootScope, $location) {
            scope = $rootScope.$new();
            location = $location;
            appointmentsAdminController = $controller('AppointmentsAdminController', {
                    $scope: scope,
                    $location: location
                }
            );
        })});

    it('should navigate to add new service page', function () {
        scope.openService();
        expect(location.url()).toBe('/home/service/new');
    });

    it('should navigate to edit existing service', function () {
        scope.openService('service_uuid');
        expect(location.url()).toBe('/home/service/service_uuid');
    });
});