'use strict';

describe("PatientListHeaderController", function () {

    var scope, ngDialog,
        $bahmniCookieStore, locationService, $window, retrospectiveEntryService, translate,
        providerService, rootScope, thisController, locationsPromise, appService;
    var date = "2015-01-11";
    var encounterProvider = {value: "Test", uuid: "Test_UUID"};
    translate = jasmine.createSpyObj('$translate', ['instant']);


    beforeEach(module('bahmni.clinical'));
    beforeEach(inject(function ($rootScope) {
        rootScope = $rootScope;
        rootScope.retrospectiveEntry = {};
        scope = $rootScope.$new();
    }));

    beforeEach(inject(function ($controller) {
        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['remove', 'put', 'get']);
        $bahmniCookieStore.get.and.callFake(function (cookie) {
            if (cookie == Bahmni.Common.Constants.grantProviderAccessDataCookieName) {
                return encounterProvider;
            }
            if (cookie == Bahmni.Common.Constants.locationCookieName) {
                return {uuid: 1, display: "Location" };
            }
        });
        locationService = jasmine.createSpyObj('locationService', ['getAllByTag']);
        retrospectiveEntryService = jasmine.createSpyObj('retrospectiveEntryService', ['getRetrospectiveDate', 'resetRetrospectiveEntry']);
        retrospectiveEntryService.getRetrospectiveDate.and.callFake(function () {
            return date;
        });
        locationsPromise = Q.defer();
        locationService.getAllByTag.and.callFake(function () {
            locationsPromise.resolve();
            return specUtil.respondWith({"data": {"results": [
                {display: "OPD1", uuid: 1},
                {display: "Registration", uuid: 2}
            ]}});
        });
        providerService = jasmine.createSpyObj('providerService', ['search']);
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        ngDialog = jasmine.createSpyObj('ngDialog', ['open','close']);
        $window = {location: { reload: jasmine.createSpy()} };
        
        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function () {
                return 10;
            }
        });
        rootScope.currentUser = {
            "username": "superman",
            "userProperties": [{"defaultLocale": "en"}],
            "privileges": []
        };
        thisController = $controller('PatientListHeaderController', {
            $scope: scope,
            $bahmniCookieStore: $bahmniCookieStore,
            providerService: providerService,
            locationService: locationService,
            retrospectiveEntryService: retrospectiveEntryService,
            $window: $window,
            ngDialog: ngDialog,
            $translate: translate,
            appService: appService,
            $rootScope: rootScope
        });
        thisController.windowReload = function () {
        };

    }));

    it("should initialize the appropriate cookie date and change cookie on select", function () {
        locationsPromise.promise.then(function () {
            expect(scope.date.toString()).toEqual(new Date(date).toString());
            expect(scope.encounterProvider).toBe(encounterProvider);
            expect(scope.locations[0].display).toBe("OPD1");
            expect(scope.locations[1].display).toBe("Registration");
            expect(scope.selectedLocationUuid).toBe(1);

            scope.windowReload();

            expect($bahmniCookieStore.put).toHaveBeenCalled();
            expect(retrospectiveEntryService.getRetrospectiveDate).toHaveBeenCalled();
            expect($bahmniCookieStore.put.calls.count()).toEqual(2);
        });

    });

    it("should map providersServer output", function () {
        var providers = scope.getProviderDataResults({
            data : {
                results : [
                    {
                        uuid : 'uuid1',
                        person : { display : 'msf1' }
                    },
                    {
                        uuid : 'uuid2',
                        person : { display : 'msf2' }
                    }
                ]
            }
        });
        expect(providers[0].uuid).toBe('uuid1');
        expect(providers[0].value).toBe('msf1');
        expect(providers[1].uuid).toBe('uuid2');
        expect(providers[1].value).toBe('msf2');
    });

    it("should close ngDialog on closePopUp", function () {
        scope.closePopUp();
        expect(ngDialog.close).toHaveBeenCalled();

    });

    it("should open ngDialog on popUpHandler", function () {
        scope.popUpHandler();
        expect(ngDialog.open).toHaveBeenCalled();

    });

});