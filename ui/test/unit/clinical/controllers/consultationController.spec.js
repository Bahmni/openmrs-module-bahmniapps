'use strict';

describe("ConsultationController", function () {

    var scope, rootScope, state, contextChangeHandler, urlHelper, location, clinicalAppConfigService, stateParams;

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        clinicalAppConfigService = {getAllConsultationBoards: function() {return []}};
        stateParams = {configName: 'default'};
        location = {path: function() {}, url: function(url) {return url}};
        state = {params: {encounterUuid: "someEncounterUuid", programUuid: "someProgramUuid", patientUuid: "somePatientUuid"}};
        contextChangeHandler = {execute: function() {return {allow: true}}, reset: function() {}};
        urlHelper = {getPatientUrl: function() {return "/patient/somePatientUuid"}};

        rootScope.collapseControlPanel = function() {};


        $controller('ConsultationController', {
            $scope: scope,
            $rootScope: rootScope,
            $state: state,
            $stateParams: stateParams,
            $location:location,
            clinicalAppConfigService: clinicalAppConfigService,
            urlHelper: urlHelper,
            contextChangeHandler: contextChangeHandler,
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

    it("should return proper URL when showing a different board", function() {
        var obsBoard = {label: "Observations", url: "concept-set-obs/observations"};
        var treatmentBoard = {label: "Treatment", url: "treatment"};
        scope.availableBoards.push(obsBoard, treatmentBoard);
        var newUrl = scope.showBoard("Treatment");
        expect(newUrl).toEqual("/default/patient/somePatientUuid/treatment?encounterUuid=someEncounterUuid&programUuid=someProgramUuid");
    });

    it("should not append encounterUuid in query params if not available", function() {
        var obsBoard = {label: "Observations", url: "concept-set-obs/observations"};
        var treatmentBoard = {label: "Treatment", url: "treatment"};
        scope.availableBoards.push(obsBoard, treatmentBoard);
        state.params.encounterUuid = null;
        var newUrl = scope.showBoard("Treatment");
        expect(newUrl).toEqual("/default/patient/somePatientUuid/treatment?programUuid=someProgramUuid");
    });

    it("should not append programUuid in query params if not available", function() {
        var obsBoard = {label: "Observations", url: "concept-set-obs/observations"};
        var treatmentBoard = {label: "Treatment", url: "treatment"};
        scope.availableBoards.push(obsBoard, treatmentBoard);
        state.params.programUuid = null;
        var newUrl = scope.showBoard("Treatment");
        expect(newUrl).toEqual("/default/patient/somePatientUuid/treatment?encounterUuid=someEncounterUuid");
    });

});