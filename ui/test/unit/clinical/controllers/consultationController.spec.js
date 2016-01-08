'use strict';

describe("ConsultationController", function () {

    var scope, rootScope, state, contextChangeHandler, urlHelper, location, clinicalAppConfigService, stateParams, appService;

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        clinicalAppConfigService = {getAllConsultationBoards: function() {return []}, getConsultationBoardLink: function() {return []}};

        stateParams = {configName: 'default'};
        location = {path: function() {}, url: function(url) {return url}};
        state = {params: {encounterUuid: "someEncounterUuid", programUuid: "someProgramUuid", patientUuid: "somePatientUuid"}};
        contextChangeHandler = {execute: function() {return {allow: true}}, reset: function() {}};
        urlHelper = {getPatientUrl: function() {return "/patient/somePatientUuid/dashboard"}};

        rootScope.collapseControlPanel = function() {};

        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appService.getAppDescriptor.and.returnValue({});

        $controller('ConsultationController', {
            $scope: scope,
            $rootScope: rootScope,
            $state: state,
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
            consultationContext: null,
            $q: null,
            patientVisitHistoryService: null,
            $stateParams: stateParams,
            $window: null,
            visitHistory: null,
            appService: appService,
            clinicalDashboardConfig: null,
            ngDialog: null
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
        var obsBoard = {translationKey: "Observations", url: "concept-set-obs/observations"};
        var treatmentBoard = {translationKey: "Treatment", url: "treatment"};
        scope.lastConsultationTabUrl = {url : undefined};
        scope.availableBoards.push(obsBoard, treatmentBoard);
        var newUrl = scope.showBoard(treatmentBoard);
        expect(newUrl).toEqual("/default/patient/somePatientUuid/dashboard/treatment?encounterUuid=someEncounterUuid&programUuid=someProgramUuid");
    });

    it("should not append encounterUuid in query params if not available", function() {
        var obsBoard = {translationKey: "Observations", url: "concept-set-obs/observations"};
        var treatmentBoard = {translationKey: "Treatment", url: "treatment"};
        scope.lastConsultationTabUrl = {url : undefined};
        scope.availableBoards.push(obsBoard, treatmentBoard);
        state.params.encounterUuid = null;
        var newUrl = scope.showBoard(treatmentBoard);
        expect(newUrl).toEqual("/default/patient/somePatientUuid/dashboard/treatment?programUuid=someProgramUuid");
    });

    it("should check whether app is in editEncounterMode", function(){
        stateParams.encounterUuid = "active";
        expect(scope.isInEditEncounterMode()).toBeFalsy();
        stateParams.encounterUuid = undefined;
        expect(scope.isInEditEncounterMode()).toBeFalsy();
        stateParams.encounterUuid = "abdk-k1j2k3j2k-skfhsjfs";
        expect(scope.isInEditEncounterMode()).toBeTruthy();
    });
});