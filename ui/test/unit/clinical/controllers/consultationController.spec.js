'use strict';

describe("ConsultationController", function () {

    var scope, rootScope;

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        var clinicalAppConfigService = {};
        clinicalAppConfigService.getAllConsultationBoards = function() {return []};
        var location ={};
        location.path =  function() {};


        $controller('ConsultationController', {
            $scope: scope,
            $rootScope: rootScope,
            $state: null,
            $location:location,
            clinicalAppConfigService: clinicalAppConfigService,
            urlHelper: null,
            contextChangeHandler: null,
            spinner: {},
            encounterService: null,
            messagingService: null,
            sessionService: null,
            retrospectiveEntryService: null,
            patientContext: {patient:{}},
            consultationContext: null
        });
    }));

    it("should check if name is longer", function () {
        expect(scope.isLongerName("hello")).toBeFalsy();
        expect(scope.isLongerName("hello this is a long string")).toBeTruthy();
    });

    it("should check if name is shorter", function () {
        expect(scope.getShorterName("hello")).toBe("hello");
        expect(scope.getShorterName("hello this is a long string")).toBe("hello this is a...");
    });

});