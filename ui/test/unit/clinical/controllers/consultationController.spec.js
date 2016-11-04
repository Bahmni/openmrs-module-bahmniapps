'use strict';

describe("ConsultationController", function () {

    var scope, rootScope, state, contextChangeHandler, urlHelper, location, clinicalAppConfigService,
        stateParams, appService, ngDialog, q, appDescriptor, controller, visitConfig, _window_, clinicalDashboardConfig, sessionService;

    clinicalDashboardConfig = jasmine.createSpyObj('clinicalDashboardConfig',['isCurrentTab']);
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
    var createController = function(){
        return controller('ConsultationController', {
            $scope: scope,
            $rootScope: rootScope,
            $state: state,
            $location: location,
            clinicalAppConfigService: clinicalAppConfigService,
            urlHelper: urlHelper,
            contextChangeHandler: contextChangeHandler,
            sessionService: sessionService,
            patientContext: {patient: {}},
            $q: Q,
            $stateParams: stateParams,
            $window: _window_,
            visitHistory: null,
            appService: appService,
            clinicalDashboardConfig: clinicalDashboardConfig,
            ngDialog: ngDialog,
            visitConfig : visitConfig
        });
    };
    var setUpServiceMocks = function () {
        location = {
            path: function () {
            }, url: function (url) {
                return url
            }
        };

        clinicalAppConfigService = {
            getAllConsultationBoards: function () {
                return boards
            }, getConsultationBoardLink: function () {
                return []
            },
            getVisitTypeForRetrospectiveEntries: function(){
                return {};
            },
            getDefaultVisitType: function(){
                return "IPD";
            }
        };

        sessionService = {
            getLoginLocationUuid: function(){
                return "uuid";
            }
        };

        stateParams = {configName: 'default'};
        state = {
            name: "patient.dashboard.show",
            params: {
                encounterUuid: "someEncounterUuid",
                programUuid: "someProgramUuid",
                patientUuid: "somePatientUuid",
                enrollment: "somePatientProgramUuid"
            },
            go: function () {
            }
        };
        contextChangeHandler = {
            execute: function () {
                return {allow: true}
            }, reset: function () {
            }
        };
        urlHelper = {
            getPatientUrl: function () {
                return "/patient/somePatientUuid/dashboard"
            }
        };
        ngDialog = jasmine.createSpyObj('ngDialog', ['close', 'closeAll']);
        rootScope.collapseControlPanel = function () {
        };
        scope.lastConsultationTabUrl = {url: {}};
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
        appService.getAppDescriptor.and.returnValue(appDescriptor);
        appDescriptor.getConfigValue.and.returnValue(true);

        q = jasmine.createSpyObj('q', ['all', 'defer']);
        visitConfig = {};
    };
    beforeEach(module('bahmni.clinical'));
    beforeEach(module('bahmni.common.offline'));
    beforeEach(function(){
        inject(function ($controller, $rootScope, _$window_) {
            _window_ = _$window_;
            scope = $rootScope.$new();
            rootScope = $rootScope;
            controller = $controller;
        });
    });
    beforeEach(setUpServiceMocks);
    beforeEach(createController);


    describe("init",function(){

        it("should initialize all the necessary variables",function(){
          expect(scope.togglePrintList).toBeFalsy();
          expect(scope.patient).toEqual({});
          expect(scope.showDashboardMenu).toBeFalsy();
          expect(scope.showComment).toBeTruthy();
          expect(scope.consultationBoardLink).toEqual([]);
          expect(scope.showControlPanel).toBeFalsy();

        });

        it("should initialize the available boards", function(){
            expect(scope.availableBoards.length).toBe(2);
        });

        it("current board should not be set if dashboard is clicked", function () {
            location = {
                path: function () {
                }, url: function (url) {
                    return "/default/patient/somePatientUuid/dashboard"
                }
            };
            _window_ = null;
            createController();

            expect(scope.currentBoard).toBeFalsy();
        });

        it("should give patient name for display", function () {
            expect(scope.getShorterName("hello")).toBe("hello");
            expect(scope.getShorterName("hello this is a long string")).toBe("hello this is a...");
        });

        it("should check whether app is in editEncounterMode", function () {
            stateParams.encounterUuid = "active";
            expect(scope.isInEditEncounterMode()).toBeFalsy();
            stateParams.encounterUuid = undefined;
            expect(scope.isInEditEncounterMode()).toBeFalsy();
            stateParams.encounterUuid = "abdk-k1j2k3j2k-skfhsjfs";
            expect(scope.isInEditEncounterMode()).toBeTruthy();
        });

    });

    describe("tabUrl", function(){
        it("should return proper URL when showing a different board", function () {
            scope.lastConsultationTabUrl = {url: undefined};
            scope.consultation = {discontinuedDrugs: [{dateStopped: new Date()}]};
            var newUrl = scope.showBoard(1);
            expect(newUrl).toEqual("/default/patient/somePatientUuid/dashboard/treatment?encounterUuid=someEncounterUuid&programUuid=someProgramUuid&enrollment=somePatientProgramUuid&tabConfigName=tbTabConfig");
            expect(scope.currentBoard.label).toBe("Treatment");
            expect(scope.currentBoard.isSelectedTab).toBeTruthy();
            expect(scope.lastConsultationTabUrl.url ).toBe(newUrl);
        });

        it("should return proper URL with extension params as parameters with url", function () {
            scope.lastConsultationTabUrl = {url: undefined};
            scope.consultation = {discontinuedDrugs: [{dateStopped: new Date()}]};
            var newUrl = scope.showBoard(1);
            expect(newUrl).toEqual("/default/patient/somePatientUuid/dashboard/treatment?encounterUuid=someEncounterUuid&programUuid=someProgramUuid&enrollment=somePatientProgramUuid&tabConfigName=tbTabConfig");
        });

        it("should not append encounterUuid in query params if not available", function () {
            scope.lastConsultationTabUrl = {url: undefined};
            scope.consultation = {discontinuedDrugs: [{dateStopped: new Date()}]};
            state.params.encounterUuid = null;
            var newUrl = scope.showBoard(1);
            expect(newUrl).toEqual("/default/patient/somePatientUuid/dashboard/treatment?programUuid=someProgramUuid&enrollment=somePatientProgramUuid&tabConfigName=tbTabConfig");
        });

        it("should set current tab based on url", function () {
            location = {
                path: function () {
                }, url: function (url) {
                    return "/default/patient/somePatientUuid/dashboard/treatment?programUuid=someProgramUuid&tabConfigName=tbTabConfig"
                }
            };
            createController();

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

        it("should set current tab based on the tab config provided", function () {
            location = {
                path: function () {
                }, url: function (url) {
                    return "/default/patient/somePatientUuid/dashboard/treatment?programUuid=someProgramUuid&tabConfigName=nonTbTabConfig"
                }
            };
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
            createController();
            var expectedCurrentBoard = nonTbTab;
            expectedCurrentBoard.isSelectedTab = true;
            expect(scope.currentBoard).toEqual(expectedCurrentBoard)
        });

        it("should validate the current tab drug orders", function () {
            scope.consultation = {discontinuedDrugs: [{concept: {name: "Paracetmol"}}]};
            spyOn(scope.$parent, '$broadcast');

            scope.showBoard(1);
            expect(scope.$parent.$broadcast).toHaveBeenCalledWith('event:errorsOnForm');

        });

        it("should be on currentBoard if click on same tab", function () {
            scope.consultation = {discontinuedDrugs: [{dateStopped: new Date()}]};
            scope.showBoard(1);
            expect(scope.currentBoard.label).toBe('Treatment');

            scope.showBoard(1);
            expect(scope.currentBoard.label).toBe('Treatment');

        });
    });

    describe("showSaveConfirmDialogConfig",function(){
        it("should stay in current state if 'cancel' is selected", function () {
            expect(state.name).toEqual("patient.dashboard.show");
            scope.cancelTransition();
            expect(state.name).toEqual("patient.dashboard.show");
            expect(ngDialog.close).toHaveBeenCalled();
        });

        it("should save and go to target state if 'save and continue' is selected", function () {
            scope.toState = {name: "patient.search"};
            scope.toParams = {config: 'default'};
            expect(state.name).toEqual("patient.dashboard.show");
            scope.save = jasmine.createSpy('save');
            var toStateConfig = {toState: "", toParams: ""};
            scope.toStateConfig = toStateConfig;
            scope.saveAndContinue();
            expect(scope.save).toHaveBeenCalledWith(toStateConfig);
            expect(ngDialog.close).toHaveBeenCalled();
        });

        it("should not save and go to target state if 'don't save' is selected", function () {
            scope.toState = {name: "patient.search"};
            scope.toParams = {config: 'default'};
            expect(state.name).toEqual("patient.dashboard.show");
            state.go = jasmine.createSpy('go');
            var toStateConfig = {toState: "patient.search", toParams: "default"};
            scope.toStateConfig = toStateConfig;
            scope.continueWithoutSaving();
            expect(state.go).toHaveBeenCalledWith(toStateConfig.toState, toStateConfig.toParams);
            expect(ngDialog.close).toHaveBeenCalled();
        });

        it("should not show dialog to confirm save where the target state falls within consultation", function () {
            var toState = {name: "patient.dashboard.show.diagnosis"};
            var fromState = {name: "some.state"};
            var params = {patientUUid: 'patientUuid'};
            expect(scope.shouldDisplaySaveConfirmDialogForStateChange(toState, params, fromState, params)).toEqual(false);

            toState = {name: "patient.search"};
            expect(scope.shouldDisplaySaveConfirmDialogForStateChange(toState, params, fromState, params)).toEqual(true);

            toState = {name: "patient.dashboard.show"};
            expect(scope.shouldDisplaySaveConfirmDialogForStateChange(toState, params, fromState, params)).toEqual(false);
        });

        it("should not show dialog to confirm save if from state is equal to to state and the patient uuid is same.", function () {
            var fromState = {name: "patient.dashboard.show"};
            var toState = {name: "patient.dashboard.show"};
            var params = {patientUUid: 'patientUuid'};
            expect(scope.shouldDisplaySaveConfirmDialogForStateChange(toState, params, fromState, params)).toEqual(false);
        });

        it("should show dialog to confirm save if from state is equal to to state and the patient uuid is different", function () {
            var fromState = {name: "patient.dashboard.show"};
            var toState = {name: "patient.dashboard.show"};
            expect(scope.shouldDisplaySaveConfirmDialogForStateChange(toState, {patientUuid: 'patientUuid1'}, fromState, {patientUuid: 'patientUuid2'})).toEqual(true);
        });

        it("should display save confirm dialog if the config is set", function () {
            var fromState = {name: "patient.dashboard.show"};
            var toState = {name: "patient.dashboard.show.observations"};
            rootScope.hasVisitedConsultation = true;

            scope.shouldDisplaySaveConfirmDialogForStateChange = jasmine.createSpy('shouldDisplaySaveConfirmDialogForStateChange');

            scope.$broadcast("$stateChangeStart", toState, null, fromState, null);

            expect(scope.shouldDisplaySaveConfirmDialogForStateChange).toHaveBeenCalled();
        });

        it("should not display save confirm dialog if the config is not set", function () {
            var fromState = {name: "patient.dashboard.show"};
            var toState = {name: "patient.dashboard.show.observations"};
            rootScope.hasVisitedConsultation = true;
            scope.showSaveConfirmDialogConfig = false;
            scope.shouldDisplaySaveConfirmDialogForStateChange = jasmine.createSpy('shouldDisplaySaveConfirmDialogForStateChange');

            scope.$broadcast("$stateChangeStart", toState, null, fromState, null);

            expect(scope.shouldDisplaySaveConfirmDialogForStateChange).not.toHaveBeenCalled();
        });

    });

    describe("open consultation", function () {

        it("should not broadcast page unload event if not configured to prompt", function () {
            appService.getAppDescriptor.and.returnValue({
                getConfigValue: function () {
                    return false;
                }
            });
            spyOn(rootScope, '$broadcast');

            createController(appService);
            scope.openConsultation();
            expect(rootScope.$broadcast).not.toHaveBeenCalledWith('event:pageUnload');
        });

        it("should broadcast page unload event if configured to prompt", function () {
            appService.getAppDescriptor.and.returnValue({
                getConfigValue: function () {
                    return true;
                }
            });
            spyOn(rootScope, '$broadcast');

            createController(appService);
            scope.openConsultation();
            expect(rootScope.$broadcast).toHaveBeenCalledWith('event:pageUnload');
        });

        it("should toggle dashboard", function () {
            scope.toggleDashboardMenu();

            expect(scope.showDashboardMenu).toBeTruthy();
        });

        it("should show dashboard menu", function () {
            spyOn(scope.$parent, '$broadcast');

            scope.showDashboard("dashboard");
            expect(scope.$parent.$broadcast).toHaveBeenCalledWith('event:switchDashboard', 'dashboard');
            expect(scope.showDashboardMenu).toBeFalsy();
        });
    });

    describe("enablePatientSearch", function () {
        it("should return true if configured", function () {
            appService.getAppDescriptor.and.returnValue({
                getConfigValue: function (configName) {
                    return configName == 'allowPatientSwitchOnConsultation';
                }
            });

            expect(scope.enablePatientSearch()).toBe(true);
        });

        it("should return false if configured", function () {
            appService.getAppDescriptor.and.returnValue({
                getConfigValue: function (configName) {
                    return configName != 'allowPatientSwitchOnConsultation';
                }
            });

            expect(scope.enablePatientSearch()).toBe(false);
        });

        it("should return false if configured value is null", function () {
            appService.getAppDescriptor.and.returnValue({
                getConfigValue: function (configName) {
                    return configName == 'allowPatientSwitchOnConsultation' ? null : true;
                }
            });

            expect(scope.enablePatientSearch()).toBe(false);
        });

        it("should return false if configured value is empty string", function () {
            appService.getAppDescriptor.and.returnValue({
                getConfigValue: function (configName) {
                    return configName == 'allowPatientSwitchOnConsultation' ? "" : true;
                }
            });

            expect(scope.enablePatientSearch()).toBe(false);
        });

        it("should return false if configured value is string", function () {
            appService.getAppDescriptor.and.returnValue({
                getConfigValue: function (configName) {
                    return configName == 'allowPatientSwitchOnConsultation' ? "some value" : true;
                }
            });

            expect(scope.enablePatientSearch()).toBe(false);
        });

        it("should return false if configured value is numeric", function () {
            appService.getAppDescriptor.and.returnValue({
                getConfigValue: function (configName) {
                    return configName == 'allowPatientSwitchOnConsultation' ? 10 : true;
                }
            });

            expect(scope.enablePatientSearch()).toBe(false);
        });
    });

    describe("save",function(){
        it("should test presave promise",function(){

            scope.consultation = {discontinuedDrugs: [{dateStopped: new Date()}],preSaveHandler: new Bahmni.Clinical.Notifier(),observations:[]};

            scope.save();
        });
    })
});