'use strict';

describe('SearchPatientController', function () {
    var patientResource,
        searchPromise,
        rootScope,
        scope,
        location,
        $window,
        $controller,
        spinner,
        loader,
        appService;

    beforeEach(angular.mock.module('registration.patient.controllers'));
    beforeEach(angular.mock.inject(function ($injector) {
        $controller = $injector.get('$controller');
        rootScope = $injector.get('$rootScope');
        location = $injector.get('$location');
        $window = {history: {pushState: function(){}}};
    }));

    beforeEach(function(){
        scope = rootScope.$new();
        patientResource = jasmine.createSpyObj('patientService', ['search']);
        searchPromise = specUtil.createServicePromise('search');
        patientResource.search.andReturn(searchPromise);
        spinner = jasmine.createSpyObj('spinner', ['show', 'hide', 'forPromise']);
        loader = jasmine.createSpyObj('loader', ['show', 'hide', 'forPromise']);
        appService = jasmine.createSpyObj('appService', ['allowedAppExtensions']);
        $controller('SearchPatientController', {
            $scope: scope,
            patientService: patientResource,
            $location: location,
            $window: $window,
            spinner: spinner,
            loader: loader,
            appService: appService
        });
    });

    describe('init', function() {
        it("should default the center id", function(){
            defaults.centerId = "SEM";

            $controller('SearchPatientController', {
                $scope: scope,
                patientService: patientResource,
                $location: location,
                spinner: spinner,
                appService: appService
            });

            expect(scope.centerId).toBe("SEM");
        });

        describe("On changing the search parameter in url", function(){
            var urlSearchChangeCallback;

            beforeEach(function(){
                spyOn(scope, '$watch')
                $controller('SearchPatientController', {
                    $scope: scope,
                    patientService: patientResource,
                    $location: location,
                    spinner: spinner,
                    loader: loader,
                    appService: appService
                });
                urlSearchChangeCallback = scope.$watch.mostRecentCall.args[1];
            });

            it('should initialize scope with name search params from url and load the patients if a name search parameter is provided', function() {
                var searchParams = {"name": 'john', village: 'Kanpur'};
                spyOn(location, 'search').andReturn(searchParams);

                urlSearchChangeCallback();

                expect(scope.name).toBe(searchParams.name);
                expect(scope.village).toBe(searchParams.village);
                expect(patientResource.search).toHaveBeenCalled();
                expect(patientResource.search.mostRecentCall.args[0]).toBe(searchParams.name);
                expect(patientResource.search.mostRecentCall.args[1]).toBe(searchParams.village);
                expect(searchPromise.success).toHaveBeenCalled();
            });

            it('should initialize scope with id search params from url but do not search for patient', function() {
                var searchParams = {"centerId": 'GAN', registrationNumber: '200001'};
                spyOn(location, 'search').andReturn(searchParams);

                urlSearchChangeCallback();

                expect(scope.centerId).toBe(searchParams.centerId);
                expect(scope.registrationNumber).toBe(searchParams.registrationNumber);
                expect(patientResource.search).not.toHaveBeenCalled();
            });

            it('should show the spinner while searching', function() {
                spyOn(location, 'search').andReturn({"name": "foo"});

                urlSearchChangeCallback();

                expect(loader.forPromise).toHaveBeenCalledWith(searchPromise);
            });

            it('should not search for patients if search parameter is not provided', function() {
                spyOn(location, 'search').andReturn({});

                urlSearchChangeCallback();

                expect(patientResource.search).not.toHaveBeenCalled();
            });

            describe("on success", function(){
                beforeEach(function(){
                    spyOn(location, 'search').andReturn({"name": "foo"});
                    urlSearchChangeCallback();
                });

                it("should set the search results", function(){
                    var results = [{uuid: "8989-90909"}];

                    searchPromise.callSuccessCallBack({results: results})

                    expect(scope.results).toBe(results);
                });

                it("should not show the 'no results found message' when patient is found", function(){
                    var results = [{uuid: "8989-90909"}];

                    searchPromise.callSuccessCallBack({results: results})

                    expect(scope.noResultsMessage).toBe(null);
                });

                it("should show 'no results found message' when patient is not found", function(){
                    var results = [];

                    searchPromise.callSuccessCallBack({results: results})

                    expect(scope.noResultsMessage).toMatch("No results");
                });
            });
        });
    });

    describe("searchByVillageAndName", function(){
        it("should go to search page with name", function(){
            scope.name = "Ram Singh"
            spyOn(location, 'search');

            scope.searchByVillageAndName();

            expect(location.search).toHaveBeenCalledWith({'name': "Ram Singh"});
        });

        it("should go to search page with village", function(){
            scope.village = "Bilaspur"
            spyOn(location, 'search');

            scope.searchByVillageAndName();

            expect(location.search).toHaveBeenCalledWith({'village': "Bilaspur"});
        });
    });

    describe("searchById", function(){
        it('should search by patient identifier when registrationNumber is present', function() {
            scope.centerId = "GAN";
            scope.registrationNumber = "20001";

            scope.searchById();

            expect(patientResource.search).toHaveBeenCalledWith("GAN20001");
        });

        it('should show the spinner while searching', function() {
            scope.centerId = "GAN";
            scope.registrationNumber = "20001";

            scope.searchById();

            expect(spinner.show).toHaveBeenCalled();
        });

        it('should change the search parameter to patient identifier', function() {
            spyOn(location, 'search');
            scope.centerId = "GAN";
            scope.registrationNumber = "20001";

            scope.searchById();

            expect(location.search).toHaveBeenCalledWith({centerId: "GAN", registrationNumber: "20001"});
        });

        it('should not search if registrationNumber is not present', function() {
            scope.centerId = "GAN";
            scope.registrationNumber = "";

            scope.searchById();

            expect(patientResource.search).not.toHaveBeenCalled();
        });

        describe("on success", function(){
            beforeEach(function(){
                scope.centerId = "GAN";
                scope.registrationNumber = "20001";
                scope.searchById();
            });

            it("should go to edit patient without hiding spinner when a patient is found", function(){
                spyOn(location, 'search');
                spyOn(location, 'path');

                searchPromise.callSuccessCallBack({results: [{uuid: "8989-90909"}]})

                expect(location.path).toHaveBeenCalledWith("/patient/8989-90909");
                expect(spinner.hide).not.toHaveBeenCalled();
            });

            it("should show 'no patient found message' and hide the spinner when patient is not found", function(){
                searchPromise.callSuccessCallBack({results: []})

                expect(scope.noResultsMessage).toMatch("Could not find patient with identifier GAN20001");
                expect(spinner.hide).toHaveBeenCalled();
            });
        });

        describe("on error", function(){
            beforeEach(function(){
                scope.centerId = "GAN";
                scope.registrationNumber = "20001";
                scope.searchById();
            });

            it("should hide the spinner", function(){
                searchPromise.callErrorCallBack({})

                expect(spinner.hide).toHaveBeenCalled();
            });
        });
    });
});