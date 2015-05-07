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
        appDescriptor,
        preferences,
        appService;

    beforeEach(angular.mock.module('bahmni.registration'));
    beforeEach(module('bahmni.common.routeErrorHandler'));
    beforeEach(angular.mock.inject(function ($injector) {
        $controller = $injector.get('$controller');
        rootScope = $injector.get('$rootScope');
        location = $injector.get('$location');
        $window = {history: {pushState: function () {
        }}};
        preferences = $injector.get('Preferences');
        rootScope.patientConfiguration = {};
        rootScope.patientConfiguration.identifierSources = [
            {name: 'GAN', prefix: 'GAN'},
            {name: 'SEM', prefix: 'SEM'},
            {name: 'SIV', prefix: 'SIV'},
            {name: 'BAM', prefix: 'BAM'}
        ];
    }));

    beforeEach(function () {
        scope = rootScope.$new();
        patientResource = jasmine.createSpyObj('patientService', ['search']);
        searchPromise = specUtil.createServicePromise('search');
        patientResource.search.and.returnValue(searchPromise);
        spinner = jasmine.createSpyObj('spinner', ['show', 'hide', 'forPromise']);
        appDescriptor = jasmine.createSpyObj('appDescriptor', ['getExtensions', 'getConfigValue', 'formatUrl']);
        appDescriptor.getExtensions.and.returnValue([]);
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appService.getAppDescriptor.and.returnValue(appDescriptor);
        $controller('SearchPatientController', {
            $scope: scope,
            patientService: patientResource,
            $location: location,
            $window: $window,
            spinner: spinner,
            appService: appService,
            preferences: preferences,
            $rootScope: rootScope
        });
    });

    describe("On changing the search parameter in url", function () {
        var urlSearchChangeCallback;

        beforeEach(function () {
            spyOn(scope, '$watch');
            $controller('SearchPatientController', {
                $scope: scope,
                patientService: patientResource,
                $location: location,
                spinner: spinner,
                loader: loader,
                appService: appService
            });
            urlSearchChangeCallback = scope.$watch.calls.mostRecent().args[1];
        });

        it("should default to preferences.identifierPrefix when nothing available on search string", function () {
            preferences.identifierPrefix = "SEM";

            $controller('SearchPatientController', {
                $scope: scope,
                patientService: patientResource,
                $location: location,
                spinner: spinner,
                appService: appService,
                Preferences: preferences
            });
            urlSearchChangeCallback();

            expect(scope.searchParameters.identifierPrefix.prefix).toBe(preferences.identifierPrefix);
        });

        it('should initialize scope with name search params from url and load the patients if a name search parameter is provided', function () {
            var searchParams = {"name": 'john', addressFieldValue: 'Kanpur'};
            scope.searchConfig = {field: 'city_village', name:'village'}
            spyOn(location, 'search').and.returnValue(searchParams);

            urlSearchChangeCallback();

            expect(scope.searchParameters.name).toBe(searchParams.name);
            expect(scope.searchParameters.addressFieldValue).toBe(searchParams.addressFieldValue);
            expect(patientResource.search).toHaveBeenCalled();
            expect(patientResource.search.calls.mostRecent().args[0]).toBe(searchParams.name);
            expect(patientResource.search.calls.mostRecent().args[1]).toBe(scope.searchConfig.field);
            expect(patientResource.search.calls.mostRecent().args[2]).toBe(searchParams.addressFieldValue);
            expect(searchPromise.success).toHaveBeenCalled();
        });

        it('should initialize scope with id search params from url but do not search for patient', function () {
            var searchParams = {"identifierPrefix": 'GAN', registrationNumber: '200001'};
            spyOn(location, 'search').and.returnValue(searchParams);

            urlSearchChangeCallback();

            expect(scope.searchParameters.identifierPrefix.prefix).toBe(searchParams.identifierPrefix);
            expect(scope.searchParameters.registrationNumber).toBe(searchParams.registrationNumber);
            expect(patientResource.search).not.toHaveBeenCalled();
        });

        it('should not search for patients if search parameter is not provided', function () {
            spyOn(location, 'search').and.returnValue({});

            urlSearchChangeCallback();

            expect(patientResource.search).not.toHaveBeenCalled();
        });

        describe("on success", function () {
            beforeEach(function () {
                spyOn(location, 'search').and.returnValue({"name": "foo"});
                urlSearchChangeCallback();
            });

            it("should set the search results", function () {
                var results = [
                    {uuid: "8989-90909"}
                ];

                searchPromise.callSuccessCallBack({pageOfResults: results});

                expect(scope.results).toBe(results);
            });

            it("should not show the 'no results found message' when patient is found", function () {
                var results = [
                    {uuid: "8989-90909"}
                ];

                searchPromise.callSuccessCallBack({pageOfResults: results});

                expect(scope.noResultsMessage).toBe(null);
            });

            it("should show 'no results found message' when patient is not found", function () {
                var results = [];

                searchPromise.callSuccessCallBack({pageOfResults: results});

                expect(scope.noResultsMessage).toMatch("No results");
            });
        });
    });

    describe("searchByVillageAndName", function () {
        it("should go to search page with name", function () {
            scope.searchParameters.name = "Ram Singh";
            spyOn(location, 'search');

            scope.searchByAddressFieldAndNameAndLocalName();

            expect(location.search).toHaveBeenCalledWith({'name': "Ram Singh"});
        });

        it("should go to search page with village", function () {
            scope.searchParameters.addressFieldValue = "Bilaspur";
            spyOn(location, 'search');

            scope.searchByAddressFieldAndNameAndLocalName();

            expect(location.search).toHaveBeenCalledWith({'addressFieldValue': "Bilaspur"});
        });

        it("should go to search page with localName if showLocalNameSearch has been set", function () {
            scope.searchParameters.localName = "localName";
            scope.showLocalNameSearch = true;
            spyOn(location, 'search');

            scope.searchByAddressFieldAndNameAndLocalName();

            expect(location.search).toHaveBeenCalledWith({'localName': "localName"});
        });
    });

    describe("searchById", function () {
        it('should search by patient identifier when registrationNumber is present', function () {
            scope.searchParameters.identifierPrefix = {};
            scope.searchParameters.identifierPrefix.prefix = "GAN";
            scope.searchParameters.registrationNumber = "20001";
            var defaultSearchAddressField = "city_village";
            scope.searchById();

            expect(patientResource.search).toHaveBeenCalledWith("GAN20001", defaultSearchAddressField);
        });

        it('should show the spinner while searching', function () {
            scope.searchParameters.identifierPrefix = {};
            scope.searchParameters.identifierPrefix.prefix = "GAN";
            scope.searchParameters.registrationNumber = "20001";

            scope.searchById();

            expect(spinner.forPromise).toHaveBeenCalled();
        });

        it('should change the search parameter to patient identifier', function () {
            spyOn(location, 'search');
            scope.searchParameters.identifierPrefix = {};
            scope.searchParameters.identifierPrefix.prefix = "GAN";
            scope.searchParameters.registrationNumber = "20001";

            scope.searchById();

            expect(location.search).toHaveBeenCalledWith({identifierPrefix: "GAN", registrationNumber: "20001"});
        });

        it('should not search if registrationNumber is not present', function () {
            scope.identifierPrefix = {};
            scope.identifierPrefix.prefix = "GAN";
            scope.registrationNumber = "";

            scope.searchById();

            expect(patientResource.search).not.toHaveBeenCalled();
        });

        describe("on success", function () {
            beforeEach(function () {
                scope.searchParameters.identifierPrefix = {};
                scope.searchParameters.identifierPrefix.prefix = "GAN";
                scope.searchParameters.registrationNumber = "20001";
                scope.searchById();
            });

            it("should go to edit patient when a patient is found", function () {
                spyOn(location, 'search');
                spyOn(location, 'url');
                appDescriptor.getConfigValue.and.returnValue("/patient/patientUuid");
                appDescriptor.formatUrl.and.returnValue("/patient/8989-90909");

                searchPromise.callSuccessCallBack({pageOfResults: [
                    {uuid: "8989-90909"}
                ]});

                expect(location.url).toHaveBeenCalledWith("/patient/8989-90909");
                expect(appDescriptor.formatUrl).toHaveBeenCalledWith("/patient/patientUuid", {patientUuid: '8989-90909'});
            });

            it("should show 'no patient found message' when patient is not found", function () {
                searchPromise.callSuccessCallBack({pageOfResults: []});

                expect(scope.noResultsMessage).toMatch("Could not find patient with identifier GAN20001");
            });
        });
    });
});