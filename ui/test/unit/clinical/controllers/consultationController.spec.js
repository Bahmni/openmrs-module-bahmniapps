'use strict';

describe("ConsultationController", function () {

//<<<<<<< HEAD
//    var scope, rootScope, state, contextChangeHandler, urlHelper, location, clinicalAppConfigService, stateParams, appService, ngDialog, q, appDescriptor;
//
//    beforeEach(module('bahmni.clinical'));
//
//    beforeEach(inject(function ($controller, $rootScope) {
//        scope = $rootScope.$new();
//
//        rootScope = $rootScope;
//        clinicalAppConfigService = {getAllConsultationBoards: function() {return []}, getConsultationBoardLink: function() {return []}};
//
//        stateParams = {configName: 'default'};
//        location = {path: function() {}, url: function(url) {return url}};
//        contextChangeHandler = {execute: function() {return {allow: true}}, reset: function() {}};
//        urlHelper = {getPatientUrl: function() {return "/patient/somePatientUuid/dashboard"}};
//        rootScope.collapseControlPanel = function() {};
//
//        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
//        appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
//        appService.getAppDescriptor.and.returnValue(appDescriptor);
//        appDescriptor.getConfigValue.and.returnValue(true);
//
//        q = jasmine.createSpyObj('q', ['all', 'defer']);
//
//        $controller('ConsultationController', {
//            $scope: scope,
//            $rootScope: rootScope,
//            $state: state,
//            $location:location,
//            clinicalAppConfigService: clinicalAppConfigService,
//            urlHelper: urlHelper,
//            contextChangeHandler: contextChangeHandler,
//            spinner: {},
//            encounterService: null,
//            messagingService: null,
//            sessionService: null,
//            retrospectiveEntryService: null,
//            patientContext: {patient:{}},
//            consultationContext: null,
//            $q: q,
//            patientVisitHistoryService: null,
//            $stateParams: stateParams,
//            $window: null,
//            visitHistory: null,
//            appService: appService,
//            clinicalDashboardConfig: null,
//            ngDialog: ngDialog
//=======
    var scope, rootScope, state, contextChangeHandler, urlHelper, location, clinicalAppConfigService, stateParams, appService, appDescriptor, ngDialog;
    location = {path: function() {}, url: function(url) {return url}};
    var boards = [
        {
            default: true,
            extensionPointId: "org.bahmni.clinical.consultation.board",
            icon: "fa-user-md",
            id: "bahmni.clinical.consultation.observations",
            order: 1,
            requiredPrivilege: "app:clinical:observationTab",
            translationKey: "OBSERVATIONS_BOARD_LABEL_KEY",
            type: "link",
            url: "concept-set-group/observations"
        },
        {
            extensionPointId: "org.bahmni.clinical.consultation.board",
            icon: "icon-user-md",
            id: "bahmni.clinical.billing.treatment",
            label: "Treatment",
            order: 7,
            extensionParams: {
                "tabConfigName": "tbTabConfig"
            },
            requiredPrivilege: "app:clinical:consultationTab",
            translationKey: "Treatment",
            type: "link",
            url: "treatment"
        }
    ];

    beforeEach(module('bahmni.clinical'));

    var injectConsultationController = function(){
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            rootScope = $rootScope;
            clinicalAppConfigService = {getAllConsultationBoards: function() {
                return boards}, getConsultationBoardLink: function() {return []}};

            stateParams = {configName: 'default'};
            state = {name: "patient.dashboard.show", params: {encounterUuid: "someEncounterUuid", programUuid: "someProgramUuid", patientUuid: "somePatientUuid"}, go: function() {}};
            contextChangeHandler = {execute: function() {return {allow: true}}, reset: function() {}};
            urlHelper = {getPatientUrl: function() {return "/patient/somePatientUuid/dashboard"}};

            rootScope.collapseControlPanel = function() {};

            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            appDescriptor.getConfigValue.and.returnValue(true);
            ngDialog = jasmine.createSpyObj('ngDialog',['close']);

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
                ngDialog: ngDialog
            });
//>>>>>>> Chethan, Achinta | #654 | Fixing switching between treatment tabs that was not working. Fixed retaining of drug orders between two tabs.
        });

    };

    beforeEach(injectConsultationController);

    it("should check if name is longer", function () {

        expect(scope.isLongerName("hello")).toBeFalsy();
        expect(scope.isLongerName("hello this is a long string")).toBeTruthy();
    });

    it("should check if name is shorter", function () {
        expect(scope.getShorterName("hello")).toBe("hello");
        expect(scope.getShorterName("hello this is a long string")).toBe("hello this is a...");
    });

    it("should return proper URL when showing a different board", function() {
        scope.lastConsultationTabUrl = {url : undefined};
        var newUrl = scope.showBoard(1);
        expect(newUrl).toEqual("/default/patient/somePatientUuid/dashboard/treatment?encounterUuid=someEncounterUuid&programUuid=someProgramUuid&tabConfigName=tbTabConfig");
    });

    it("should return proper URL with extension params as parameters with url", function() {
        scope.lastConsultationTabUrl = {url : undefined};
        var newUrl = scope.showBoard(1);
        expect(newUrl).toEqual("/default/patient/somePatientUuid/dashboard/treatment?encounterUuid=someEncounterUuid&programUuid=someProgramUuid&tabConfigName=tbTabConfig");
    });

    it("should not append encounterUuid in query params if not available", function() {
        scope.lastConsultationTabUrl = {url : undefined};
        state.params.encounterUuid = null;
        var newUrl = scope.showBoard(1);
        expect(newUrl).toEqual("/default/patient/somePatientUuid/dashboard/treatment?programUuid=someProgramUuid&tabConfigName=tbTabConfig");
    });

    it("should check whether app is in editEncounterMode", function(){
        stateParams.encounterUuid = "active";
        expect(scope.isInEditEncounterMode()).toBeFalsy();
        stateParams.encounterUuid = undefined;
        expect(scope.isInEditEncounterMode()).toBeFalsy();
        stateParams.encounterUuid = "abdk-k1j2k3j2k-skfhsjfs";
        expect(scope.isInEditEncounterMode()).toBeTruthy();
    });

//<<<<<<< HEAD
    it("should stay in current state if 'cancel' is selected", function(){
        expect(state.name).toEqual("patient.dashboard.show");
        scope.cancelTransition();
        expect(state.name).toEqual("patient.dashboard.show");
        expect(ngDialog.close).toHaveBeenCalled();
    });

    it("should save and go to target state if 'save and continue' is selected", function() {
        scope.toState = {name : "patient.search"};
        scope.toParams = {config: 'default'};
        expect(state.name).toEqual("patient.dashboard.show");
        scope.save = jasmine.createSpy('save');
        scope.saveAndContinue();
        expect(scope.save).toHaveBeenCalledWith(true);
        expect(ngDialog.close).toHaveBeenCalled();
    });

    it("should not save and go to target state if 'don't save' is selected", function() {
        scope.toState = {name : "patient.search"};
        scope.toParams = {config: 'default'};
        expect(state.name).toEqual("patient.dashboard.show");
        state.go = jasmine.createSpy('go');
        scope.continueWithoutSaving();
        expect(state.go).toHaveBeenCalledWith(scope.toState, scope.toParams);
        expect(ngDialog.close).toHaveBeenCalled();

    });

    it("should allow all transitions where the target state falls within consultation", function() {
        var toState = {name : "patient.dashboard.show.diagnosis"};
        var fromState = {name : "some.state"};
        expect(scope.shouldDisplaySaveConfirmDialogForStateChange(toState, null, fromState)).toEqual(false);

        toState = {name : "patient.search"};
        expect(scope.shouldDisplaySaveConfirmDialogForStateChange(toState, null, fromState)).toEqual(true);

        toState = {name : "patient.dashboard.show"};
        expect(scope.shouldDisplaySaveConfirmDialogForStateChange(toState, null, fromState)).toEqual(false);
    });

    it("should not allow transition between same states", function() {
        var fromState = {name : "patient.dashboard.show"};
        var toState = {name : "patient.dashboard.show"};
        expect(scope.shouldDisplaySaveConfirmDialogForStateChange(toState, null, fromState)).toEqual(true);
    });

    it("should display save confirm dialog if the config is set", function(){
        var fromState = {name : "patient.dashboard.show"};
        var toState = {name : "patient.dashboard.show.observations"};
        rootScope.hasVisitedConsultation = true;

        scope.shouldDisplaySaveConfirmDialogForStateChange = jasmine.createSpy('shouldDisplaySaveConfirmDialogForStateChange');

        scope.$broadcast("$stateChangeStart", toState, null, fromState, null);

        expect(scope.shouldDisplaySaveConfirmDialogForStateChange).toHaveBeenCalled();
    });

    it("should not display save confirm dialog if the config is not set", function(){
        var fromState = {name : "patient.dashboard.show"};
        var toState = {name : "patient.dashboard.show.observations"};
        rootScope.hasVisitedConsultation = true;
        scope.showSaveConfirmDialogConfig = false;
        scope.shouldDisplaySaveConfirmDialogForStateChange = jasmine.createSpy('shouldDisplaySaveConfirmDialogForStateChange');

        scope.$broadcast("$stateChangeStart", toState, null, fromState, null);

        expect(scope.shouldDisplaySaveConfirmDialogForStateChange).not.toHaveBeenCalled();
    });
//=======
    it("should set current tab based on url", function(){
        location = {path: function() {}, url: function(url) {return "/default/patient/somePatientUuid/dashboard/treatment?programUuid=someProgramUuid&tabConfigName=tbTabConfig"}};
        injectConsultationController();

        expect(scope.currentBoard).toEqual({
                extensionPointId: "org.bahmni.clinical.consultation.board",
                icon: "icon-user-md",
                id: "bahmni.clinical.billing.treatment",
                label: "Treatment",
                order: 7,
                extensionParams: {
                    "tabConfigName": "tbTabConfig"
                },
                requiredPrivilege: "app:clinical:consultationTab",
                translationKey: "Treatment",
                type: "link",
                url: "treatment",
                isSelectedTab: true
            }
        )
    });

    it("should set current tab based on the tab config provided", function(){
        location = {path: function() {}, url: function(url) {return "/default/patient/somePatientUuid/dashboard/treatment?programUuid=someProgramUuid&tabConfigName=nonTbTabConfig"}};
        var nonTbTab = {
            extensionPointId: "org.bahmni.clinical.consultation.board",
            icon: "icon-user-md",
            id: "bahmni.clinical.billing.treatment",
            label: "Treatment",
            order: 7,
            extensionParams: {
                "tabConfigName": "nonTbTabConfig"
            },
            requiredPrivilege: "app:clinical:consultationTab",
            translationKey: "Treatment",
            type: "link",
            url: "treatment"
        };

        boards.push(nonTbTab);
        injectConsultationController();
        var expectedCurrentBoard = nonTbTab;
        expectedCurrentBoard.isSelectedTab = true;
        expect(scope.currentBoard).toEqual(expectedCurrentBoard)
    });
//>>>>>>> Chethan, Achinta | #654 | Fixing switching between treatment tabs that was not working. Fixed retaining of drug orders between two tabs.
});