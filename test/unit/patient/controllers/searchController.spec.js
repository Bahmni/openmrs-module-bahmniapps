'use strict';

describe('SearchPatientController', function () {
    var patientResource,
        searchPromise,
        scope = {},
        location,
        $window,
        $controller,
        spinner;

    beforeEach(angular.mock.module('registration.search'));
    beforeEach(angular.mock.inject(function ($injector) {
        $controller = $injector.get('$controller');
        location = $injector.get('$location');
        $window = {history: {pushState: function(){}}};
    }));

    beforeEach(function(){
        patientResource = jasmine.createSpyObj('patientService', ['search']),
        searchPromise = specUtil.createServicePromise('search');
        patientResource.search.andReturn(searchPromise);
        spinner = jasmine.createSpyObj('spinner', ['forPromise'])
        $controller('SearchPatientController', {
            $scope: scope,
            patientService: patientResource,
            $location: location,
            $window: $window,
            spinner: spinner
        });
    });

    describe('init', function() {
        it("should default the center id", function(){
            defaults.centerId = "SEM";

            $controller('SearchPatientController', {
                $scope: scope,
                patientService: patientResource,
                $location: location,
                spinner: spinner
            });

            expect(scope.centerId).toBe("SEM");
        });

        it('should set the name with query and load the patients if a query parameter is provided', function() {
            var query = 'john';
            spyOn(location, 'search').andReturn({"name": query});

            $controller('SearchPatientController', {
                $scope: scope,
                patientService: patientResource,
                $location: location,
                spinner: spinner
            });

            expect(scope.name).toBe(query);
            expect(patientResource.search).toHaveBeenCalled();
            expect(patientResource.search.mostRecentCall.args[0]).toBe(query);
            expect(searchPromise.success).toHaveBeenCalled();
        });

        it('should show the spinner while searching', function() {
            spyOn(location, 'search').andReturn({"name": "foo"});

            $controller('SearchPatientController', {
                $scope: scope,
                patientService: patientResource,
                $location: location,
                spinner: spinner
            });

            expect(spinner.forPromise).toHaveBeenCalledWith(searchPromise);
        });

        it('should not search for patients if search parameter is not provided', function() {
            spyOn(location, 'search').andReturn({});

            $controller('SearchPatientController', {
                $scope: scope,
                patientService: patientResource,
                $location: location
            });

            expect(patientResource.search).not.toHaveBeenCalled();
        });

        describe("on success", function(){
            beforeEach(function(){
                spyOn(location, 'search').andReturn({"name": "foo"});

                $controller('SearchPatientController', {
                    $scope: scope,
                    patientService: patientResource,
                    $location: location,
                    spinner: spinner
                });
            });

            it("should set the search results", function(){
                var results = [{uuid: "8989-90909"}];

                searchPromise.callSuccesCallBack({results: results})

                expect(scope.results).toBe(results);
            });

            it("should not show the 'no results found message' when patient is found", function(){
                var results = [{uuid: "8989-90909"}];

                searchPromise.callSuccesCallBack({results: results})

                expect(scope.noResultsMessage).toBe(null);
            });

            it("should show 'no results found message' when patient is not found", function(){
                var results = [];

                searchPromise.callSuccesCallBack({results: results})

                expect(scope.noResultsMessage).toMatch("No results");
            });
        });
    });

    describe("searchByName", function(){
        it("should go to search page with name", function(){
            scope.name = "Ram Singh"
            spyOn(location, 'search');

            scope.searchByName();

            expect(location.search).toHaveBeenCalledWith('name', "Ram Singh");
        });
    });

    describe("searchById", function(){
        it('should show the spinner while searching', function() {
            scope.centerId = "GAN";
            scope.registrationNumber = "20001";

            scope.searchById();

            expect(spinner.forPromise).toHaveBeenCalledWith(searchPromise);
        });

        describe("on success", function(){
            beforeEach(function(){
                scope.centerId = "GAN";
                scope.registrationNumber = "20001";
                scope.searchById();
            });

            it("should go to edit Patient when a patient is found", function(){
                spyOn(location, 'search');
                spyOn(location, 'path');

                searchPromise.callSuccesCallBack({results: [{uuid: "8989-90909"}]})

                expect(location.path).toHaveBeenCalledWith("/patient/8989-90909");
            });

            it("should show 'no patient found message' when patient is not found", function(){
                spyOn(location, 'search');
                spyOn(location, 'path');

                searchPromise.callSuccesCallBack({results: []})

                expect(scope.noResultsMessage).toMatch("Could not find patient with identifier GAN20001");
            });
        });
    });
});