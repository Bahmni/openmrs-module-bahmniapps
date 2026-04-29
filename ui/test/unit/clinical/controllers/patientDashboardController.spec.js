/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

describe("patient dashboard controller", function () {
    beforeEach(module('bahmni.clinical'));
    beforeEach(module(function ($provide) {
        $provide.value('formDraftService', jasmine.createSpyObj('formDraftService', ['getDraft', 'saveDraft', 'markDraftAsSaved']));
    }));

    var scope, spinner, _clinicalDashboardConfig, _clinicalAppConfigService, _state, _appService, _diseaseTemplateService,
        _stateParams, _controller, _appConfig, location, filter, _rootScope, _formDraftService;
    var diseaseTemplates;
    location = {
        path: function () {
        },
        url: function (url) {
            return url;
        },
        search: function () {
            return {currentTab: "DASHBOARD_TAB_PATIENT_SUMMARY_KEY", replace: function () {}};
        }
    };

    var patientDashboardSections = [
        {
            "title": "Diagnosis",
            "name": "diagnosis"
        },
        {
            "title": "Lab Orders",
            "name": "labOrders"
        },
        {
            "templateName": "Breast Cancer",
            "title": "Breast Cancer Title",
            "name": "diseaseTemplate"
        },
        {
            "templateName": "Diabetes",
            "title": "Diabetes Title",
            "name": "diseaseTemplate"
        }
    ];

    beforeEach(module(function () {
        _clinicalAppConfigService = jasmine.createSpyObj('clinicalAppConfigService', ['getObsIgnoreList']);

        _appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        _appConfig = jasmine.createSpyObj('appConfig', ['getConfigValue']);

        _appService.getAppDescriptor.and.returnValue(_appConfig);
        _diseaseTemplateService = jasmine.createSpyObj('diseaseTemplateService', ['getLatestDiseaseTemplates']);

        _clinicalDashboardConfig = new Bahmni.Clinical.ClinicalDashboardConfig([
            {dashboardName: "General",
                displayByDefault: true,
                sections: patientDashboardSections,
                translationKey: "DASHBOARD_TAB_GENERAL_KEY"}
        ]);

        _state = {
            current: {
                views: {
                    content: {
                        templateUrl: "dashboard/views/dashboard.html"
                    }
                }
            }
        };

        _stateParams = {
            patientUuid: "patientUuid",
            dateEnrolled: "startDate",
            dateCompleted: "endDate"
        };
    }));

    beforeEach(function () {
        module(function ($provide) {
            $provide.value('titleTranslateFilter', function (value) {
                return value;
            });
        });
        inject(function ($controller, $rootScope, $filter, formDraftService) {
            scope = $rootScope.$new();
            scope.patient = {};
            scope.visitHistory = {};
            _rootScope = $rootScope;
            _formDraftService = formDraftService;

            spinner = jasmine.createSpyObj('spinner', ['forPromise']);
            filter = $filter;
            _controller = $controller;
        });
    });

    it("should init dashboard sections", function (done) {
        _appConfig.getConfigValue.and.returnValue({showDetailsWithinDateRange: false});

        diseaseTemplates = [
            new Bahmni.Clinical.DiseaseTemplate({name: "Breast Cancer"}, breastCancerDiseaseTemplate.observationTemplates),
            new Bahmni.Clinical.DiseaseTemplate({name: "Diabetes"}, diabetesDiseaseTemplate.observationTemplates)
        ];

        _diseaseTemplateService.getLatestDiseaseTemplates.and.returnValue(specUtil.respondWith(diseaseTemplates).then(function (diseaseTemplate) {
            expect(diseaseTemplate).toEqual(diseaseTemplates);

            expect(_diseaseTemplateService.getLatestDiseaseTemplates).toHaveBeenCalledWith('patientUuid', _clinicalDashboardConfig.getDiseaseTemplateSections(), null, null);
            done();
        }));

        _controller('PatientDashboardController', {
            $scope: scope,
            encounterService: jasmine.createSpy(),
            clinicalAppConfigService: _clinicalAppConfigService,
            clinicalDashboardConfig: _clinicalDashboardConfig,
            visitSummary: {},
            printer: {},
            $state: _state,
            spinner: spinner,
            appService: _appService,
            $stateParams: _stateParams,
            diseaseTemplateService: _diseaseTemplateService,
            patientContext: {patient: {}},
            $filter: filter

        });
    });

    it("should init dashboard sections for given date range", function (done) {
        _appConfig.getConfigValue.and.returnValue({showDetailsWithinDateRange: true});

        diseaseTemplates = [
            new Bahmni.Clinical.DiseaseTemplate({name: "Breast Cancer"}, breastCancerDiseaseTemplate.observationTemplates),
            new Bahmni.Clinical.DiseaseTemplate({name: "Diabetes"}, diabetesDiseaseTemplate.observationTemplates)
        ];

        _diseaseTemplateService.getLatestDiseaseTemplates.and.returnValue(specUtil.respondWith(diseaseTemplates).then(function (diseaseTemplate) {
            expect(diseaseTemplate).toEqual(diseaseTemplates);

            expect(_diseaseTemplateService.getLatestDiseaseTemplates).toHaveBeenCalledWith(
                'patientUuid',
                _clinicalDashboardConfig.getDiseaseTemplateSections(),
                _stateParams.dateEnrolled,
                _stateParams.dateCompleted
            );
            done();
        }));

        _controller('PatientDashboardController', {
            $scope: scope,
            encounterService: jasmine.createSpy(),
            clinicalAppConfigService: _clinicalAppConfigService,
            clinicalDashboardConfig: _clinicalDashboardConfig,
            visitSummary: {},
            printer: {},
            $state: _state,
            spinner: spinner,
            appService: _appService,
            $stateParams: _stateParams,
            diseaseTemplateService: _diseaseTemplateService,
            patientContext: {patient: {}}

        });
    });

    it("should init dashboard tabs based on default tab", function () {
        expect(_clinicalDashboardConfig.currentTab.translationKey).toBe("DASHBOARD_TAB_GENERAL_KEY");
    });

    it("should init dashboard tabs based on current tab", function () {
        _clinicalDashboardConfig = new Bahmni.Clinical.ClinicalDashboardConfig([
            {dashboardName: "General",
                displayByDefault: true,
                sections: patientDashboardSections,
                translationKey: "DASHBOARD_TAB_GENERAL_KEY"},
            {dashboardName: "General",
                displayByDefault: true,
                sections: patientDashboardSections,
                translationKey: "DASHBOARD_TAB_PATIENT_SUMMARY_KEY"}
        ]);

        _appConfig.getConfigValue.and.returnValue({showDetailsWithinDateRange: true});

        diseaseTemplates = [
            new Bahmni.Clinical.DiseaseTemplate({name: "Breast Cancer"}, breastCancerDiseaseTemplate.observationTemplates),
            new Bahmni.Clinical.DiseaseTemplate({name: "Diabetes"}, diabetesDiseaseTemplate.observationTemplates)
        ];

        _diseaseTemplateService.getLatestDiseaseTemplates.and.returnValue(specUtil.respondWith(diseaseTemplates)
        );

        _controller('PatientDashboardController', {
            $scope: scope,
            encounterService: jasmine.createSpy(),
            clinicalAppConfigService: _clinicalAppConfigService,
            clinicalDashboardConfig: _clinicalDashboardConfig,
            visitSummary: {},
            printer: {},
            $state: _state,
            spinner: spinner,
            appService: _appService,
            $stateParams: _stateParams,
            diseaseTemplateService: _diseaseTemplateService,
            patientContext: {patient: {}},
            $location: location

        });
        expect(_clinicalDashboardConfig.currentTab.translationKey).toBe("DASHBOARD_TAB_PATIENT_SUMMARY_KEY");
    });

    describe("draft feature integration", function () {
        var createControllerForDraft = function (patient, provider, printerMock) {
            _rootScope.currentProvider = provider;
            _diseaseTemplateService.getLatestDiseaseTemplates.and.returnValue(specUtil.respondWith([]));

            _controller('PatientDashboardController', {
                $scope: scope,
                encounterService: jasmine.createSpy(),
                clinicalAppConfigService: _clinicalAppConfigService,
                clinicalDashboardConfig: _clinicalDashboardConfig,
                visitSummary: {},
            printer: printerMock || {},
                $state: _state,
                spinner: spinner,
                appService: _appService,
                $stateParams: _stateParams,
                diseaseTemplateService: _diseaseTemplateService,
                patientContext: {patient: patient === undefined ? {} : patient},
                $filter: filter,
                $location: location
            });
        };

        it("should fetch existing draft when patient and provider are present", function () {
            _formDraftService.getDraft.and.returnValue({
                then: function (success) {
                    success({data: {uuid: 'draft-uuid', timestamp: Date.now(), markedAsSaved: false}});
                    return this;
                },
                catch: function () {
                    return this;
                }
            });

            createControllerForDraft({uuid: 'patient-uuid'}, {uuid: 'provider-uuid'});

            expect(_formDraftService.getDraft).toHaveBeenCalledWith('patient-uuid', 'provider-uuid');
            expect(scope.formDraft.hasDrafts).toBe(true);
            expect(_rootScope.draftData.uuid).toBe('draft-uuid');
        });

        it("should clear draft state when fetched draft is already marked as saved", function () {
            _rootScope.draftData = {uuid: 'old-draft'};
            _formDraftService.getDraft.and.returnValue({
                then: function (success) {
                    success({data: {uuid: 'draft-uuid', timestamp: Date.now(), markedAsSaved: true}});
                    return this;
                },
                catch: function () {
                    return this;
                }
            });

            createControllerForDraft({uuid: 'patient-uuid'}, {uuid: 'provider-uuid'});

            expect(scope.formDraft.hasDrafts).toBe(false);
            expect(scope.formDraft.draftDate).toBeNull();
            expect(scope.formDraft.draftTime).toBeNull();
            expect(_rootScope.draftData).toBeNull();
        });

        it("should keep draft banner active when draft has uuid but no timestamp", function () {
            _formDraftService.getDraft.and.returnValue({
                then: function (success) {
                    success({data: {uuid: 'draft-uuid', markedAsSaved: false}});
                    return this;
                },
                catch: function () {
                    return this;
                }
            });

            createControllerForDraft({uuid: 'patient-uuid'}, {uuid: 'provider-uuid'});

            expect(scope.formDraft.hasDrafts).toBe(true);
            expect(_rootScope.draftData.uuid).toBe('draft-uuid');
        });

        it("should clear draft state when getDraft error callback is invoked", function () {
            _rootScope.draftData = {uuid: 'old-draft'};
            _formDraftService.getDraft.and.returnValue({
                then: function (success, error) {
                    error();
                    return this;
                },
                catch: function () {
                    return this;
                }
            });

            createControllerForDraft({uuid: 'patient-uuid'}, {uuid: 'provider-uuid'});

            expect(scope.formDraft.hasDrafts).toBe(false);
            expect(scope.formDraft.draftDate).toBeNull();
            expect(scope.formDraft.draftTime).toBeNull();
            expect(_rootScope.draftData).toBeNull();
        });

        it("should clear draft state when getDraft promise catches unhandled error", function () {
            var promise = {
                then: function () {
                    return promise;
                },
                catch: function (handler) {
                    handler();
                    return promise;
                }
            };
            _rootScope.draftData = {uuid: 'old-draft'};
            _formDraftService.getDraft.and.returnValue(promise);

            createControllerForDraft({uuid: 'patient-uuid'}, {uuid: 'provider-uuid'});

            expect(scope.formDraft.hasDrafts).toBe(false);
            expect(scope.formDraft.draftDate).toBeNull();
            expect(scope.formDraft.draftTime).toBeNull();
            expect(_rootScope.draftData).toBeNull();
        });

        it("should not fetch existing draft when patient or provider are missing", function () {
            _formDraftService.getDraft.and.returnValue({
                then: function () {
                    return this;
                },
                catch: function () {
                    return this;
                }
            });

            createControllerForDraft({uuid: 'patient-uuid'}, null);

            expect(_formDraftService.getDraft).not.toHaveBeenCalled();
        });

        it("should not fetch existing draft when patient context is null", function () {
            _formDraftService.getDraft.and.returnValue({
                then: function () {
                    return this;
                },
                catch: function () {
                    return this;
                }
            });

            createControllerForDraft(null, {uuid: 'provider-uuid'});

            expect(_formDraftService.getDraft).not.toHaveBeenCalled();
        });

        it("should update draft banner when draft:saved event is broadcast with timestamp object", function () {
            _formDraftService.getDraft.and.returnValue({
                then: function () {
                    return this;
                },
                catch: function () {
                    return this;
                }
            });

            createControllerForDraft({uuid: 'patient-uuid'}, {uuid: 'provider-uuid'});
            _rootScope.$broadcast('draft:saved', {draftDate: '08 Apr 2026', draftTime: '10:30 AM'});

            expect(scope.formDraft.hasDrafts).toBe(true);
            expect(scope.formDraft.draftDate).toBe('08 Apr 2026');
            expect(scope.formDraft.draftTime).toBe('10:30 AM');
        });

        it("should ignore draft:saved event when payload is not an object", function () {
            _formDraftService.getDraft.and.returnValue({
                then: function () {
                    return this;
                },
                catch: function () {
                    return this;
                }
            });

            createControllerForDraft({uuid: 'patient-uuid'}, {uuid: 'provider-uuid'});
            scope.formDraft.hasDrafts = false;
            scope.formDraft.draftDate = null;
            scope.formDraft.draftTime = null;

            _rootScope.$broadcast('draft:saved', 'invalid-payload');

            expect(scope.formDraft.hasDrafts).toBe(false);
            expect(scope.formDraft.draftDate).toBeNull();
            expect(scope.formDraft.draftTime).toBeNull();
        });

        it("should clear draft banner when event:save-successful is broadcast", function () {
            _formDraftService.getDraft.and.returnValue({
                then: function () {
                    return this;
                },
                catch: function () {
                    return this;
                }
            });

            createControllerForDraft({uuid: 'patient-uuid'}, {uuid: 'provider-uuid'});
            scope.formDraft.hasDrafts = true;
            scope.formDraft.draftDate = '08 Apr 2026';
            scope.formDraft.draftTime = '10:30 AM';

            _rootScope.$broadcast('event:save-successful');

            expect(scope.formDraft.hasDrafts).toBe(false);
            expect(scope.formDraft.draftDate).toBeNull();
            expect(scope.formDraft.draftTime).toBeNull();
        });

        describe("resumeDraft", function () {
            beforeEach(function () {
                _state.go = jasmine.createSpy('go');
                _formDraftService.getDraft.and.returnValue({
                    then: function () { return this; },
                    catch: function () { return this; }
                });
            });

            it("should navigate to observations page when feature is enabled", function () {
                _appConfig.getConfigValue.and.returnValue(true);
                createControllerForDraft({uuid: 'patient-uuid'}, {uuid: 'provider-uuid'});
                scope.resumeDraft();

                expect(_state.go).toHaveBeenCalledWith('patient.dashboard.show.observations', {
                    conceptSetGroupName: 'All Observation Templates'
                });
            });

            it("should not navigate when enableFormDraftFeature is false", function () {
                _appConfig.getConfigValue.and.returnValue(false);
                createControllerForDraft({uuid: 'patient-uuid'}, {uuid: 'provider-uuid'});
                scope.resumeDraft();
                expect(_state.go).not.toHaveBeenCalled();
            });
        });

        it("should use dashboard-content templateUrl when dashboard-content view is configured", function () {
            _state.current.views['dashboard-content'] = {
                templateUrl: 'dashboard/views/custom-content.html'
            };
            _formDraftService.getDraft.and.returnValue({
                then: function () {
                    return this;
                },
                catch: function () {
                    return this;
                }
            });

            createControllerForDraft({uuid: 'patient-uuid'}, {uuid: 'provider-uuid'});

            expect(scope.currentDashboardTemplateUrl).toBe('dashboard/views/custom-content.html');
        });

        it("should trigger printDashboard event listener", function () {
            _formDraftService.getDraft.and.returnValue({
                then: function () {
                    return this;
                },
                catch: function () {
                    return this;
                }
            });

            createControllerForDraft({uuid: 'patient-uuid'}, {uuid: 'provider-uuid'});
            scope.$broadcast('event:printDashboard', 'vitals');

            expect(scope).toBeDefined();
        });

    });

    var breastCancerDiseaseTemplate =
        {
            "concept": {"name": "Breast Cancer"},
            "observationTemplates": [
                {
                    "concept": {
                        "name": "Breast Cancer Progress"
                    },
                    "encounters": [
                        {
                            "observations": [

                                {
                                    "encounterDateTime": 1412157286000,
                                    "abnormal": null,
                                    "isAbnormal": null,
                                    "conceptSortWeight": 1,
                                    "uuid": "0f4dc38f-4588-49d9-a62c-ac045ddafa59",
                                    "conceptUuid": "d1cbb048-d3e6-4da4-834f-7d97df21c171",
                                    "observationDateTime": "2014-10-01T15:30:59.000+0530",
                                    "value": "Something",
                                    "type": null,
                                    "concept": {
                                        "shortName": null,
                                        "uuid": "d1cbb048-d3e6-4da4-834f-7d97df21c171",
                                        "name": "Chemotherapy",
                                        "set": true,
                                        "dataType": "N/A",
                                        "units": null,
                                        "conceptClass": "Misc"
                                    }
                                },
                                {
                                    "encounterDateTime": 1412157286000,
                                    "abnormal": null,
                                    "isAbnormal": null,
                                    "conceptSortWeight": 2,
                                    "uuid": "0f4dc38f-4588-49d9-a62c-ac045ddafa59",
                                    "conceptUuid": "d1cbb048-d3e6-4da4-834f-7d97df21c171",
                                    "observationDateTime": "2014-10-01T15:30:59.000+0530",
                                    "value": "Something else",
                                    "type": null,
                                    "concept": {
                                        "shortName": null,
                                        "uuid": "d1cbb048-d3e6-4da4-834f-7d97df21c171",
                                        "name": "Haematology",
                                        "set": true,
                                        "dataType": "N/A",
                                        "units": null,
                                        "conceptClass": "Misc"
                                    }
                                }
                            ]

                        }
                    ]
                }
            ]
        };

    var diabetesDiseaseTemplate =
        {
            "concept": {"name": "Diabetes"},
            "observationTemplates": [
                {
                    "concept": {
                        "name": "Diabetes - Intake"
                    },
                    "encounters": [
                        {
                            "observations": [

                                {
                                    "encounterDateTime": 1412157286000,
                                    "abnormal": null,
                                    "isAbnormal": null,
                                    "conceptSortWeight": 1,
                                    "uuid": "0f4dc38f-4588-49d9-a62c-ac045ddafa59",
                                    "conceptUuid": "d1cbb048-d3e6-4da4-834f-7d97df21c171",
                                    "observationDateTime": "2014-10-01T15:30:59.000+0530",
                                    "value": "Something",
                                    "type": null,
                                    "concept": {
                                        "shortName": null,
                                        "uuid": "d1cbb048-d3e6-4da4-834f-7d97df21c171",
                                        "name": "Chemotherapy",
                                        "set": true,
                                        "dataType": "N/A",
                                        "units": null,
                                        "conceptClass": "Misc"
                                    }
                                },
                                {
                                    "encounterDateTime": 1412157286000,
                                    "abnormal": null,
                                    "isAbnormal": null,
                                    "conceptSortWeight": 2,
                                    "uuid": "0f4dc38f-4588-49d9-a62c-ac045ddafa59",
                                    "conceptUuid": "d1cbb048-d3e6-4da4-834f-7d97df21c171",
                                    "observationDateTime": "2014-10-01T15:30:59.000+0530",
                                    "value": "Something else",
                                    "type": null,
                                    "concept": {
                                        "shortName": null,
                                        "uuid": "d1cbb048-d3e6-4da4-834f-7d97df21c171",
                                        "name": "Haematology",
                                        "set": true,
                                        "dataType": "N/A",
                                        "units": null,
                                        "conceptClass": "Misc"
                                    }
                                }
                            ]

                        }
                    ]
                }
            ]
        };
});
