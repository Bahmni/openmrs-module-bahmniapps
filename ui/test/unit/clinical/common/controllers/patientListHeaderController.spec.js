'use strict';

describe("PatientListHeaderController", function () {

    var scope, ngDialog,
        $bahmniCookieStore, locationService, $window, retrospectiveEntryService,
        providerService, rootScope, thisController, locationsPromise, offlineService,offlinePatientSync;
    var date = "2015-01-11";
    var encounterProvider = {value: "Test", uuid: "Test_UUID"};


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
        offlineService = jasmine.createSpyObj('offlineService', ['isOfflineApp']);
        offlinePatientSync = jasmine.createSpyObj('offlinePatientSync', ['sync']);
        $window = {location: { reload: jasmine.createSpy()} };

        offlineService.isOfflineApp.and.returnValue(true);

        thisController = $controller('PatientListHeaderController', {
            $scope: scope,
            $bahmniCookieStore: $bahmniCookieStore,
            providerService: providerService,
            locationService: locationService,
            retrospectiveEntryService: retrospectiveEntryService,
            $window: $window,
            ngDialog: ngDialog,
            offlineService: offlineService,
            schedulerService: offlinePatientSync
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
            expect(scope.isOffline).toBeTruthy();
        });

    });

});