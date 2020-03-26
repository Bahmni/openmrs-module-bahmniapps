'use strict';

describe("ConsultationController", function () {
    var scope, rootScope, state, contextChangeHandler, urlHelper, location, clinicalAppConfigService,
        stateParams, appService, ngDialog, q, appDescriptor, controller, visitConfig, _window_, clinicalDashboardConfig,
        sessionService, conditionsService, encounterService, configurations, diagnosisService, messagingService, spinnerMock,
        auditLogService;

    var encounterData = {
        "bahmniDiagnoses": [],
        "observations": [
            {
                "encounterDateTime": 1492592793000,
                "visitStartDateTime": null,
                "groupMembers": [
                    {
                        "encounterDateTime": 1492592793000,
                        "groupMembers": [],
                        "type": "Boolean",
                        "encounterUuid": "2ade5330-2e81-40e8-aa24-43d84ad4e3b2",
                        "obsGroupUuid": "ad986314-114c-4770-be60-e44eacbc30dc",
                        "conceptNameToDisplay": "Smoking History",
                        "observationDateTime": "2017-04-19T14:38:26.000+0530",
                        "voided": false,
                        "concept": {
                            "uuid": "c2a43174-c9db-4e54-8516-17372c83537f",
                            "name": "Smoking History",
                            "dataType": "Boolean",
                            "shortName": "Smoking History"
                        },
                        "valueAsString": "Yes",
                        "conceptUuid": "c2a43174-c9db-4e54-8516-17372c83537f",
                        "uuid": "5d1483c0-222d-46a8-92b1-64361395dc4c",
                        "value": true,
                        "comment": null
                    }
                ],
                "providers": [
                    {
                        "uuid": "c19c914b-a9f0-4f2b-a148-20e72788d314",
                        "name": "nurseOne nurseOne",
                        "encounterRoleUuid": "a0b03050-c99b-11e0-9572-0800200c9a66"
                    }
                ],
                "encounterUuid": "2ade5330-2e81-40e8-aa24-43d84ad4e3b2",
                "parentConceptUuid": null,
                "conceptNameToDisplay": "History and Examination",
                "orderUuid": null,
                "observationDateTime": "2017-04-19T14:38:26.000+0530",
                "voided": false,
                "concept": {
                    "uuid": "c393fd1d-3f10-11e4-adec-0800271c1b75",
                    "name": "History and Examination",
                    "dataType": "N/A",
                    "shortName": "History and Examination",
                    "conceptClass": "Misc",
                    "set": true
                },
                "valueAsString": "true",
                "conceptUuid": "c393fd1d-3f10-11e4-adec-0800271c1b75",
                "uuid": "ad986314-114c-4770-be60-e44eacbc30dc",
                "value": "true"
            }
        ],
        "encounterType": "FIELD",
        "visitType": null,
        "patientId": "GAN203128",
        "patientUuid": "c699a5e8-c08a-451f-6793-1cf925a7a204",
        "drugOrders": [],
        "encounterTypeUuid": "71e22322-dda5-4194-af60-29e2202a5b3f",
        "locationUuid": "c1f25be5-3f10-11e4-adec-0800271c1b75",
        "encounterDateTime": "2017-04-19T14:36:33.000+0530",
        "encounterUuid": "2ade5330-2e81-40e8-aa24-43d84ad4e3b2",
        "visitUuid": "fe429540-c977-49ad-8ed8-6c3e39fa706d",
        "visitTypeUuid": "c5fb299e-4dcf-41ee-a98c-210fe2d4d6d0",
        "locationName": "Subcenter 1 (BAM)",
        "orders": [],
        "providers": [
            {
                "uuid": "c19c914b-a9f0-4f2b-a148-20e72788d314",
                "name": "nurseOne nurseOne",
                "encounterRoleUuid": "a0b03050-c99b-11e0-9572-0800200c9a66"
            }
        ],
        "context": {},
        "extensions": {
            "mdrtbSpecimen": []
        }
    };
    clinicalDashboardConfig = jasmine.createSpyObj('clinicalDashboardConfig', ['isCurrentTab']);
    var translate = jasmine.createSpyObj('$translate', ['instant']);
    appService = jasmine.createSpyObj('appService', ['getAppDescriptor', 'getConfigValue']);
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
    var createController = function () {
        return controller('ConsultationController', {
            $scope: scope,
            $rootScope: rootScope,
            $state: state,
            $location: location,
            $translate: translate,
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
            visitConfig: visitConfig,
            conditionsService: conditionsService,
            encounterService: encounterService,
            configurations: configurations,
            diagnosisService: diagnosisService,
            messagingService: messagingService,
            spinner: spinnerMock,
            auditLogService: auditLogService
        });
    };
    var setUpServiceMocks = function () {
        location = {
            path: function () {
            }, url: function (url) {
                return url;
            }
        };

        clinicalAppConfigService = {
            getAllConsultationBoards: function () {
                return boards;
            },
            getConsultationBoardLink: function () {
                return [];
            },
            getVisitTypeForRetrospectiveEntries: function () {
                return {};
            },
            getDefaultVisitType: function () {
                return "IPD";
            }
        };

        sessionService = {
            getLoginLocationUuid: function () {
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
            },
            transitionTo: function (state, paramOne) {
                return {};
            }
        };
        contextChangeHandler = {
            execute: function () {
                return {allow: true};
            }, reset: function () {
            }
        };
        urlHelper = {
            getPatientUrl: function () {
                return "/patient/somePatientUuid/dashboard";
            }
        };
        ngDialog = jasmine.createSpyObj('ngDialog', ['close', 'closeAll']);
        rootScope.collapseControlPanel = function () {
        };
        rootScope.currentProvider = { uuid: 'providerUuid' };
        scope.lastConsultationTabUrl = {url: {}};
        q = jasmine.createSpyObj('q', ['all', 'defer']);
        visitConfig = {};
        configurations = {
            dosageFrequencyConfig: function () {
                return {};
            },
            dosageInstructionConfig: function () {
                return {};
            },
            consultationNoteConcept: function () {
                return {};
            },
            labOrderNotesConcept: function () {
                return {};
            },
            stoppedOrderReasonConfig: function () {
                return {};
            }
        };
        conditionsService = jasmine.createSpyObj('conditionalService', ['save', 'getConditions']);
        conditionsService.save.and.returnValue(specUtil.simplePromise({}));
        conditionsService.getConditions.and.returnValue([{uuid: "condition-uuid", conditionNonCoded: "fever"}]);
        encounterService = jasmine.createSpyObj('encounterService', ['getEncounterType', 'create']);
        encounterService.getEncounterType.and.returnValue(specUtil.simplePromise({}));
        messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
        diagnosisService = jasmine.createSpyObj('diagnosisService', ['populateDiagnosisInformation']);
        encounterService.create.and.returnValue(specUtil.createFakePromise(encounterData));
        encounterService.create.and.callFake(function () {
            var deferred = Q.defer();
            deferred.resolve({data: encounterData});
            return deferred.promise;
        });
        spinnerMock = {
            forPromise: function (promise, element) {
                return promise;
            }
        };
        auditLogService = jasmine.createSpyObj('auditLogService', ['log']);
        auditLogService.log.and.returnValue({});
    };
    beforeEach(module('bahmni.common.util'));
    beforeEach(module('bahmni.clinical'));
    beforeEach(function () {
        inject(function ($controller, $rootScope, _$window_) {
            _window_ = _$window_;
            scope = $rootScope.$new();
            rootScope = $rootScope;
            controller = $controller;
        });
        appDescriptor = {
            formatUrl: function (url) {
                return url;
            },
            getConfigValue: function (value) {
                if(value === 'adtNavigationConfig') {
                    return {forwardUrl: "../bedmanagement/#/bedManagement/patient/{{patientUuid}}/visit/{{visitUuid}}", "privilege": "app:adt"};
                }
                return true;
            }
        };
        appService.getAppDescriptor.and.returnValue(appDescriptor);
    });
    beforeEach(setUpServiceMocks);
    beforeEach(createController);

    describe("init", function () {
        it("should initialize all the necessary variables", function () {
            expect(scope.togglePrintList).toBeFalsy();
            expect(scope.patient).toEqual({});
            expect(scope.showDashboardMenu).toBeFalsy();
            expect(scope.showComment).toBeTruthy();
            expect(scope.consultationBoardLink).toEqual([]);
            expect(scope.showControlPanel).toBeFalsy();
        });

        it("should initialize the available boards", function () {
            expect(scope.availableBoards.length).toBe(2);
        });

        it("current board should not be set if dashboard is clicked", function () {
            location = {
                path: function () {
                }, url: function (url) {
                    return "/default/patient/somePatientUuid/dashboard";
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

        it("should get ipd configuration from config", function () {
            appDescriptor = {
                formatUrl: function (url) {
                    return url;
                },
                getConfigValue: function (value) {
                    if(value === 'adtNavigationConfig') {
                        return {forwardUrl: "../bedmanagement/#/bedManagement/patient/{{patientUuid}}/visit/{{visitUuid}}", "privilege": "app:adt"};
                    }
                    return true;
                }
            };
            scope.adtNavigationConfig = {forwardUrl: "../bedmanagement/#/bedManagement/patient/{{patientUuid}}/visit/{{visitUuid}}"};
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            createController();
            expect(scope.adtNavigationConfig.forwardUrl).toEqual("../bedmanagement/#/bedManagement/patient/{{patientUuid}}/visit/{{visitUuid}}");
        });
    });

    describe("tabUrl", function () {
        it("should return proper URL when showing a different board", function () {
            scope.lastConsultationTabUrl = {url: undefined};
            scope.consultation = {discontinuedDrugs: [{dateStopped: new Date()}]};
            var newUrl = scope.showBoard(1);
            expect(newUrl).toEqual("/default/patient/somePatientUuid/dashboard/treatment?encounterUuid=someEncounterUuid&programUuid=someProgramUuid&enrollment=somePatientProgramUuid&tabConfigName=tbTabConfig");
            expect(scope.currentBoard.label).toBe("Treatment");
            expect(scope.currentBoard.isSelectedTab).toBeTruthy();
            expect(scope.lastConsultationTabUrl.url).toBe(newUrl);
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
                    return "/default/patient/somePatientUuid/dashboard/treatment?programUuid=someProgramUuid&tabConfigName=tbTabConfig";
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
            );
        });

        it("should set current tab based on the tab config provided", function () {
            location = {
                path: function () {
                }, url: function (url) {
                    return "/default/patient/somePatientUuid/dashboard/treatment?programUuid=someProgramUuid&tabConfigName=nonTbTabConfig";
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
            expect(scope.currentBoard).toEqual(expectedCurrentBoard);
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

    describe("showSaveConfirmDialogConfig", function () {
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
                getConfigValue: function (value) {
                    if(value === 'adtNavigationConfig') {
                        return {forwardUrl: "../bedmanagement/#/bedManagement/patient/{{patientUuid}}/visit/{{visitUuid}}", "privilege": "app:adt"};
                    }
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
                getConfigValue: function (value) {
                    if(value === 'adtNavigationConfig') {
                        return {forwardUrl: "../bedmanagement/#/bedManagement/patient/{{patientUuid}}/visit/{{visitUuid}}", "privilege": "app:adt"};
                    }
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

    describe("save", function () {
        it("should save encounter data", function (done) {
            scope.consultation = {discontinuedDrugs: [{dateStopped: new Date()}], preSaveHandler: new Bahmni.Clinical.Notifier(), postSaveHandler: new Bahmni.Clinical.Notifier(), observations: [], conditions: [{condition: {}}]};
            scope.patient = {
                uuid: "patient-uuid"
            };
            diagnosisService.populateDiagnosisInformation.and.returnValue(specUtil.createFakePromise(scope.consultation));
            scope.save({toState: {}}).then(function () {
                expect(encounterService.create).toHaveBeenCalled();
                expect(auditLogService.log).toHaveBeenCalledWith(scope.patient.uuid, "EDIT_ENCOUNTER", {encounterUuid: encounterData.encounterUuid, encounterType: encounterData.encounterType}, "MODULE_LABEL_CLINICAL_KEY");
                expect(conditionsService.save).toHaveBeenCalledWith(scope.consultation.conditions, "patient-uuid");
                expect(messagingService.showMessage).toHaveBeenCalledWith('info', "{{'CLINICAL_SAVE_SUCCESS_MESSAGE_KEY' | translate}}");
                done();
            });
        });

        it("should not save encounter data if there errors in form", function (done) {
            scope.consultation = {discontinuedDrugs: [{dateStopped: new Date()}], preSaveHandler: new Bahmni.Clinical.Notifier(), postSaveHandler: new Bahmni.Clinical.Notifier(), observations: [], conditions: [{condition: {}}], observationForms: [{component: {getValue: function () {
                return {errors: {}};
            }}}]};
            scope.patient = {
                uuid: "patient-uuid"
            };
            scope.$parent = {
                $parent: {
                    $broadcast: function () {
                        return {};
                    }
                }
            };
            spyOn(scope.$parent.$parent, '$broadcast');
            diagnosisService.populateDiagnosisInformation.and.returnValue(specUtil.createFakePromise(scope.consultation));
            scope.save({toState: {}}).then(function () {
                expect(scope.$parent.$parent.$broadcast).toHaveBeenCalledWith('event:errorsOnForm');
                done();
            });
        });

        it("should save conditions to consultation after encounter save", function (done) {
            scope.consultation = {
                discontinuedDrugs: [{dateStopped: new Date()}],
                preSaveHandler: new Bahmni.Clinical.Notifier(),
                postSaveHandler: new Bahmni.Clinical.Notifier(),
                observations: []
            };
            var conditions = [ {uuid: undefined, conditionNonCoded: "fever"}];
            scope.consultation["conditions"] = conditions;
            scope.patient = {
                uuid: "patient-uuid"
            };
            diagnosisService.populateDiagnosisInformation.and.returnValue(specUtil.simplePromise(scope.consultation));
            scope.save({toState: {}}).then(function () {
                expect(encounterService.create).toHaveBeenCalled();
                expect(conditionsService.save).toHaveBeenCalledWith(conditions, "patient-uuid");
                expect(messagingService.showMessage).toHaveBeenCalledWith('info', "{{'CLINICAL_SAVE_SUCCESS_MESSAGE_KEY' | translate}}");
                expect(scope.$parent.consultation.conditions[0].uuid).toEqual("condition-uuid");
                done();
            });
        });

        it("should throw error if save conditions failed after encounter save", function (done) {
            scope.consultation = {
                discontinuedDrugs: [{dateStopped: new Date()}],
                preSaveHandler: new Bahmni.Clinical.Notifier(),
                postSaveHandler: new Bahmni.Clinical.Notifier(),
                observations: [],
                conditions: [{uuid: undefined, conditionNonCoded: "fever"}]
            };
            scope.patient = {
                uuid: "patient-uuid"
            };
            diagnosisService.populateDiagnosisInformation.and.returnValue(specUtil.simplePromise(scope.consultation));
            conditionsService.save.and.callFake(function () {
                var deferred1 = Q.defer();
                deferred1.reject("error");
                return deferred1.promise;
            });
            scope.save({toState: {}}).then(function () {
                expect(encounterService.create).toHaveBeenCalled();
                expect(conditionsService.save).toHaveBeenCalledWith(scope.consultation.conditions, "patient-uuid");
                expect(scope.$parent.consultation.conditions[0].uuid).toEqual(undefined);
                done();
            });
        });

        it("should not make api calls and call showMessage of messagingService when there is error in form save " +
            "event when there is a single error", function (done) {
            scope.consultation = {
                discontinuedDrugs: [{dateStopped: new Date()}],
                preSaveHandler: new Bahmni.Clinical.Notifier(),
                postSaveHandler: new Bahmni.Clinical.Notifier(),
                observations: [],
                observationForms: [{
                    isAdded: true,
                    component: {
                        getValue: function () {
                            return {}
                        },
                        state: {data: {}},
                        props: {patient: {}},
                    },
                    events: {
                        onFormSave: 'Save event'
                    }
                }],
                conditions: [{uuid: undefined, conditionNonCoded: "fever"}]
            };
            window.runEventScript = function() {
                throw {message: 'Error'};
            };

            scope.save({toState: {}}).then(function () {
                expect(encounterService.getEncounterType).not.toHaveBeenCalled();
                expect(encounterService.create).not.toHaveBeenCalled();
                expect(conditionsService.save).not.toHaveBeenCalled();
                expect(messagingService.showMessage).toHaveBeenCalledWith('error', 'Error');
                done();
            });
        });

        it("should call messagingService n times for n number of errors and api calls aren't made on FormSave event ", function (done) {
            scope.consultation = {
                discontinuedDrugs: [{dateStopped: new Date()}],
                preSaveHandler: new Bahmni.Clinical.Notifier(),
                postSaveHandler: new Bahmni.Clinical.Notifier(),
                observations: [],
                observationForms: [{
                    isAdded: true,
                    component: {
                        getValue: function () {
                            return {}
                        },
                        state: {data: {}},
                        props: {patient: {}},
                    },
                    events: {
                        onFormSave: 'Save event'
                    }
                }],
                conditions: [{uuid: undefined, conditionNonCoded: "fever"}]
            };
            window.runEventScript = function () {
                throw [{message: 'Error1'}, {message: ''}, {mesage: 'Error3'}];
            };

            scope.save({toState: {}}).then(function () {
                expect(encounterService.getEncounterType).not.toHaveBeenCalled();
                expect(encounterService.create).not.toHaveBeenCalled();
                expect(conditionsService.save).not.toHaveBeenCalled();
                expect(messagingService.showMessage.calls.count()).toBe(3);
                expect(messagingService.showMessage).toHaveBeenCalledWith('error', 'Error1');
                expect(messagingService.showMessage).toHaveBeenCalledWith('error', '[ERROR]');
                expect(messagingService.showMessage).toHaveBeenCalledWith('error', '[ERROR]');
                done();
            });
        });
    });

    it("should generate the URL as mentioned in the config", function () {
        appDescriptor = {
            formatUrl: function (url) {
                return url;
            },
            getConfigValue: function () {
                return true;
            }
        };
        scope.adtNavigationConfig = {forwardUrl: "../bedmanagement/#/bedManagement/patient/{{patientUuid}}/visit/{{visitUuid}}"};
        appService.getAppDescriptor.and.returnValue(appDescriptor);

        expect(scope.adtNavigationURL()).toEqual("../bedmanagement/#/bedManagement/patient/{{patientUuid}}/visit/{{visitUuid}}");
    });

    it("should initialize with default adtNavigationConfig if we are not mentioning anything in config", function () {
        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function (value) {
                if(value === 'adtNavigationConfig') {
                    return {};
                }
                return true;
            }
        });
        translate.instant.and.returnValue("Go to IPD Dashboard");
        createController();

        expect(scope.adtNavigationConfig.privilege).toBe("app:adt");
        expect(scope.adtNavigationConfig.title).toBe("Go to IPD Dashboard");
        expect(scope.adtNavigationConfig.forwardUrl).toBe("../adt/#/patient/{{patientUuid}}/visit/{{visitUuid}}/");
    });

    it("should initialize with adtNavigationConfig if we mention in config", function () {
        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function (value) {
                if(value === 'adtNavigationConfig') {
                    return {privilege: "app:ipd", title: "Go to ADT Dashboard"};
                }
                return true;
            }
        });
        createController();

        expect(scope.adtNavigationConfig.privilege).toBe("app:ipd");
        expect(scope.adtNavigationConfig.title).toBe("Go to ADT Dashboard");
        expect(scope.adtNavigationConfig.forwardUrl).toBe("../adt/#/patient/{{patientUuid}}/visit/{{visitUuid}}/");
    });
});
