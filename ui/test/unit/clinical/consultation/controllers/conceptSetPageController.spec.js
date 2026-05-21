/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

describe('ConceptSetPageController', function () {
    var scope, controller, rootScope, conceptSetService, configurations, clinicalAppConfigService, state, encounterConfig, spinner, messagingService, translate, stateParams, formService, appService, formDraftService, autoSaveService;
    stateParams = {conceptSetGroupName: "concept set group name"};
    var extension = {"extension": {
        extensionParams: {}
    }};
    beforeEach(module('bahmni.common.uiHelper'));
    beforeEach(module('bahmni.clinical'));
    beforeEach(module(function ($provide) {
        var appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
        appDescriptor.getConfigValue.and.returnValue(false);
        var mockAppService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        mockAppService.getAppDescriptor.and.returnValue(appDescriptor);
        $provide.value('appService', mockAppService);
    }));
    var initController = function () {
        inject(function ($controller, $rootScope, _appService_, _autoSaveService_) {
            controller = $controller;
            scope = $rootScope.$new();
            rootScope = $rootScope;
            appService = _appService_;
            autoSaveService = _autoSaveService_;
        });

        rootScope.currentUser = {
            isFavouriteObsTemplate: function () {
                return true;
            }
        };

        var register = function () {
        };
        var handlers = {};
        var fire = function () {
            Object.keys(handlers).forEach(function (key) {
                handlers[key]();
            });
        };

        scope.consultation = {
            preSaveHandler: {
                register: register,
                fire: fire
            },
            postSaveHandler: {
                register: function (key, handler) {
                    handlers[key] = handler;
                },
                fire: fire
            }
        };

        state = {
            params: {}
        };

        encounterConfig = jasmine.createSpyObj("encounterConfig", ["getVisitTypeByUuid"]);
        clinicalAppConfigService = jasmine.createSpyObj("clinicalAppConfigService", ["getAllConceptSetExtensions", "getAllConceptsConfig"]);
        var configs = {
            "Baseline": {
                "allowAddMore": true
            },
            "Followup Assessment": {
                "allowAddMore": true
            }
        };
        clinicalAppConfigService.getAllConceptsConfig.and.returnValue(configs);
        configurations = jasmine.createSpyObj("configurations", ["encounterConfig"]);
        configurations.encounterConfig.and.returnValue(encounterConfig);
        conceptSetService = jasmine.createSpyObj("conceptSetService", ["getConcept", "getObsTemplatesForProgram"]);
        formService = jasmine.createSpyObj("formService", ["getFormList"]);
        spinner = jasmine.createSpyObj("spinner", ["forPromise"]);
        messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
        translate = jasmine.createSpyObj('$translate', ['instant']);
        formDraftService = jasmine.createSpyObj('formDraftService', ['saveDraft', 'getDraft']);
        formDraftService.getDraft.and.returnValue({
            then: function (success, error) {
                if (error) error();
                return this;
            },
            catch: function () {
                return this;
            }
        });
    };

    beforeEach(initController);

    var createController = function () {
        clinicalAppConfigService.getAllConceptSetExtensions.and.returnValue(extension);
        return controller("ConceptSetPageController", {
            $scope: scope,
            $rootScope: rootScope,
            $stateParams: stateParams,
            conceptSetService: conceptSetService,
            formService: formService,
            clinicalAppConfigService: clinicalAppConfigService,
            messagingService: messagingService,
            configurations: configurations,
            $state: state,
            spinner: spinner,
            $translate: translate,
            appService: appService,
            formDraftService: formDraftService,
            autoSaveService: autoSaveService
        });
    };

    var mockConceptSetService = function (conceptResponseData, entityMappingResponseData) {
        conceptSetService.getConcept.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({"data" :conceptResponseData});
                }
            }
        });

        conceptSetService.getObsTemplatesForProgram.and.callFake(function () {
            return {
                success: function (callback) {
                    return callback(entityMappingResponseData);
                }
            }
        });
    };

    var mockformService = function (data) {
        formService.getFormList.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({"data" :data});
                }
            }
        });
    };

    describe('init', function () {
        it("should load all obs templates", function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "abcd"}, uuid: 123}]
                    }
                ]
            };
            mockConceptSetService(conceptResponseData);
            mockformService({});
            rootScope.currentUser = {
                isFavouriteObsTemplate: function () {
                    return false;
                }
            };
            createController();

            expect(scope.allTemplates).toBeTruthy();
            expect(scope.allTemplates.length).toEqual(1);
            expect(scope.allTemplates[0].conceptName).toEqual("abcd");

            expect(scope.consultation.selectedObsTemplate.length).toBe(0);
        });

        it("should load the form2 forms", function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "abcd"}, uuid: 123}]
                    }
                ]
            };
            mockConceptSetService(conceptResponseData);
            let nameTranslationForSimpleForm = [{locale:'en', display:'Simple_en'},
                {locale:'es', display:'Simple_es'}];
            var form2Data= [{
                    name: "Sample",
                    uuid:"96d89bfe-8b42-493c-bcc0-284ce0f5d12b",
                    version: "1",
                    published: true,
                    id: null,
                    resources: null,
                    nameTranslation: null,
                    privileges: []
                },
                {
                    name: "Simple",
                    uuid: "71a11931-56bf-4792-9d12-81836aca0b1c",
                    version: "9",
                    published: true,
                    id: null,
                    resources: null,
                    nameTranslation: JSON.stringify(nameTranslationForSimpleForm),
                    privileges: []
                }];
            mockformService(form2Data);
            rootScope.currentUser = {
                isFavouriteObsTemplate: function () {
                    return false;
                }
            };
            localStorage.setItem("NG_TRANSLATE_LANG_KEY", "en");
            createController();
            expect(scope.consultation.observationForms[0].formName).toEqual( form2Data[0].name);
            expect(scope.consultation.observationForms[0].label).toEqual( form2Data[0].name);
            expect(scope.consultation.observationForms[0].conceptName).toEqual( form2Data[0].name);
            expect(scope.consultation.observationForms[0].formUuid).toEqual( form2Data[0].uuid);
            expect(scope.consultation.observationForms[0].formVersion).toEqual( form2Data[0].version);

            expect(scope.consultation.observationForms[1].formName).toEqual( form2Data[1].name);
            expect(scope.consultation.observationForms[1].label).toEqual( nameTranslationForSimpleForm[0].display);
            expect(scope.consultation.observationForms[1].conceptName).toEqual( form2Data[1].name);
            expect(scope.consultation.observationForms[1].formUuid).toEqual( form2Data[1].uuid);
            expect(scope.consultation.observationForms[1].formVersion).toEqual( form2Data[1].version);
        });

        it("should load all obs templates along with forms from implementers interface", function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "abcd"}, uuid: 123}]
                    }
                ]
            };
            mockConceptSetService(conceptResponseData);
            var data = [
                {
                    name: "my form",
                    version: 1,
                    uuid: "my-form-uuid",
                    privileges: []
                }
            ];
            mockformService(data);
            rootScope.currentUser = {
                isFavouriteObsTemplate: function () {
                    return false;
                }
            };
            createController();

            expect(scope.allTemplates).toBeTruthy();
            expect(scope.allTemplates.length).toEqual(2);
            expect(scope.allTemplates[0].conceptName).toEqual("abcd");
            expect(scope.allTemplates[1].formName).toEqual("my form");

            expect(scope.consultation.selectedObsTemplate.length).toBe(0);
        });

        it("should push template to selected obs template when template is pinned as favorite", function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "abcd"}, uuid: 123}]
                    }
                ]
            };
            var data = [
                {
                    name: "my form",
                    version: 1,
                    uuid: "my-form-uuid",
                    privileges: []
                }
            ];
            mockConceptSetService(conceptResponseData);
            mockformService(data);
            createController();

            expect(scope.allTemplates).toBeTruthy();
            expect(scope.allTemplates.length).toEqual(2);
            expect(scope.allTemplates[0].conceptName).toEqual("abcd");
            expect(scope.allTemplates[1].conceptName).toEqual("my form");
            expect(scope.consultation.selectedObsTemplate.length).toBe(2);
            expect(scope.consultation.selectedObsTemplate[0].label).toBe("abcd");
            expect(scope.consultation.selectedObsTemplate[1].label).toBe("my form");
        });

        it("should push template to selected obs template when template is added as default in extensions", function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "abcd"}, uuid: 123}]
                    }
                ]
            };
            mockConceptSetService(conceptResponseData);
            mockformService({});
            rootScope.currentUser = {
                isFavouriteObsTemplate: function () {
                    return false;
                }
            };
            extension = {"extension": {
                extensionParams: {conceptName: "abcd", default: true}
            }};

            createController();

            expect(scope.allTemplates).toBeTruthy();
            expect(scope.allTemplates.length).toEqual(1);
            expect(scope.allTemplates[0].conceptName).toEqual("abcd");
            expect(scope.consultation.selectedObsTemplate.length).toBe(1);
            expect(scope.consultation.selectedObsTemplate[0].label).toBe("abcd");
            expect(scope.consultation.selectedObsTemplate[0].isOpen).toBeTruthy();
            expect(scope.consultation.selectedObsTemplate[0].isLoaded).toBeTruthy();
            expect(scope.consultation.selectedObsTemplate[0].klass).toBe("active");

        });

        it("should load all obs templates according to the number of observations", function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "abcd"}, uuid: 123}]
                    }
                ]
            };
            var data = [
                {
                    name: "my form",
                    version: '1',
                    uuid: "my-form-uuid",
                    privileges: []
                }
            ];
            mockConceptSetService(conceptResponseData);
            mockformService(data);

            scope.patient = {}
            scope.consultation.observations = [{
                concept: {
                    name: "abcd",
                    uuid: 123
                },
                uuid: "cafedead"
            }, {
                concept: {
                    name: "abcd",
                    uuid: 123
                },
                uuid: "deadcafe"
            }, {
                concept: {
                    name: "random",
                    uuid: 124
                },
                formFieldPath: "my form.1/101",
                uuid: "random-uuid",
                privileges: []
            }];
            createController();

            expect(scope.allTemplates).toBeTruthy();
            expect(scope.allTemplates.length).toEqual(3);

            expect(scope.consultation.selectedObsTemplate).toBeTruthy();
            expect(scope.consultation.selectedObsTemplate.length).toEqual(3);

            expect(scope.consultation.selectedObsTemplate[0].conceptName).toEqual("abcd");
            expect(scope.consultation.selectedObsTemplate[0].observations[0].uuid).toEqual("cafedead");
            expect(scope.consultation.selectedObsTemplate[0].uuid).toEqual(123);

            expect(scope.consultation.selectedObsTemplate[1].conceptName).toEqual("abcd");
            expect(scope.consultation.selectedObsTemplate[1].observations[0].uuid).toEqual("deadcafe");
            expect(scope.consultation.selectedObsTemplate[1].uuid).toEqual(123);

            expect(scope.consultation.selectedObsTemplate[2].formName).toEqual("my form");
            expect(scope.consultation.selectedObsTemplate[2].observations[0].uuid).toEqual("random-uuid");
            expect(scope.consultation.selectedObsTemplate[2].formUuid).toEqual("my-form-uuid");
        });

        it("should load all templates specific to program when program uuid is present", function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "abcd"}, uuid: 123}, {name: {name: "efgh"}, uuid: 456}]
                    }
                ]
            };
            var entityMappingResponseData = {
                results: [{mappings: [{uuid: 456}]}]
            };
            mockConceptSetService(conceptResponseData, entityMappingResponseData);
            mockformService({});
            state = {
                params: {
                    programUuid: "programUuid"
                }
            };
            createController();

            expect(scope.allTemplates).toBeTruthy();
            expect(scope.allTemplates.length).toEqual(2);

            expect(scope.allTemplates[0].conceptName).toEqual("abcd");
            expect(scope.allTemplates[0].isAdded).toBeFalsy();
            expect(scope.allTemplates[0].alwaysShow).toBeFalsy();

            expect(scope.allTemplates[1].conceptName).toEqual("efgh");
            expect(scope.allTemplates[1].isAdded).toBeFalsy();
            expect(scope.allTemplates[1].alwaysShow).toBeTruthy();
        });

        it("should add template to the list when clicked", function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "abcd"}, uuid: 123},
                            {name: {name: "Followup Assessment"}, uuid: 124},
                            {name: {name: "Baseline"}, uuid: 125},
                            {name: {name: "Baseline1"}, uuid: 126}
                        ]
                    }
                ]
            };
            mockConceptSetService(conceptResponseData);
            mockformService({});
            scope.patient = {}
            scope.consultation.observations = [{
                concept: {
                    name: "abcd",
                    uuid: 123
                },
                uuid: "cafedead"
            }, {
                concept: {
                    name: "Followup Assessment",
                    uuid: 124
                },
                uuid: "deadcafe"
            }];
            rootScope.currentUser = {
                isFavouriteObsTemplate: function () {
                    return false;
                }
            };

            createController();

            expect(scope.allTemplates.length).toEqual(4);
            expect(scope.consultation.selectedObsTemplate.length).toEqual(2);

            expect(scope.consultation.selectedObsTemplate[0].isOpen).toBeTruthy();
            expect(scope.consultation.selectedObsTemplate[0].isLoaded).toBeTruthy();
            expect(scope.consultation.selectedObsTemplate[0].klass).toBe("active");

            scope.consultation.selectedObsTemplate[1].isAdded = true;
            scope.addTemplate({label : "Followup Assessment", clone : function () {return {label : "Followup Assessment"}}});
            expect(scope.consultation.selectedObsTemplate.length).toEqual(3);
            expect(scope.consultation.selectedObsTemplate[2].klass).toBe("active");

            scope.addTemplate({label : "Baseline", toggle : function () {}});
            expect(scope.consultation.selectedObsTemplate.length).toEqual(4);
            var baselineTemplate = scope.consultation.selectedObsTemplate[2];
            expect(baselineTemplate.klass).toBe("active");

            scope.addTemplate({label : "Baseline1", toggle : function () {}});
            expect(scope.consultation.selectedObsTemplate.length).toEqual(5);
            var baseline1Template = scope.consultation.selectedObsTemplate[3];
            expect(baseline1Template.klass).toBe("active");
            expect(messagingService.showMessage).toHaveBeenCalled();
        });

        it("should sort templates based on the order it is saved and open the last visited template", function() {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "Baseline"}, uuid: 123}, {name: {name: "Followup Assessment"}, uuid: 124}]
                    }
                ]
            };

            mockConceptSetService(conceptResponseData);
            mockformService({});
            var observations = [{
                concept: {
                    name: "Baseline",
                    uuid: 123
                },
                uuid: "cafedead"
            }, {
                concept: {
                    name: "Followup Assessment",
                    uuid: 124
                },
                uuid: "deadcafe"
            }];

            scope.patient = {uuid: "patientUuid"}

            scope.consultation.observations = observations;

            var templatePreference = {
                "patientUuid": "patientUuid",
                "providerUuid": 'providerUuid',
                "templates": ["Followup Assessment", "Baseline"]
            };

            localStorage.setItem("templatePreference", JSON.stringify(templatePreference));
            rootScope.currentUser = {
                isFavouriteObsTemplate: function () {
                    return false;
                }
            };
            rootScope.currentProvider = { uuid: "providerUuid" };
            scope.consultation.lastvisited = 'concept-set-123';

            createController();

            expect(scope.consultation.observations.length).toBe(2);
            expect(scope.consultation.selectedObsTemplate[0].label).toBe("Followup Assessment");
            expect(scope.consultation.selectedObsTemplate[1].label).toBe("Baseline");
            expect(scope.consultation.selectedObsTemplate[1].isOpen).toBeTruthy();
            expect(scope.consultation.selectedObsTemplate[1].isLoaded).toBeTruthy();
            expect(scope.consultation.selectedObsTemplate[1].klass).toBe("active");
        });
    });

    describe('Feature Toggle - enableFormDraftFeature', function () {
        it("should set enableFormDraftFeature to true when config value is true", function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "abcd"}, uuid: 123}]
                    }
                ]
            };
            mockConceptSetService(conceptResponseData);
            mockformService({});
            var appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            appDescriptor.getConfigValue.and.returnValue(true);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            rootScope.currentUser = {
                isFavouriteObsTemplate: function () {
                    return false;
                }
            };

            createController();

            expect(scope.enableFormDraftFeature).toBe(true);
        });

        it("should set enableFormDraftFeature to false when config value is false", function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "abcd"}, uuid: 123}]
                    }
                ]
            };
            mockConceptSetService(conceptResponseData);
            mockformService({});
            var appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            appDescriptor.getConfigValue.and.returnValue(false);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            rootScope.currentUser = {
                isFavouriteObsTemplate: function () {
                    return false;
                }
            };

            createController();

            expect(scope.enableFormDraftFeature).toBe(false);
        });

        it("should call appService.getAppDescriptor().getConfigValue() with enableFormDraftFeature", function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: "abcd"}, uuid: 123}]
                    }
                ]
            };
            mockConceptSetService(conceptResponseData);
            mockformService({});
            rootScope.currentUser = {
                isFavouriteObsTemplate: function () {
                    return false;
                }
            };

            createController();

            expect(appService.getAppDescriptor).toHaveBeenCalled();
        });
    })

    describe('Save As Draft', function () {
        var createControllerWithTimeoutAndFilter;

        beforeEach(inject(function ($timeout) {
            createControllerWithTimeoutAndFilter = function (timeoutMock, filterMock, formDraftServiceMock) {
                var defaultFilterMock = function () {
                    return function () {
                        return 'mocked-time';
                    };
                };
                clinicalAppConfigService.getAllConceptSetExtensions.and.returnValue(extension);
                return controller("ConceptSetPageController", {
                    $scope: scope,
                    $rootScope: rootScope,
                    $stateParams: stateParams,
                    conceptSetService: conceptSetService,
                    formService: formService,
                    clinicalAppConfigService: clinicalAppConfigService,
                    messagingService: messagingService,
                    configurations: configurations,
                    $state: state,
                    spinner: spinner,
                    $translate: translate,
                    appService: appService,
                    $timeout: timeoutMock || $timeout,
                    $filter: filterMock || defaultFilterMock,
                    formDraftService: formDraftServiceMock || formDraftService
                });
            };
            scope.visitHistory = {activeVisit: {uuid: 'active-visit-uuid'}};
        }));

        it('should set dirty true when form component observation changes', function () {
            var conceptResponseData = {
                results: [
                    {
                        setMembers: [{name: {name: 'abcd'}, uuid: 123}]
                    }
                ]
            };
            mockConceptSetService(conceptResponseData);
            mockformService({});

            var observationValue;
            var timeoutMock = function (callback, delay) {
                if (delay === 0) {
                    callback();
                }
                return {$$timeoutId: delay};
            };
            timeoutMock.cancel = jasmine.createSpy('cancel');

            createControllerWithTimeoutAndFilter(timeoutMock);

            scope.consultation.selectedObsTemplate = [{
                component: {
                    getValue: function () {
                        return {
                            observations: [{value: observationValue}]
                        };
                    }
                },
                observations: []
            }];

            scope.$digest();
            expect(scope.formDraft.isDirty).toBe(false);

            observationValue = 'updated-value';
            scope.$digest();
            expect(scope.formDraft.isDirty).toBe(true);
        });

        it('should call formDraftService.saveDraft with patient uuid and provider uuid on saveAsDraft', function () {
            var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
            mockConceptSetService(conceptResponseData);
            mockformService({});

            var saveDraftPromise = specUtil.createServicePromise('saveDraft');
            formDraftService.saveDraft.and.returnValue(saveDraftPromise);

            scope.patient = {uuid: 'test-patient-uuid'};
            rootScope.currentProvider = {uuid: 'test-provider-uuid'};

            createControllerWithTimeoutAndFilter();
            scope.saveAsDraft();

            expect(formDraftService.saveDraft).toHaveBeenCalled();
            var callArgs = formDraftService.saveDraft.calls.mostRecent().args;
            expect(callArgs[0]).toBe('test-patient-uuid');
            expect(callArgs[1]).toBe('test-provider-uuid');
        });

        it('should set showSpinner to true when saveAsDraft is called', function () {
            var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
            mockConceptSetService(conceptResponseData);
            mockformService({});

            var saveDraftPromise = specUtil.createServicePromise('saveDraft');
            formDraftService.saveDraft.and.returnValue(saveDraftPromise);

            createControllerWithTimeoutAndFilter();
            scope.saveAsDraft();

            expect(scope.formDraft.showSpinner).toBe(true);
        });

        it('should update status message with server timestamp on successful save', function () {
            var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
            mockConceptSetService(conceptResponseData);
            mockformService({});

            var serverTimestamp = new Date(2026, 3, 8, 10, 30, 0).getTime();
            var saveDraftPromise = specUtil.createServicePromise('saveDraft');
            formDraftService.saveDraft.and.returnValue(saveDraftPromise);

            var filterCallCount = 0;
            var filterMock = function () {
                return function (date, format) {
                    filterCallCount++;
                    if (format === 'dd MMM yyyy') return '08 Apr 2026';
                    if (format === 'hh:mm a') return '10:30 AM';
                    return '';
                };
            };

            createControllerWithTimeoutAndFilter(undefined, filterMock);
            scope.saveAsDraft();

            saveDraftPromise.callThenCallBack({data: {timestamp: serverTimestamp, uuid: 'draft-uuid', markedAsSaved: true}});

            expect(scope.formDraft.statusMessage).toBe('SAVED_AS_DRAFT_KEY');
            expect(scope.formDraft.statusParams.draftDate).toBe('08 Apr 2026');
            expect(scope.formDraft.statusParams.draftTime).toBe('10:30 AM');
            expect(scope.formDraft.isDirty).toBe(false);
            expect(scope.formDraft.statusError).toBe(false);
        });

        it('should set showSpinner to false after successful save', function () {
            var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
            mockConceptSetService(conceptResponseData);
            mockformService({});

            var saveDraftPromise = specUtil.createServicePromise('saveDraft');
            formDraftService.saveDraft.and.returnValue(saveDraftPromise);

            createControllerWithTimeoutAndFilter();
            scope.saveAsDraft();

            expect(scope.formDraft.showSpinner).toBe(true);
            saveDraftPromise.callThenCallBack({data: {timestamp: Date.now(), uuid: 'draft-uuid', markedAsSaved: true}});
            saveDraftPromise['finally'].calls.mostRecent().args[0]();

            expect(scope.formDraft.showSpinner).toBe(false);
        });

        it('should display error message and set statusError on failed save', function () {
            var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
            mockConceptSetService(conceptResponseData);
            mockformService({});

            var saveDraftPromise = specUtil.createServicePromise('saveDraft');
            formDraftService.saveDraft.and.returnValue(saveDraftPromise);

            createControllerWithTimeoutAndFilter();
            scope.saveAsDraft();

            var thenArgs = saveDraftPromise.then.calls.mostRecent().args;
            thenArgs[1]({status: 500, data: {error: {message: 'Server error'}}});

            expect(scope.formDraft.statusMessage).toBe('CHANGES_NOT_SAVED_KEY');
            expect(scope.formDraft.statusError).toBe(true);
        });

        it('should set showSpinner to false after failed save', function () {
            var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
            mockConceptSetService(conceptResponseData);
            mockformService({});

            var saveDraftPromise = specUtil.createServicePromise('saveDraft');
            formDraftService.saveDraft.and.returnValue(saveDraftPromise);

            createControllerWithTimeoutAndFilter();
            scope.saveAsDraft();

            expect(scope.formDraft.showSpinner).toBe(true);
            saveDraftPromise['finally'].calls.mostRecent().args[0]();

            expect(scope.formDraft.showSpinner).toBe(false);
        });

        it('should broadcast draft:saved event with date and time on successful save', function () {
            var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
            mockConceptSetService(conceptResponseData);
            mockformService({});

            var saveDraftPromise = specUtil.createServicePromise('saveDraft');
            formDraftService.saveDraft.and.returnValue(saveDraftPromise);

            var filterMock = function () {
                return function (date, format) {
                    if (format === 'dd MMM yyyy') return '08 Apr 2026';
                    if (format === 'hh:mm a') return '10:30 AM';
                    return '';
                };
            };

            var broadcastSpy = spyOn(rootScope, '$broadcast').and.callThrough();
            createControllerWithTimeoutAndFilter(undefined, filterMock);
            scope.saveAsDraft();

            saveDraftPromise.callThenCallBack({data: {timestamp: Date.now(), uuid: 'draft-uuid', markedAsSaved: true}});

            expect(broadcastSpy).toHaveBeenCalledWith('draft:saved', {draftDate: '08 Apr 2026', draftTime: '10:30 AM'});
        });

        it('should not save draft when there is no active visit', function () {
            var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
            mockConceptSetService(conceptResponseData);
            mockformService({});

            scope.visitHistory = {activeVisit: null};
            createControllerWithTimeoutAndFilter();
            scope.saveAsDraft();

            expect(formDraftService.saveDraft).not.toHaveBeenCalled();
        });

        it('should not save draft when visitHistory is absent', function () {
            var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
            mockConceptSetService(conceptResponseData);
            mockformService({});

            scope.visitHistory = null;
            createControllerWithTimeoutAndFilter();
            scope.saveAsDraft();

            expect(formDraftService.saveDraft).not.toHaveBeenCalled();
        });

        it('should disable Save as Draft button (isDirty = false) when post-save handler is executed', function () {
            var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
            mockConceptSetService(conceptResponseData);
            mockformService({});
            createController();

            scope.formDraft.isDirty = true;
            var postSaveHandler = scope.consultation.postSaveHandler;
            expect(postSaveHandler).toBeDefined();

            postSaveHandler.fire();

            expect(scope.formDraft.isDirty).toBe(false);
        });

        it('should clear draft message immediately when post-save handler is executed', function () {
            var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
            mockConceptSetService(conceptResponseData);
            mockformService({});
            createController();

            scope.formDraft.isDirty = true;
            scope.formDraft.hasDrafts = true;
            scope.formDraft.draftDate = '08 Apr 2026';
            scope.formDraft.draftTime = '10:30 AM';
            scope.formDraft.statusMessage = 'SAVED_AS_DRAFT_KEY';
            scope.formDraft.statusParams = {draftDate: '08 Apr 2026', draftTime: '10:30 AM'};
            scope.formDraft.statusError = true;

            scope.consultation.postSaveHandler.fire();

            expect(scope.formDraft.isDirty).toBe(false);
            expect(scope.formDraft.hasDrafts).toBe(false);
            expect(scope.formDraft.draftDate).toBeNull();
            expect(scope.formDraft.draftTime).toBeNull();
            expect(scope.formDraft.statusMessage).toBeNull();
            expect(scope.formDraft.statusParams).toEqual({});
            expect(scope.formDraft.statusError).toBe(false);
        });

        it('should clear draft status when event:save-started is broadcast', function () {
            var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
            mockConceptSetService(conceptResponseData);
            mockformService({});
            createController();

            scope.formDraft.isDirty = true;
            scope.formDraft.hasDrafts = true;
            scope.formDraft.draftDate = '08 Apr 2026';
            scope.formDraft.draftTime = '10:30 AM';
            scope.formDraft.statusMessage = 'SAVED_AS_DRAFT_KEY';
            scope.formDraft.statusParams = {draftDate: '08 Apr 2026', draftTime: '10:30 AM'};
            scope.formDraft.statusError = true;
            scope.formDraft.showSpinner = true;

            rootScope.$broadcast('event:save-started');

            expect(scope.formDraft.showSpinner).toBe(false);
            expect(scope.formDraft.hasDrafts).toBe(false);
            expect(scope.formDraft.draftDate).toBeNull();
            expect(scope.formDraft.draftTime).toBeNull();
            expect(scope.formDraft.statusMessage).toBeNull();
            expect(scope.formDraft.statusParams).toEqual({});
            expect(scope.formDraft.statusError).toBe(false);
        });

        it('should clear draft status and disable Save as Draft when consultation save succeeds', function () {
            var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
            mockConceptSetService(conceptResponseData);
            mockformService({});
            createController();

            scope.formDraft.isDirty = true;
            scope.formDraft.hasDrafts = true;
            scope.formDraft.draftDate = '08 Apr 2026';
            scope.formDraft.draftTime = '10:30 AM';
            scope.formDraft.statusMessage = 'SAVED_AS_DRAFT_KEY';
            scope.formDraft.statusParams = {draftDate: '08 Apr 2026', draftTime: '10:30 AM'};
            scope.formDraft.statusError = true;
            scope.formDraft.showSpinner = true;

            rootScope.$broadcast('event:save-successful');

            expect(scope.formDraft.isDirty).toBe(false);
            expect(scope.formDraft.showSpinner).toBe(false);
            expect(scope.formDraft.hasDrafts).toBe(false);
            expect(scope.formDraft.draftDate).toBeNull();
            expect(scope.formDraft.draftTime).toBeNull();
            expect(scope.formDraft.statusMessage).toBeNull();
            expect(scope.formDraft.statusParams).toEqual({});
            expect(scope.formDraft.statusError).toBe(false);
        });

        it('should ignore drafts that are already marked as saved when checking existing drafts', function () {
            var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
            mockConceptSetService(conceptResponseData);
            mockformService({});

            scope.patient = {uuid: 'test-patient-uuid'};
            rootScope.currentProvider = {uuid: 'test-provider-uuid'};

            var timeoutMock = function (callback, delay) {
                if (delay === 0 || delay === 500) {
                    callback();
                }
                return {$$timeoutId: delay};
            };
            timeoutMock.cancel = jasmine.createSpy('cancel');

            formDraftService.getDraft.and.returnValue({
                then: function (success) {
                    success({data: {uuid: 'draft-uuid', markedAsSaved: true, timestamp: Date.now()}});
                    return this;
                },
                catch: function () {
                    return this;
                }
            });

            createControllerWithTimeoutAndFilter(timeoutMock);

            expect(scope.formDraft.hasDrafts).toBe(false);
            expect(scope.formDraft.statusMessage).toBeNull();
            expect(scope.formDraft.draftDate).toBeNull();
            expect(scope.formDraft.draftTime).toBeNull();
            expect(rootScope.draftData).toBeNull();
        });

        it('should load existing unsaved draft and set banner timestamp when checking existing drafts', function () {
            var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
            mockConceptSetService(conceptResponseData);
            mockformService({});

            scope.patient = {uuid: 'test-patient-uuid'};
            rootScope.currentProvider = {uuid: 'test-provider-uuid'};

            var timeoutMock = function (callback, delay) {
                if (delay === 0 || delay === 500) {
                    callback();
                }
                return {$$timeoutId: delay};
            };
            timeoutMock.cancel = jasmine.createSpy('cancel');

            var filterMock = function () {
                return function (date, format) {
                    if (format === 'dd MMM yyyy') return '08 Apr 2026';
                    if (format === 'hh:mm a') return '10:30 AM';
                    return '';
                };
            };

            formDraftService.getDraft.and.returnValue({
                then: function (success) {
                    success({data: {uuid: 'draft-uuid', markedAsSaved: false, timestamp: Date.now(), formData: '{"obs":[]}'}});
                    return this;
                },
                catch: function () {
                    return this;
                }
            });

            createControllerWithTimeoutAndFilter(timeoutMock, filterMock);

            expect(formDraftService.getDraft).toHaveBeenCalledWith('test-patient-uuid', 'test-provider-uuid');
            expect(scope.formDraft.hasDrafts).toBe(true);
            expect(scope.formDraft.statusMessage).toBe('SAVED_AS_DRAFT_KEY');
            expect(scope.formDraft.statusParams.draftDate).toBe('08 Apr 2026');
            expect(scope.formDraft.statusParams.draftTime).toBe('10:30 AM');
            expect(rootScope.draftData.uuid).toBe('draft-uuid');
        });

        it('should load existing unsaved draft without setting banner timestamp when timestamp is absent', function () {
            var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
            mockConceptSetService(conceptResponseData);
            mockformService({});

            scope.patient = {uuid: 'test-patient-uuid'};
            rootScope.currentProvider = {uuid: 'test-provider-uuid'};

            var timeoutMock = function (callback, delay) {
                if (delay === 0 || delay === 500) {
                    callback();
                }
                return {$$timeoutId: delay};
            };
            timeoutMock.cancel = jasmine.createSpy('cancel');

            formDraftService.getDraft.and.returnValue({
                then: function (success) {
                    success({data: {uuid: 'draft-uuid', markedAsSaved: false, formData: '{"obs":[]}'}});
                    return this;
                },
                catch: function () {
                    return this;
                }
            });

            createControllerWithTimeoutAndFilter(timeoutMock);

            expect(scope.formDraft.hasDrafts).toBe(true);
            expect(scope.formDraft.statusMessage).toBeNull();
            expect(scope.formDraft.statusParams).toEqual({});
            expect(rootScope.draftData.uuid).toBe('draft-uuid');
        });

        it('should not call getDraft while checking drafts when patient uuid is missing', function () {
            var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
            mockConceptSetService(conceptResponseData);
            mockformService({});

            scope.patient = null;
            rootScope.currentProvider = {uuid: 'test-provider-uuid'};

            var timeoutMock = function (callback, delay) {
                if (delay === 0 || delay === 500) {
                    callback();
                }
                return {$$timeoutId: delay};
            };
            timeoutMock.cancel = jasmine.createSpy('cancel');

            createControllerWithTimeoutAndFilter(timeoutMock);

            expect(formDraftService.getDraft).not.toHaveBeenCalled();
        });

        it('should not call getDraft while checking drafts when provider uuid is missing', function () {
            var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
            mockConceptSetService(conceptResponseData);
            mockformService({});

            scope.patient = {uuid: 'test-patient-uuid'};
            rootScope.currentProvider = null;

            var timeoutMock = function (callback, delay) {
                if (delay === 0 || delay === 500) {
                    callback();
                }
                return {$$timeoutId: delay};
            };
            timeoutMock.cancel = jasmine.createSpy('cancel');

            createControllerWithTimeoutAndFilter(timeoutMock);

            expect(formDraftService.getDraft).not.toHaveBeenCalled();
        });

        describe('checkForExistingDrafts — resume race condition guard', function () {
            var timeoutMock;

            beforeEach(function () {
                timeoutMock = function (callback, delay) {
                    if (delay === 0 || delay === 500) { callback(); }
                    return {$$timeoutId: delay};
                };
                timeoutMock.cancel = jasmine.createSpy('cancel');
            });

            it('should not clobber draftData when resumeDraftOnLoad is set and getDraft returns no valid draft', function () {
                scope.allTemplates = [{uuid: 'some-template', label: 'T', observations: [],
                    isDefault: function () { return false; }, alwaysShow: false, isAvailable: function () { return true; }}];

                scope.patient = {uuid: 'test-patient-uuid'};
                rootScope.currentProvider = {uuid: 'test-provider-uuid'};

                var existingDraftData = {uuid: 'draft-uuid', formData: '[]', markedAsSaved: false};
                rootScope.resumeDraftOnLoad = true;
                rootScope.draftData = existingDraftData;

                formDraftService.getDraft.and.returnValue({
                    then: function (success, error) {
                        success({data: {uuid: null}});
                        return {catch: function () { return this; }};
                    }
                });

                createControllerWithTimeoutAndFilter(timeoutMock);

                expect(rootScope.draftData).not.toBeNull();
                expect(rootScope.draftData.uuid).toBe('draft-uuid');
            });

            it('should not clobber draftData when resumeDraftOnLoad is set and getDraft errors', function () {
                scope.allTemplates = [{uuid: 'some-template', label: 'T', observations: [],
                    isDefault: function () { return false; }, alwaysShow: false, isAvailable: function () { return true; }}];

                scope.patient = {uuid: 'test-patient-uuid'};
                rootScope.currentProvider = {uuid: 'test-provider-uuid'};

                var existingDraftData = {uuid: 'draft-uuid', formData: '[]', markedAsSaved: false};
                rootScope.resumeDraftOnLoad = true;
                rootScope.draftData = existingDraftData;

                formDraftService.getDraft.and.returnValue({
                    then: function (success, error) {
                        error({status: 500});
                        return {catch: function () { return this; }};
                    }
                });

                createControllerWithTimeoutAndFilter(timeoutMock);

                expect(rootScope.draftData).not.toBeNull();
                expect(rootScope.draftData.uuid).toBe('draft-uuid');
            });

            it('should still null draftData when resumeDraftOnLoad is false and getDraft returns no valid draft', function () {
                scope.allTemplates = [{uuid: 'some-template', label: 'T', observations: [],
                    isDefault: function () { return false; }, alwaysShow: false, isAvailable: function () { return true; }}];

                scope.patient = {uuid: 'test-patient-uuid'};
                rootScope.currentProvider = {uuid: 'test-provider-uuid'};
                rootScope.resumeDraftOnLoad = false;

                formDraftService.getDraft.and.returnValue({
                    then: function (success, error) {
                        success({data: {uuid: null}});
                        return {catch: function () { return this; }};
                    }
                });

                createControllerWithTimeoutAndFilter(timeoutMock);

                expect(rootScope.draftData).toBeNull();
            });

            it('should reset allTemplates, selectedObsTemplate and observationForms when draftDiscarded flag is set', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});

                scope.patient = {uuid: 'test-patient-uuid'};
                rootScope.currentProvider = {uuid: 'test-provider-uuid'};
                rootScope.draftDiscarded = true;
                scope.allTemplates = [{uuid: 'stale-template'}];
                scope.consultation.selectedObsTemplate = [{uuid: 'stale-obs'}];
                scope.consultation.observationForms = [{formName: 'stale-form'}];

                formDraftService.getDraft.and.returnValue({
                    then: function (success) {
                        success({data: {uuid: null}});
                        return {catch: function () { return this; }};
                    }
                });

                createControllerWithTimeoutAndFilter(timeoutMock);

                expect(rootScope.draftDiscarded).toBe(false);
                expect(_.find(scope.consultation.selectedObsTemplate, function (t) { return t.uuid === 'stale-obs'; })).toBeUndefined();
            });

            it('should clear stale draftData when getDraft returns a draft that is already markedAsSaved', function () {
                scope.allTemplates = [{uuid: 'some-template', label: 'T', observations: [],
                    isDefault: function () { return false; }, alwaysShow: false, isAvailable: function () { return true; }}];

                scope.patient = {uuid: 'test-patient-uuid'};
                rootScope.currentProvider = {uuid: 'test-provider-uuid'};
                rootScope.resumeDraftOnLoad = false;
                rootScope.draftData = {uuid: 'old-draft-uuid', formData: '[]', markedAsSaved: false};

                formDraftService.getDraft.and.returnValue({
                    then: function (success) {
                        success({data: {uuid: 'new-draft-uuid', markedAsSaved: true}});
                        return {catch: function () { return this; }};
                    }
                });

                createControllerWithTimeoutAndFilter(timeoutMock);

                expect(rootScope.draftData).toBeNull();
            });

            it('should not clobber draftData when resumeDraftOnLoad is set and getDraft promise catches unhandled error', function () {
                scope.allTemplates = [{uuid: 'some-template', label: 'T', observations: [],
                    isDefault: function () { return false; }, alwaysShow: false, isAvailable: function () { return true; }}];

                scope.patient = {uuid: 'test-patient-uuid'};
                rootScope.currentProvider = {uuid: 'test-provider-uuid'};

                var existingDraftData = {uuid: 'draft-uuid', formData: '[]', markedAsSaved: false};
                rootScope.resumeDraftOnLoad = true;
                rootScope.draftData = existingDraftData;

                formDraftService.getDraft.and.returnValue({
                    then: function () {
                        return {
                            catch: function (handler) {
                                handler();
                                return this;
                            }
                        };
                    }
                });

                createControllerWithTimeoutAndFilter(timeoutMock);

                expect(rootScope.draftData).not.toBeNull();
                expect(rootScope.draftData.uuid).toBe('draft-uuid');
            });

            it('should reset _draftCleanState so Save As Draft button stays disabled when no draft exists after visit close', function () {
                scope.allTemplates = [{uuid: 'some-template', label: 'T', observations: [],
                    isDefault: function () { return false; }, alwaysShow: false, isAvailable: function () { return true; }}];

                scope.patient = {uuid: 'test-patient-uuid'};
                rootScope.currentProvider = {uuid: 'test-provider-uuid'};
                rootScope.resumeDraftOnLoad = false;

                // Simulate a previously resumed draft: _draftCleanState is set to a non-empty state
                scope.consultation._draftCleanState = 'some-old-draft-state';

                formDraftService.getDraft.and.returnValue({
                    then: function (success) {
                        success({data: {uuid: null}});
                        return {catch: function () { return this; }};
                    }
                });

                createControllerWithTimeoutAndFilter(timeoutMock);

                // _draftCleanState must be cleared so dirty tracking baselines against the empty form
                expect(scope.consultation._draftCleanState).toBeUndefined();
                expect(scope.formDraft.isDirty).toBe(false);
            });

            it('should call checkForExistingDrafts when patient and provider become available after controller init', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});

                formDraftService.getDraft.and.returnValue({
                    then: function (success) {
                        success({data: {uuid: 'draft-uuid', markedAsSaved: false, timestamp: Date.now()}});
                        return {catch: function () { return this; }};
                    }
                });

                scope.patient = null;
                rootScope.currentProvider = null;

                createControllerWithTimeoutAndFilter(timeoutMock);
                expect(formDraftService.getDraft).not.toHaveBeenCalled();

                scope.patient = {uuid: 'late-patient-uuid'};
                rootScope.currentProvider = {uuid: 'late-provider-uuid'};
                scope.$digest();

                expect(formDraftService.getDraft).toHaveBeenCalledWith('late-patient-uuid', 'late-provider-uuid');
                expect(scope.formDraft.hasDrafts).toBe(true);
            });
        });

        describe('Resume Draft', function () {
            it('should populate form with draft data when resumeDraftOnLoad flag is set', function () {
                var conceptUuid = 'concept-uuid-1';
                var conceptResponseData = {
                    results: [{setMembers: [{name: {name: 'abcd'}, uuid: conceptUuid}]}]
                };
                mockConceptSetService(conceptResponseData);
                mockformService({});

                var timeoutMock = function (callback, delay) {
                    if (delay === 0) { callback(); }
                    return {$$timeoutId: delay};
                };
                timeoutMock.cancel = jasmine.createSpy('cancel');

                var draftObs = {concept: {uuid: conceptUuid}, value: 'draft-value'};
                rootScope.resumeDraftOnLoad = true;
                rootScope.draftData = {formData: angular.toJson([draftObs])};

                scope.patient = {uuid: 'test-patient-uuid'};
                rootScope.currentProvider = {uuid: 'test-provider-uuid'};

                createControllerWithTimeoutAndFilter(timeoutMock);

                expect(rootScope.resumeDraftOnLoad).toBe(false);
            });

            it('should not attempt population when resumeDraftOnLoad flag is not set', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});

                var timeoutMock = function (callback, delay) {
                    if (delay === 0) { callback(); }
                    return {$$timeoutId: delay};
                };
                timeoutMock.cancel = jasmine.createSpy('cancel');

                rootScope.resumeDraftOnLoad = false;
                rootScope.draftData = null;

                scope.patient = {uuid: 'test-patient-uuid'};
                rootScope.currentProvider = {uuid: 'test-provider-uuid'};

                createControllerWithTimeoutAndFilter(timeoutMock);

                expect(rootScope.resumeDraftOnLoad).toBe(false);
            });

            it('should always clear resumeDraftOnLoad even when formData is absent', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 'concept-uuid-1'}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});

                var timeoutMock = function (callback, delay) {
                    if (delay === 0) { callback(); }
                    return {$$timeoutId: delay};
                };
                timeoutMock.cancel = jasmine.createSpy('cancel');

                rootScope.resumeDraftOnLoad = true;
                rootScope.draftData = {uuid: 'draft-uuid', formData: null};
                scope.patient = {uuid: 'test-patient-uuid'};
                rootScope.currentProvider = {uuid: 'test-provider-uuid'};

                createControllerWithTimeoutAndFilter(timeoutMock);

                expect(rootScope.resumeDraftOnLoad).toBe(false);
            });

            it('should not populate forms from a different patient when resumeDraftPatientUuid does not match', function () {
                var conceptUuid = 'concept-uuid-1';
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: conceptUuid}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});
                rootScope.currentUser = {isFavouriteObsTemplate: function () { return false; }};

                var timeoutMock = function (callback, delay) {
                    if (delay === 0) { callback(); }
                    return {$$timeoutId: delay};
                };
                timeoutMock.cancel = jasmine.createSpy('cancel');

                var draftObs = [{concept: {uuid: conceptUuid}, isObservation: true, groupMembers: []}];
                rootScope.resumeDraftOnLoad = true;
                rootScope.resumeDraftPatientUuid = 'other-patient-uuid';
                rootScope.draftData = {formData: angular.toJson(draftObs)};
                scope.patient = {uuid: 'current-patient-uuid'};
                rootScope.currentProvider = {uuid: 'test-provider-uuid'};

                createControllerWithTimeoutAndFilter(timeoutMock);

                var template = _.find(scope.allTemplates, function (t) { return t.uuid === conceptUuid; });
                expect(template.observations.length).toBe(0);
                expect(rootScope.resumeDraftOnLoad).toBe(false);
                expect(rootScope.resumeDraftPatientUuid).toBeNull();
            });
        });

        describe('Auto-populate draft on direct navigation', function () {
            var timeoutMock;

            beforeEach(function () {
                timeoutMock = function (callback, delay) {
                    if (delay === 0) { callback(); }
                    return {$$timeoutId: delay};
                };
                timeoutMock.cancel = jasmine.createSpy('cancel');
            });

            var enableDraftFeature = function () {
                var appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
                appDescriptor.getConfigValue.and.returnValue(true);
                appService.getAppDescriptor.and.returnValue(appDescriptor);
            };

            var mockDraftSuccess = function (draftData) {
                formDraftService.getDraft.and.returnValue({
                    then: function (success, error) {
                        success({data: draftData});
                        return {catch: function () { return this; }};
                    }
                });
            };

            var mockDraftError = function () {
                formDraftService.getDraft.and.returnValue({
                    then: function (success, error) {
                        if (error) { error({status: 500}); }
                        return {catch: function () { return this; }};
                    }
                });
            };

            it('should call getDraft when navigating directly to observations page with feature enabled', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 'concept-uuid-1'}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});
                enableDraftFeature();

                scope.patient = {uuid: 'test-patient-uuid'};
                rootScope.currentProvider = {uuid: 'test-provider-uuid'};
                rootScope.resumeDraftOnLoad = false;

                createControllerWithTimeoutAndFilter(timeoutMock);

                expect(formDraftService.getDraft).toHaveBeenCalledWith('test-patient-uuid', 'test-provider-uuid');
            });

            it('should auto-populate concept-set forms when unsaved draft is found on direct navigation', function () {
                var conceptUuid = 'concept-uuid-123';
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'Orthopaedic Plan'}, uuid: conceptUuid}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});
                enableDraftFeature();

                scope.patient = {uuid: 'test-patient-uuid'};
                rootScope.currentProvider = {uuid: 'test-provider-uuid'};
                rootScope.resumeDraftOnLoad = false;

                var draftObs = [{concept: {uuid: conceptUuid, name: 'Orthopaedic Plan'}, isObservation: true, groupMembers: []}];
                mockDraftSuccess({uuid: 'draft-uuid', markedAsSaved: false, formData: angular.toJson(draftObs)});

                createControllerWithTimeoutAndFilter(timeoutMock);

                var conceptSetTemplate = _.find(scope.allTemplates, function (t) { return t.uuid === conceptUuid; });
                expect(conceptSetTemplate.observations.length).toBe(1);
            });

            it('should auto-populate Form2 forms when unsaved draft is found on direct navigation', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 'concept-uuid-1'}]}]};
                mockConceptSetService(conceptResponseData);

                var form2Data = [{
                    name: 'Fall Risk Assessment and Reassessment', uuid: 'fall-risk-form-uuid', version: '3',
                    published: true, id: null, resources: null, nameTranslation: null, privileges: []
                }];
                mockformService(form2Data);
                enableDraftFeature();

                scope.patient = {uuid: 'test-patient-uuid'};
                rootScope.currentProvider = {uuid: 'test-provider-uuid'};
                rootScope.resumeDraftOnLoad = false;
                rootScope.currentUser = {isFavouriteObsTemplate: function () { return false; }};

                var draftObs = [{
                    concept: {uuid: 'age-uuid'}, value: 'val',
                    formNamespace: 'Bahmni', formFieldPath: 'Fall Risk Assessment and Reassessment.3/10-0'
                }];
                mockDraftSuccess({uuid: 'draft-uuid', markedAsSaved: false, formData: angular.toJson(draftObs)});

                createControllerWithTimeoutAndFilter(timeoutMock);

                var obsForm = scope.consultation.observationForms[0];
                expect(obsForm.observations.length).toBe(1);
                expect(obsForm.observations[0].formFieldPath).toBe('Fall Risk Assessment and Reassessment.3/10-0');
            });

            it('should not call getDraft from loadDraftThenConcat when resumeDraftOnLoad is already set', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 'concept-uuid-1'}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});
                enableDraftFeature();

                scope.patient = {uuid: 'test-patient-uuid'};
                rootScope.currentProvider = {uuid: 'test-provider-uuid'};
                rootScope.resumeDraftOnLoad = true;
                rootScope.draftData = {formData: angular.toJson([])};

                createControllerWithTimeoutAndFilter(timeoutMock);

                expect(formDraftService.getDraft.calls.count()).toBe(1);
            });

            it('should not call getDraft from loadDraftThenConcat when enableFormDraftFeature is false', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 'concept-uuid-1'}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});

                scope.patient = {uuid: 'test-patient-uuid'};
                rootScope.currentProvider = {uuid: 'test-provider-uuid'};
                rootScope.resumeDraftOnLoad = false;

                createControllerWithTimeoutAndFilter(timeoutMock);

                expect(formDraftService.getDraft.calls.count()).toBe(1);
            });

            it('should not call getDraft when patient uuid is missing', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 'concept-uuid-1'}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});
                enableDraftFeature();

                scope.patient = null;
                rootScope.currentProvider = {uuid: 'test-provider-uuid'};
                rootScope.resumeDraftOnLoad = false;

                createControllerWithTimeoutAndFilter(timeoutMock);

                expect(formDraftService.getDraft).not.toHaveBeenCalled();
            });

            it('should not call getDraft when provider uuid is missing', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 'concept-uuid-1'}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});
                enableDraftFeature();

                scope.patient = {uuid: 'test-patient-uuid'};
                rootScope.currentProvider = null;
                rootScope.resumeDraftOnLoad = false;

                createControllerWithTimeoutAndFilter(timeoutMock);

                expect(formDraftService.getDraft).not.toHaveBeenCalled();
            });

            it('should not populate forms when draft is marked as saved', function () {
                var conceptUuid = 'concept-uuid-123';
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'Orthopaedic Plan'}, uuid: conceptUuid}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});
                enableDraftFeature();

                scope.patient = {uuid: 'test-patient-uuid'};
                rootScope.currentProvider = {uuid: 'test-provider-uuid'};
                rootScope.resumeDraftOnLoad = false;

                var draftObs = [{concept: {uuid: conceptUuid}, isObservation: true, groupMembers: []}];
                mockDraftSuccess({uuid: 'draft-uuid', markedAsSaved: true, formData: angular.toJson(draftObs)});

                createControllerWithTimeoutAndFilter(timeoutMock);

                var conceptSetTemplate = _.find(scope.allTemplates, function (t) { return t.uuid === conceptUuid; });
                expect(conceptSetTemplate.observations.length).toBe(0);
                expect(rootScope.resumeDraftOnLoad).toBe(false);
            });

            it('should still load forms when getDraft call fails', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 'concept-uuid-1'}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});
                enableDraftFeature();

                scope.patient = {uuid: 'test-patient-uuid'};
                rootScope.currentProvider = {uuid: 'test-provider-uuid'};
                rootScope.resumeDraftOnLoad = false;

                mockDraftError();

                createControllerWithTimeoutAndFilter(timeoutMock);

                expect(scope.allTemplates).toBeDefined();
                expect(scope.allTemplates.length).toBeGreaterThan(0);
            });

            it('should set resumeDraftOnLoad to false after auto-population on direct navigation', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 'concept-uuid-1'}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});
                enableDraftFeature();

                scope.patient = {uuid: 'test-patient-uuid'};
                rootScope.currentProvider = {uuid: 'test-provider-uuid'};
                rootScope.resumeDraftOnLoad = false;

                var draftObs = [{concept: {uuid: 'concept-uuid-1'}, isObservation: true, groupMembers: []}];
                mockDraftSuccess({uuid: 'draft-uuid', markedAsSaved: false, formData: angular.toJson(draftObs)});

                createControllerWithTimeoutAndFilter(timeoutMock);

                expect(rootScope.resumeDraftOnLoad).toBe(false);
            });
        });

        describe('loadDraftThenConcat edge cases', function () {
            var timeoutMock;

            beforeEach(function () {
                timeoutMock = function (callback, delay) {
                    if (delay === 0) { callback(); }
                    return {$$timeoutId: delay};
                };
                timeoutMock.cancel = jasmine.createSpy('cancel');
            });

            var enableDraftFeature = function () {
                var appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
                appDescriptor.getConfigValue.and.returnValue(true);
                appService.getAppDescriptor.and.returnValue(appDescriptor);
            };

            it('should call loadDraftThenConcat via the else branch when observationForms is already populated', function () {
                var conceptUuid = 'concept-uuid-1';
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: conceptUuid}]}]};
                mockConceptSetService(conceptResponseData);
                enableDraftFeature();

                scope.patient = {uuid: 'test-patient-uuid'};
                rootScope.currentProvider = {uuid: 'test-provider-uuid'};
                rootScope.resumeDraftOnLoad = false;
                rootScope.currentUser = {isFavouriteObsTemplate: function () { return false; }};

                scope.consultation.observationForms = [{
                    formName: 'Pre-loaded Form', formUuid: 'pre-loaded-uuid', formVersion: '1',
                    label: 'Pre-loaded Form', conceptName: 'Pre-loaded Form',
                    observations: [], isDefault: function () { return false; }, alwaysShow: false,
                    isAvailable: function () { return true; }
                }];

                var draftObs = [{concept: {uuid: conceptUuid, name: 'abcd'}, isObservation: true, groupMembers: []}];
                formDraftService.getDraft.and.returnValue({
                    then: function (success, error) {
                        success({data: {uuid: 'draft-uuid', markedAsSaved: false, formData: angular.toJson(draftObs)}});
                        return {catch: function () { return this; }};
                    }
                });

                createControllerWithTimeoutAndFilter(timeoutMock);

                expect(formService.getFormList).not.toHaveBeenCalled();
                expect(formDraftService.getDraft).toHaveBeenCalledWith('test-patient-uuid', 'test-provider-uuid');
            });

            it('should handle null groupMember inside stripObservationFlags without throwing', function () {
                var conceptUuid = 'concept-uuid-1';
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: conceptUuid}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});
                rootScope.currentUser = {isFavouriteObsTemplate: function () { return false; }};

                var draftObs = [{
                    concept: {uuid: conceptUuid}, isObservation: true,
                    groupMembers: [null, {concept: {uuid: 'child-uuid'}, value: 'v', isObservation: true}]
                }];
                rootScope.resumeDraftOnLoad = true;
                rootScope.draftData = {formData: angular.toJson(draftObs)};

                expect(function () {
                    createControllerWithTimeoutAndFilter(timeoutMock);
                }).not.toThrow();

                var template = _.find(scope.allTemplates, function (t) { return t.uuid === conceptUuid; });
                expect(template.observations.length).toBe(1);
            });

            it('should not throw and should not populate forms when formData is invalid JSON', function () {
                var conceptUuid = 'concept-uuid-1';
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: conceptUuid}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});
                rootScope.currentUser = {isFavouriteObsTemplate: function () { return false; }};

                rootScope.resumeDraftOnLoad = true;
                rootScope.draftData = {formData: 'not-valid-json{{{'};

                expect(function () {
                    createControllerWithTimeoutAndFilter(timeoutMock);
                }).not.toThrow();

                var template = _.find(scope.allTemplates, function (t) { return t.uuid === conceptUuid; });
                expect(template.observations.length).toBe(0);
            });

            it('should skip draft obs that have no concept property', function () {
                var conceptUuid = 'concept-uuid-1';
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: conceptUuid}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});
                rootScope.currentUser = {isFavouriteObsTemplate: function () { return false; }};

                var draftObs = [
                    {isObservation: true, value: 'orphan', groupMembers: []},
                    {concept: {uuid: conceptUuid, name: 'abcd'}, isObservation: true, groupMembers: []}
                ];
                rootScope.resumeDraftOnLoad = true;
                rootScope.draftData = {formData: angular.toJson(draftObs)};

                createControllerWithTimeoutAndFilter(timeoutMock);

                var template = _.find(scope.allTemplates, function (t) { return t.uuid === conceptUuid; });
                expect(template.observations.length).toBe(1);
            });
        });

        describe('Resume Draft - Form2 Observations', function () {
            var timeoutMock;

            beforeEach(function () {
                timeoutMock = function (callback, delay) {
                    if (delay === 0) { callback(); }
                    return {$$timeoutId: delay};
                };
                timeoutMock.cancel = jasmine.createSpy('cancel');
            });

            it('should inject Form2 draft observations into matching ObservationForm by formFieldPath', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 'concept-uuid-1'}]}]};
                mockConceptSetService(conceptResponseData);

                var form2Data = [{
                    name: 'Fall Risk Assessment and Reassessment', uuid: 'fall-risk-form-uuid', version: '3',
                    published: true, id: null, resources: null, nameTranslation: null, privileges: []
                }];
                mockformService(form2Data);
                rootScope.currentUser = {isFavouriteObsTemplate: function () { return false; }};

                var form2DraftObs = [
                    {concept: {uuid: 'age-uuid', name: 'Fall Risk Age'}, value: {uuid: 'ans-uuid'}, formNamespace: 'Bahmni', formFieldPath: 'Fall Risk Assessment and Reassessment.3/10-0'},
                    {concept: {uuid: 'score-uuid', name: 'Fall Risk Score'}, value: 5, formNamespace: 'Bahmni', formFieldPath: 'Fall Risk Assessment and Reassessment.3/11-0'}
                ];
                rootScope.resumeDraftOnLoad = true;
                rootScope.draftData = {formData: angular.toJson(form2DraftObs)};

                createControllerWithTimeoutAndFilter(timeoutMock);

                var obsForm = scope.consultation.observationForms[0];
                expect(obsForm.observations.length).toBe(2);
                expect(obsForm.observations[0].formFieldPath).toBe('Fall Risk Assessment and Reassessment.3/10-0');
                expect(obsForm.observations[1].formFieldPath).toBe('Fall Risk Assessment and Reassessment.3/11-0');
            });

            it('should set ObservationForm isOpen to true when Form2 draft observations are injected', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 'concept-uuid-1'}]}]};
                mockConceptSetService(conceptResponseData);

                var form2Data = [{
                    name: 'Fall Risk Assessment and Reassessment', uuid: 'fall-risk-form-uuid', version: '3',
                    published: true, id: null, resources: null, nameTranslation: null, privileges: []
                }];
                mockformService(form2Data);
                rootScope.currentUser = {isFavouriteObsTemplate: function () { return false; }};

                var form2DraftObs = [{
                    concept: {uuid: 'age-uuid'}, value: {uuid: 'ans-uuid'},
                    formNamespace: 'Bahmni', formFieldPath: 'Fall Risk Assessment and Reassessment.3/10-0'
                }];
                rootScope.resumeDraftOnLoad = true;
                rootScope.draftData = {formData: angular.toJson(form2DraftObs)};

                createControllerWithTimeoutAndFilter(timeoutMock);

                expect(scope.consultation.observationForms[0].isOpen).toBe(true);
            });

            it('should add Form2 form to selectedObsTemplate when it has draft observations', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 'concept-uuid-1'}]}]};
                mockConceptSetService(conceptResponseData);

                var form2Data = [{
                    name: 'Fall Risk Assessment and Reassessment', uuid: 'fall-risk-form-uuid', version: '3',
                    published: true, id: null, resources: null, nameTranslation: null, privileges: []
                }];
                mockformService(form2Data);
                rootScope.currentUser = {isFavouriteObsTemplate: function () { return false; }};

                var form2DraftObs = [{
                    concept: {uuid: 'age-uuid'}, value: 'val',
                    formNamespace: 'Bahmni', formFieldPath: 'Fall Risk Assessment and Reassessment.3/10-0'
                }];
                rootScope.resumeDraftOnLoad = true;
                rootScope.draftData = {formData: angular.toJson(form2DraftObs)};

                createControllerWithTimeoutAndFilter(timeoutMock);

                var addedForm = _.find(scope.consultation.selectedObsTemplate, function (t) {
                    return t.formName === 'Fall Risk Assessment and Reassessment';
                });
                expect(addedForm).toBeDefined();
            });

            it('should not overwrite existing ObservationForm observations with draft obs when form already has observations', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 'concept-uuid-1'}]}]};
                mockConceptSetService(conceptResponseData);

                var existingObs = {
                    concept: {uuid: 'existing-uuid'}, value: 'existing-value',
                    formNamespace: 'Bahmni', formFieldPath: 'Fall Risk Assessment and Reassessment.3/10-0'
                };
                scope.patient = {uuid: 'test-patient-uuid'};
                scope.consultation.observations = [existingObs];

                var form2Data = [{
                    name: 'Fall Risk Assessment and Reassessment', uuid: 'fall-risk-form-uuid', version: '3',
                    published: true, id: null, resources: null, nameTranslation: null, privileges: []
                }];
                mockformService(form2Data);
                rootScope.currentUser = {isFavouriteObsTemplate: function () { return false; }};

                var form2DraftObs = [{
                    concept: {uuid: 'draft-uuid'}, value: 'draft-value',
                    formNamespace: 'Bahmni', formFieldPath: 'Fall Risk Assessment and Reassessment.3/20-0'
                }];
                rootScope.resumeDraftOnLoad = true;
                rootScope.draftData = {formData: angular.toJson(form2DraftObs)};

                createControllerWithTimeoutAndFilter(timeoutMock);

                var obsForm = scope.consultation.observationForms[0];
                expect(obsForm.observations.length).toBe(1);
                expect(obsForm.observations[0].concept.uuid).toBe('existing-uuid');
            });

            it('should not inject Form2 obs when no ObservationForm name matches the formFieldPath', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 'concept-uuid-1'}]}]};
                mockConceptSetService(conceptResponseData);

                var form2Data = [{
                    name: 'Different Form', uuid: 'different-form-uuid', version: '1',
                    published: true, id: null, resources: null, nameTranslation: null, privileges: []
                }];
                mockformService(form2Data);
                rootScope.currentUser = {isFavouriteObsTemplate: function () { return false; }};

                var form2DraftObs = [{
                    concept: {uuid: 'uuid1'}, value: 'val',
                    formNamespace: 'Bahmni', formFieldPath: 'Fall Risk Assessment and Reassessment.3/10-0'
                }];
                rootScope.resumeDraftOnLoad = true;
                rootScope.draftData = {formData: angular.toJson(form2DraftObs)};

                createControllerWithTimeoutAndFilter(timeoutMock);

                expect(scope.consultation.observationForms[0].observations.length).toBe(0);
            });

            it('should correctly handle mix of concept-set and Form2 draft observations', function () {
                var conceptUuid = 'concept-uuid-123';
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'Orthopaedic Plan'}, uuid: conceptUuid}]}]};
                mockConceptSetService(conceptResponseData);

                var form2Data = [{
                    name: 'Fall Risk Assessment and Reassessment', uuid: 'fall-risk-form-uuid', version: '3',
                    published: true, id: null, resources: null, nameTranslation: null, privileges: []
                }];
                mockformService(form2Data);
                rootScope.currentUser = {isFavouriteObsTemplate: function () { return false; }};

                var draftObs = [
                    {concept: {uuid: conceptUuid, name: 'Orthopaedic Plan'}, isObservation: true, groupMembers: []},
                    {concept: {uuid: 'age-uuid', name: 'Fall Risk Age'}, value: {uuid: 'ans-uuid'}, formNamespace: 'Bahmni', formFieldPath: 'Fall Risk Assessment and Reassessment.3/10-0'}
                ];
                rootScope.resumeDraftOnLoad = true;
                rootScope.draftData = {formData: angular.toJson(draftObs)};

                createControllerWithTimeoutAndFilter(timeoutMock);

                var conceptSetTemplate = _.find(scope.allTemplates, function (t) { return t.uuid === conceptUuid; });
                expect(conceptSetTemplate.observations.length).toBe(1);

                expect(scope.consultation.observationForms[0].observations.length).toBe(1);
                expect(scope.consultation.observationForms[0].observations[0].formFieldPath).toBe('Fall Risk Assessment and Reassessment.3/10-0');
            });

            it('should strip isObservation and isObservationNode flags recursively from concept-set draft obs', function () {
                var conceptUuid = 'concept-uuid-123';
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'Orthopaedic Plan'}, uuid: conceptUuid}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});
                rootScope.currentUser = {isFavouriteObsTemplate: function () { return false; }};

                var draftObs = [{
                    concept: {uuid: conceptUuid},
                    isObservation: true,
                    isObservationNode: true,
                    groupMembers: [{concept: {uuid: 'child-uuid'}, value: 'child-value', isObservation: true}]
                }];
                rootScope.resumeDraftOnLoad = true;
                rootScope.draftData = {formData: angular.toJson(draftObs)};

                createControllerWithTimeoutAndFilter(timeoutMock);

                var conceptSetTemplate = _.find(scope.allTemplates, function (t) { return t.uuid === conceptUuid; });
                expect(conceptSetTemplate.observations.length).toBe(1);
                var injected = conceptSetTemplate.observations[0];
                expect(injected.isObservation).toBeUndefined();
                expect(injected.isObservationNode).toBeUndefined();
                expect(injected.groupMembers[0].isObservation).toBeUndefined();
            });

            it('should not add duplicate Form2 form to selectedObsTemplate when it is a favourite', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 'concept-uuid-1'}]}]};
                mockConceptSetService(conceptResponseData);

                rootScope.currentUser = {
                    isFavouriteObsTemplate: function (name) {
                        return name === 'Fall Risk Assessment and Reassessment';
                    }
                };

                var form2Data = [{
                    name: 'Fall Risk Assessment and Reassessment', uuid: 'fall-risk-form-uuid', version: '3',
                    published: true, id: null, resources: null, nameTranslation: null, privileges: []
                }];
                mockformService(form2Data);

                var form2DraftObs = [{
                    concept: {uuid: 'age-uuid'}, value: 'val',
                    formNamespace: 'Bahmni', formFieldPath: 'Fall Risk Assessment and Reassessment.3/10-0'
                }];
                rootScope.resumeDraftOnLoad = true;
                rootScope.draftData = {formData: angular.toJson(form2DraftObs)};

                createControllerWithTimeoutAndFilter(timeoutMock);

                var matchingTemplates = _.filter(scope.consultation.selectedObsTemplate, function (t) {
                    return t.formName === 'Fall Risk Assessment and Reassessment';
                });
                expect(matchingTemplates.length).toBe(1);
            });

            it('should clear resumeDraftOnLoad flag after processing Form2 draft observations', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 'concept-uuid-1'}]}]};
                mockConceptSetService(conceptResponseData);

                var form2Data = [{
                    name: 'Fall Risk Assessment and Reassessment', uuid: 'fall-risk-form-uuid', version: '3',
                    published: true, id: null, resources: null, nameTranslation: null, privileges: []
                }];
                mockformService(form2Data);
                rootScope.currentUser = {isFavouriteObsTemplate: function () { return false; }};

                var form2DraftObs = [{
                    concept: {uuid: 'age-uuid'}, value: 'val',
                    formNamespace: 'Bahmni', formFieldPath: 'Fall Risk Assessment and Reassessment.3/10-0'
                }];
                rootScope.resumeDraftOnLoad = true;
                rootScope.draftData = {formData: angular.toJson(form2DraftObs)};

                createControllerWithTimeoutAndFilter(timeoutMock);

                expect(rootScope.resumeDraftOnLoad).toBe(false);
            });
        });

        describe('Auto-Save Interval', function () {
            var autoSaveService, intervalMock;

            beforeEach(inject(function ($timeout) {
                autoSaveService = jasmine.createSpyObj('autoSaveService', ['start', 'stop', 'getIntervalMs']);
                autoSaveService.getIntervalMs.and.returnValue(900000);
            }));

            var createControllerWithAutoSave = function (timeoutMock, formDraftServiceMock) {
                var defaultTimeoutMock = function (callback, delay) {
                    if (delay === 0) { callback(); }
                    return {$$timeoutId: delay};
                };
                defaultTimeoutMock.cancel = jasmine.createSpy('cancel');
                clinicalAppConfigService.getAllConceptSetExtensions.and.returnValue(extension);
                return controller("ConceptSetPageController", {
                    $scope: scope,
                    $rootScope: rootScope,
                    $stateParams: stateParams,
                    conceptSetService: conceptSetService,
                    formService: formService,
                    clinicalAppConfigService: clinicalAppConfigService,
                    messagingService: messagingService,
                    configurations: configurations,
                    $state: state,
                    spinner: spinner,
                    $translate: translate,
                    appService: appService,
                    $timeout: timeoutMock || defaultTimeoutMock,
                    $filter: function () { return function () { return 'mocked-time'; }; },
                    formDraftService: formDraftServiceMock || formDraftService,
                    autoSaveService: autoSaveService
                });
            };

            var enableDraftFeature = function () {
                var appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
                appDescriptor.getConfigValue.and.callFake(function (key) {
                    if (key === 'enableFormDraftFeature') { return true; }
                    return undefined;
                });
                appService.getAppDescriptor.and.returnValue(appDescriptor);
            };

            it('should start auto-save interval when dirty tracking is set up', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});
                enableDraftFeature();

                scope.patient = {uuid: 'patient-uuid'};
                rootScope.currentProvider = {uuid: 'provider-uuid'};

                createControllerWithAutoSave();

                expect(autoSaveService.start).toHaveBeenCalled();
            });

            it('should pass a shouldSaveFn that returns true when isDirty is true and feature is enabled and active visit exists', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});
                enableDraftFeature();

                scope.patient = {uuid: 'patient-uuid'};
                rootScope.currentProvider = {uuid: 'provider-uuid'};
                scope.visitHistory = {activeVisit: {uuid: 'active-visit-uuid'}};

                createControllerWithAutoSave();

                var shouldSaveFn = autoSaveService.start.calls.mostRecent().args[0];
                scope.formDraft.isDirty = true;
                expect(shouldSaveFn()).toBeTruthy();
            });

            it('should pass a shouldSaveFn that returns false when isDirty is false', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});
                enableDraftFeature();

                scope.patient = {uuid: 'patient-uuid'};
                rootScope.currentProvider = {uuid: 'provider-uuid'};

                createControllerWithAutoSave();

                var shouldSaveFn = autoSaveService.start.calls.mostRecent().args[0];
                scope.formDraft.isDirty = false;
                expect(shouldSaveFn()).toBe(false);
            });

            it('should pass a shouldSaveFn that returns false when enableFormDraftFeature is false', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});

                scope.patient = {uuid: 'patient-uuid'};
                rootScope.currentProvider = {uuid: 'provider-uuid'};

                createControllerWithAutoSave();

                var shouldSaveFn = autoSaveService.start.calls.mostRecent().args[0];
                scope.formDraft.isDirty = true;
                expect(shouldSaveFn()).toBeFalsy();
            });

            it('should NOT stop auto-save interval when observations tab is destroyed (supports tab switching)', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});

                createControllerWithAutoSave();
                autoSaveService.stop.calls.reset();

                scope.$destroy();

                // Auto-save should persist across tab switches, so stop() should NOT be called on tab $destroy
                expect(autoSaveService.stop).not.toHaveBeenCalled();
            });

            it('should NOT stop auto-save interval when event:save-successful is broadcast (continues to auto-save)', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});

                createControllerWithAutoSave();
                autoSaveService.stop.calls.reset();

                rootScope.$broadcast('event:save-successful');

                // Auto-save should continue running after a successful save
                expect(autoSaveService.stop).not.toHaveBeenCalled();
            });

            it('should NOT stop auto-save interval when event:save-started is broadcast (continues to auto-save)', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});

                createControllerWithAutoSave();
                autoSaveService.stop.calls.reset();

                rootScope.$broadcast('event:save-started');

                // Auto-save should continue running during save operations
                expect(autoSaveService.stop).not.toHaveBeenCalled();
            });

            it('should NOT stop auto-save interval when resetDirtyTracking is called via post-save handler', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService({});

                createControllerWithAutoSave();
                autoSaveService.stop.calls.reset();

                scope.consultation.postSaveHandler.fire();

                // Auto-save should continue running after post-save cleanup
                expect(autoSaveService.stop).not.toHaveBeenCalled();
            });
        });

        describe('Form2 Dirty Tracking', function () {
            var timeoutMock;

            beforeEach(inject(function ($timeout) {
                timeoutMock = function (callback, delay) {
                    if (delay === 0) {
                        callback();
                    }
                    return {$$timeoutId: delay};
                };
                timeoutMock.cancel = jasmine.createSpy('cancel');
            }));

            it('should register DOM listeners for form2 sync when dirty tracking starts', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
                mockConceptSetService(conceptResponseData);
                var form2Data = [{
                    name: "Test Form",
                    uuid: "test-form-uuid-1",
                    version: "1",
                    published: true,
                    id: null,
                    resources: null,
                    nameTranslation: null,
                    privileges: []
                }];
                mockformService(form2Data);

                var addEventListenerSpy = spyOn(document, 'addEventListener').and.callThrough();

                var ctlr = controller("ConceptSetPageController", {
                    $scope: scope,
                    $rootScope: rootScope,
                    $stateParams: stateParams,
                    conceptSetService: conceptSetService,
                    formService: formService,
                    clinicalAppConfigService: clinicalAppConfigService,
                    messagingService: messagingService,
                    configurations: configurations,
                    $state: state,
                    spinner: spinner,
                    $translate: translate,
                    appService: appService,
                    $timeout: timeoutMock,
                    $filter: function () { return function () { return 'mocked-time'; }; },
                    formDraftService: formDraftService
                });

                scope.$digest();
                expect(addEventListenerSpy).toHaveBeenCalledWith('input', jasmine.any(Function), true);
                expect(addEventListenerSpy).toHaveBeenCalledWith('change', jasmine.any(Function), true);
                expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', jasmine.any(Function), true);
                expect(addEventListenerSpy).toHaveBeenCalledWith('click', jasmine.any(Function), true);
            });

            it('should still register sync listeners when no form2 components exist', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
                mockConceptSetService(conceptResponseData);
                mockformService([]);

                var addEventListenerSpy = spyOn(document, 'addEventListener').and.callThrough();

                var ctlr = controller("ConceptSetPageController", {
                    $scope: scope,
                    $rootScope: rootScope,
                    $stateParams: stateParams,
                    conceptSetService: conceptSetService,
                    formService: formService,
                    clinicalAppConfigService: clinicalAppConfigService,
                    messagingService: messagingService,
                    configurations: configurations,
                    $state: state,
                    spinner: spinner,
                    $translate: translate,
                    appService: appService,
                    $timeout: timeoutMock,
                    $filter: function () { return function () { return 'mocked-time'; }; },
                    formDraftService: formDraftService
                });

                scope.$digest();
                expect(addEventListenerSpy).toHaveBeenCalledWith('input', jasmine.any(Function), true);
                expect(addEventListenerSpy).toHaveBeenCalledWith('change', jasmine.any(Function), true);
                expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', jasmine.any(Function), true);
                expect(addEventListenerSpy).toHaveBeenCalledWith('click', jasmine.any(Function), true);
            });

            it('should unregister form2 sync listeners on controller destroy', function () {
                var conceptResponseData = {results: [{setMembers: [{name: {name: 'abcd'}, uuid: 123}]}]};
                mockConceptSetService(conceptResponseData);
                var form2Data = [{
                    name: "Test Form",
                    uuid: "test-form-uuid-1",
                    version: "1",
                    published: true,
                    id: null,
                    resources: null,
                    nameTranslation: null,
                    privileges: []
                }];
                mockformService(form2Data);

                var removeEventListenerSpy = spyOn(document, 'removeEventListener').and.callThrough();

                var ctlr = controller("ConceptSetPageController", {
                    $scope: scope,
                    $rootScope: rootScope,
                    $stateParams: stateParams,
                    conceptSetService: conceptSetService,
                    formService: formService,
                    clinicalAppConfigService: clinicalAppConfigService,
                    messagingService: messagingService,
                    configurations: configurations,
                    $state: state,
                    spinner: spinner,
                    $translate: translate,
                    appService: appService,
                    $timeout: timeoutMock,
                    $filter: function () { return function () { return 'mocked-time'; }; },
                    formDraftService: formDraftService
                });

                scope.$digest();

                scope.$destroy();
                expect(removeEventListenerSpy).toHaveBeenCalledWith('input', jasmine.any(Function), true);
                expect(removeEventListenerSpy).toHaveBeenCalledWith('change', jasmine.any(Function), true);
                expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', jasmine.any(Function), true);
                expect(removeEventListenerSpy).toHaveBeenCalledWith('click', jasmine.any(Function), true);
            });
        });
    });
});
