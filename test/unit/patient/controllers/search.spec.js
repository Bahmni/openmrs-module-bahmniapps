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

        describe('init', function() {
            it('should load patients if a query parameter is provided', function() {
                patientResource.search = jasmine.createSpy('Patient Resource GET').andReturn({success: success});
                var query = 'john';

                $controller('SearchPatientController', {
                    $scope: scope,
                    patientService: patientResource,
                    $location: {search: function(){return {"q": query}}}
                });

                expect(patientResource.search).toHaveBeenCalled();
                expect(patientResource.search.mostRecentCall.args[0]).toBe(query);
                expect(success).toHaveBeenCalled();
            });

            it('should load patients if a query parameter is provided', function() {
                patientResource.search = jasmine.createSpy('Patient Resource GET');

                $controller('SearchPatientController', {
                    $scope: scope,
                    patientService: patientResource,
                    $location: {search: function(){return {}}}
                });

                expect(patientResource.search.calls.length).toEqual(0);
            });
        });
    });
});