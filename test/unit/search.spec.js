'use strict';

describe('SearchPatientController', function () {
    describe('search', function () {
        var success = jasmine.createSpy('Successful call');
        var patientResource = {},
            scope = {},
            $controller;

        beforeEach(angular.mock.module('registration.search'));
        beforeEach(angular.mock.inject(function ($injector) {
            $controller = $injector.get('$controller');
        }));

        it('should use the patient resource to search for patients', function () {
            patientResource.search = jasmine.createSpy('Patient Resource GET').andReturn({success: success});
            var query = 'john';
            scope.query = query;

            $controller('SearchPatientController', {
                $scope: scope,
                patient: patientResource,
            });

            scope.search();

            expect(patientResource.search).toHaveBeenCalled();
            expect(patientResource.search.mostRecentCall.args[0]).toBe(query);
            expect(success).toHaveBeenCalled();
        });
    });
});