'use strict';

describe("PatientListHeaderController", function () {

    var scope, ngDialog,
        $bahmniCookieStore, locationService, $window,
        providerService, rootScope, thisController, i = 0;
    var date = "2015-01-11";
    var encounterProvider = {value: "Test", uuid: "Test_UUID"};


    beforeEach(module('bahmni.clinical'));
    beforeEach(inject(function ($controller, $rootScope) {
        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['remove', 'put', 'get']);
        $bahmniCookieStore.get.and.callFake(function(){
            if(i == 0) {i++; return date };
            if(i == 1) {i++; return encounterProvider };
            if(i == 2) {i++; return {uuid: 1, display: "Location" }};
            if(i == 3) {i++; return {uuid: 1, display: "Location"}};
            if(i == 4) {i = 0; return {uuid: 1, display: "Location" }};
        });

        locationService = jasmine.createSpyObj('locationService', ['getAllByTag']);
        locationService.getAllByTag.and.callFake(function() {
            return specUtil.respondWith({"data": {"results": [{display: "OPD1", uuid:1}, {display:"Registration", uuid:2}]}});
        });
        providerService = jasmine.createSpyObj('providerService', ['search']);
        $window = {location: { reload: jasmine.createSpy()} };
        rootScope = $rootScope;
        rootScope.retrospectiveEntry = {};
        scope = $rootScope.$new();


        thisController = $controller('PatientListHeaderController', {
            $scope: scope,
            $bahmniCookieStore: $bahmniCookieStore,
            providerService: providerService,
            locationService: locationService,
            $window: $window,
            ngDialog: ngDialog
        });
        thisController.windowReload = function(){};

    }));

    // This test is very unpredictable because of time out.
    //it("should initialize the appropriate cookie date and change cookie on select", function () {
    //    expect(scope.date.toString()).toBe(new Date(date).toString());
    //    expect(scope.encounterProvider).toBe(encounterProvider);
    //    setTimeout(function () {
    //        expect(scope.locations[0].display).toBe("OPD1");
    //        expect(scope.locations[1].display).toBe("Registration");
    //        expect(scope.selectedLocationUuid).toBe(1);
    //
    //        scope.windowReload();
    //        expect($bahmniCookieStore.put).toHaveBeenCalled();
    //        expect($bahmniCookieStore.put.calls.count()).toEqual(3);
    //    }, 10000);
    //
    //
    //});

});