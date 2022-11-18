'use strict';

describe("patient dashboard controller", function () {
    beforeEach(module('bahmni.clinical'));

    var scope, spinner, _clinicalDashboardConfig, _clinicalAppConfigService, _state, _appService, _diseaseTemplateService,
        _stateParams, _controller, _appConfig, location, filter;
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
        inject(function ($controller, $rootScope, $filter) {
            scope = $rootScope.$new();
            scope.patient = {};
            scope.visitHistory = {};

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
