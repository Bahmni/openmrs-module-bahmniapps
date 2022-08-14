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
        appService,
        translate;

    beforeEach(angular.mock.module('bahmni.registration'));
    beforeEach(module('bahmni.common.routeErrorHandler'));
    beforeEach(module('pascalprecht.translate'));
    beforeEach(angular.mock.inject(function ($injector) {
        $controller = $injector.get('$controller');
        rootScope = $injector.get('$rootScope');
        location = $injector.get('$location');
        $window = {
            history: {
                pushState: function () {
                }
            }
        };
        rootScope.patientConfiguration = {};
        rootScope.currentUser = {privileges: [{name: 'View Patients'}]};
        rootScope.addressLevels = [{"addressField": "stateProvince", name: "State"}];
        rootScope.addressLevels = [{"addressField": "stateProvince", name: "State"}];
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

        it('should initialize scope with name search params from url and load the patients if a name search parameter is provided', function () {
            var searchParams = {"name": 'john', addressFieldValue: 'Kanpur'};
            scope.addressSearchConfig = {field: 'city_village', name: 'village'};
            spyOn(location, 'search').and.returnValue(searchParams);

            urlSearchChangeCallback();

            expect(scope.searchParameters.name).toBe(searchParams.name);
            expect(scope.searchParameters.addressFieldValue).toBe(searchParams.addressFieldValue);
            expect(patientResource.search).toHaveBeenCalled();
            expect(patientResource.search.calls.mostRecent().args[0]).toBe(searchParams.name);
            expect(patientResource.search.calls.mostRecent().args[1]).toBe(undefined);
            expect(patientResource.search.calls.mostRecent().args[2]).toBe(scope.addressSearchConfig.field);
            expect(patientResource.search.calls.mostRecent().args[3]).toBe(searchParams.addressFieldValue);
            expect(searchPromise.then).toHaveBeenCalled();
        });

        it('should initialize scope with id search params from url but do not search for patient', function () {
            var searchParams = {registrationNumber: '200001'};
            spyOn(location, 'search').and.returnValue(searchParams);

            urlSearchChangeCallback();

            expect(scope.searchParameters.registrationNumber).toBe(searchParams.registrationNumber);
            expect(patientResource.search).not.toHaveBeenCalled();
        });

        it('should not search for patients if search parameter is not provided', function () {
            spyOn(location, 'search').and.returnValue({});

            urlSearchChangeCallback();

            expect(patientResource.search).not.toHaveBeenCalled();
        });

        describe("on then", function () {
            beforeEach(function () {
                spyOn(location, 'search').and.returnValue({"name": "foo"});
                urlSearchChangeCallback();
            });

            it("should set the search results", function () {
                var results = [
                    {uuid: "8989-90909"}
                ];

                searchPromise.callThenCallBack({"pageOfResults": results});

                expect(scope.results).toBe(results);
            });

            it("should not show the 'no results found message' when patient is found", function () {
                var results = [
                    {uuid: "8989-90909"}
                ];

                searchPromise.callThenCallBack({pageOfResults: results});

                expect(scope.noResultsMessage).toBe(null);
            });

            it("should show 'no results found message' when patient is not found", function () {
                var results = [];

                searchPromise.callThenCallBack({pageOfResults: results});

                expect(scope.noResultsMessage).toMatch("REGISTRATION_NO_RESULTS_FOUND");
            });
        });
    });

    describe("searchByVillageAndName", function () {
        it("should go to search page with name", function () {
            scope.searchParameters.name = "Ram Singh";
            spyOn(location, 'search');

            scope.searchPatients();

            expect(location.search).toHaveBeenCalledWith({'name': "Ram Singh"});
        });

        it("should go to search page with village", function () {
            scope.searchParameters.addressFieldValue = "Bilaspur";
            spyOn(location, 'search');

            scope.searchPatients();

            expect(location.search).toHaveBeenCalledWith({'addressFieldValue': "Bilaspur"});
        });

        it("should go to search page with localName if showLocalNameSearch has been set", function () {
            scope.searchParameters.customAttribute = "localName";
            scope.customAttributesSearchConfig.show = true;
            spyOn(location, 'search');

            scope.searchPatients();

            expect(location.search).toHaveBeenCalledWith({'customAttribute': "localName"});
        });
    });

    describe("searchByProgramAttribute", function () {
        it("should go to search page with programAttribute if programAttributesSearchConfig has been set", function () {
            scope.programAttributesSearchConfig.field = "programAttributeFieldName";
            scope.searchParameters.programAttributeFieldValue = "programAttributeFieldValue";
            scope.programAttributesSearchConfig.show = true;
            spyOn(location, 'search');

            scope.searchPatients();

            expect(location.search).toHaveBeenCalledWith({
                'programAttributeFieldName': "programAttributeFieldName",
                programAttributeFieldValue: "programAttributeFieldValue"
            });
        });

        it("should not go to search page with programAttribute if programAttributesSearchConfig has not been set", function () {
            scope.searchParameters.programAttribute = "programAttributeId";
            spyOn(location, 'search');

            scope.searchPatients();

            expect(location.search).not.toHaveBeenCalledWith({'programAttribute': "programAttributeId"});
        });
    });

    describe("searchById", function () {
        it('should search by patient identifier when registrationNumber is present', function () {
            scope.searchParameters.registrationNumber = "20001";
            var defaultSearchAddressField = undefined;
            scope.searchById();

            expect(patientResource.search).toHaveBeenCalledWith(undefined, "20001", defaultSearchAddressField, undefined, undefined, undefined, undefined, undefined, undefined, [], {}, false);
        });

        it('should show the spinner while searching', function () {
            scope.searchParameters.registrationNumber = "20001";

            scope.searchById();

            expect(spinner.forPromise).toHaveBeenCalled();
        });

        it('should change the search parameter to patient identifier', function () {
            spyOn(location, 'search');
            scope.searchParameters.registrationNumber = "20001";
            scope.customAttributesSearchConfig.fields = ["education", "firstNameLocal"];
            scope.addressSearchResultsConfig.fields = ["address3"];
            scope.personSearchResultsConfig.fields = ["middleNameLocal"];

            scope.searchById();

            expect(location.search).toHaveBeenCalledWith({
                registrationNumber: "20001",
                programAttributeFieldName: undefined,
                patientAttributes: ["education", "firstNameLocal"],
                programAttributeFieldValue: undefined,
                addressSearchResultsConfig: ["address3"],
                personSearchResultsConfig: ["middleNameLocal"]
            });
        });

        it('should change the search parameter to patient identifier with programAttributesSearchConfig', function () {
            spyOn(location, 'search');
            scope.searchParameters.registrationNumber = "20001";
            scope.programAttributesSearchConfig.field = "Facility";
            scope.customAttributesSearchConfig.fields = ["education", "firstNameLocal"];

            scope.searchById();

            expect(location.search).toHaveBeenCalledWith({
                registrationNumber: "20001",
                programAttributeFieldName: "Facility",
                patientAttributes: ["education", "firstNameLocal"],
                programAttributeFieldValue: undefined,
                addressSearchResultsConfig: [],
                personSearchResultsConfig: {}
            });
        });

        it('should not search if registrationNumber is not present', function () {
            scope.registrationNumber = "";

            scope.searchById();

            expect(patientResource.search).not.toHaveBeenCalled();
        });

        describe("on success", function () {
            beforeEach(function () {
                scope.searchParameters.registrationNumber = "20001";
                scope.searchById();
            });

            it("should go to edit patient when a patient is found", function () {
                spyOn(location, 'search');
                spyOn(location, 'url');
                appDescriptor.getConfigValue.and.returnValue("/patient/patientUuid");
                appDescriptor.formatUrl.and.returnValue("/patient/8989-90909");

                searchPromise.callThenCallBack({
                    pageOfResults: [
                        {uuid: "8989-90909"}
                    ]
                });

                expect(location.url).toHaveBeenCalledWith("/patient/8989-90909");
                expect(appDescriptor.formatUrl).toHaveBeenCalledWith("/patient/patientUuid", {patientUuid: '8989-90909'});
            });

            it("should show 'no patient found message' when patient is not found", function () {
                searchPromise.callThenCallBack({pageOfResults: []});

                expect(scope.noResultsMessage).toMatch("REGISTRATION_LABEL_COULD_NOT_FIND_PATIENT");
            });
        });
    });

    describe("getProgramAttributeValues", function () {
        it("should return undefined on empty result object passed", function () {
            var result = {};
            var programAttributeValue = scope.getProgramAttributeValues(result);

            expect(programAttributeValue).toBe('');
        });

        it("should return programAttribute on result object passed and programAttributesSearchConfig is not configured", function () {
            var result = {patientProgramAttributeValue: {Facility: ["Facility1"]}};
            var programAttributeValue = scope.getProgramAttributeValues(result);

            expect(programAttributeValue).toBe('');
        });

        it("should return programAttribute on result object passed and programAttributesSearchConfig is configured", function () {
            var result = {patientProgramAttributeValue: {Facility: ["Facility1"]}};
            scope.programAttributesSearchConfig.field = "Facility";
            var programAttributeValue = scope.getProgramAttributeValues(result);

            expect(programAttributeValue).toBe("Facility1");
        });

        it("should return comma separated program attribute values when programAttributesSearchConfig is configured", function () {
            var result = {patientProgramAttributeValue: {Facility: ["Facility1", "Facility2", "Facility3"]}};
            scope.programAttributesSearchConfig.field = "Facility";
            var programAttributeValue = scope.getProgramAttributeValues(result);

            expect(programAttributeValue).toBe("Facility1, Facility2, Facility3");
        });

        it("should check if the address fields are valid", function () {
            expect(scope.getAddressColumnName("stateProvince")).toBe("State");
        });
    });
});
