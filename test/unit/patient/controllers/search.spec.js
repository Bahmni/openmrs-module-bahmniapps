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
        $window = $injector.get('$window');
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

        it('should set the name with query load patients if a query parameter is provided', function() {
            var query = 'john';
            spyOn(location, 'search').andReturn({"q": query});

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
            expect(spinner.forPromise).toHaveBeenCalledWith(searchPromise);
        });

        it('should show the spinner while searching', function() {
            spyOn(location, 'search').andReturn({"q": "foo"});

            $controller('SearchPatientController', {
                $scope: scope,
                patientService: patientResource,
                $location: location,
                spinner: spinner
            });

            expect(spinner.forPromise).toHaveBeenCalledWith(searchPromise);
        });

        it('should load patients if a query parameter is provided', function() {
            spyOn(location, 'search').andReturn({});

            $controller('SearchPatientController', {
                $scope: scope,
                patientService: patientResource,
                $location: location
            });

            expect(patientResource.search).not.toHaveBeenCalled();
        });
    });

    describe("noResutFound", function(){
        it("should be false when no search done", function(){
            expect(scope.noResultsFound()).toBe(false);
        });

        it("should be true when search returns zero results", function(){
            scope.results = []

            expect(scope.noResultsFound()).toBe(true);
        });

        it("should be false when search returns results", function(){
            scope.results = [{}]

            expect(scope.noResultsFound()).toBe(false);
        });
    });

    describe("search", function(){
        it("should search by name when registration number is not enetered", function(){
            scope.registrationNumber = ""
            scope.name = "Ram Singh"
            spyOn(location, 'search');

            scope.search();

            expect(location.search).toHaveBeenCalledWith('q', "Ram Singh");
        });

        it("should search patient by given center and registration number when registration number is present", function(){
            scope.centerId = "GAN";
            scope.registrationNumber = "20001";

            scope.search();

            expect(patientResource.search).toHaveBeenCalledWith('GAN20001');
        });

        it('should show the spinner while searching by Id', function() {
            scope.centerId = "GAN";
            scope.registrationNumber = "20001";

            scope.search();

            expect(spinner.forPromise).toHaveBeenCalledWith(searchPromise);
        });

        describe("by Id on success", function(){
            beforeEach(function(){
                scope.centerId = "GAN";
                scope.registrationNumber = "20001";
                scope.search();
            });

            it("should go to edit Patient when a patient is found", function(){
                spyOn(location, 'search');
                spyOn(location, 'path');

                searchPromise.callSuccesCallBack({results: [{uuid: "8989-90909"}]})

                expect(location.search).toHaveBeenCalledWith({});
                expect(location.path).toHaveBeenCalledWith("/patient/8989-90909");
            });

            it("should display patient message when patient not found", function(){
                spyOn($window, 'alert');

                searchPromise.callSuccesCallBack({results: []})

                expect($window.alert).toHaveBeenCalled();
                expect($window.alert.mostRecentCall.args[0]).toMatch(".*Could not .* GAN20001");
            });
        });
    });
});