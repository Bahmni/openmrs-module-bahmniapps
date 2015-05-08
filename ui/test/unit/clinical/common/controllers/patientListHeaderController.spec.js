'use strict';

describe("PatientListHeaderController", function () {

    var scope,
        $bahmniCookieStore,
        providerService, rootScope, thisController;


    beforeEach(module('bahmni.clinical'));
    beforeEach(inject(function ($controller, $rootScope) {

        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['remove', 'put', 'get']);
        $bahmniCookieStore.get.and.returnValue({value: "Test", uuid: "Test_UUID"});
        providerService = jasmine.createSpyObj('providerService', ['search']);
        rootScope = $rootScope;
        scope = $rootScope.$new();


         thisController = $controller('PatientListHeaderController', {
            $scope: scope,
            $bahmniCookieStore: $bahmniCookieStore,
            providerService: providerService
        });
        thisController.windowReload = function(){};

    }));

});