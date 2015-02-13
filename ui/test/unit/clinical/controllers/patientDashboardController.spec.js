'use strict';

describe("patient dashboard controller", function () {

    beforeEach(module('bahmni.clinical'));

    var _diseaseTemplateService, scope, _dashboardConfig, _clinicalAppConfigService,_state;

    var fetchDiseaseTemplatePromise;

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

        _dashboardConfig = new Bahmni.Clinical.DashboardConfig([
            {dashboardName: "General", default: true, sections: patientDashboardSections}
        ]);
        _diseaseTemplateService = jasmine.createSpyObj('diseaseTemplateService', ['getLatestDiseaseTemplates']);
        var diseaseTemplates = [new Bahmni.Clinical.DiseaseTemplate({name: "Breast Cancer"}, breastCancerDiseaseTemplate.observationTemplates),
            new Bahmni.Clinical.DiseaseTemplate({name: "Diabetes"}, diabetesDiseaseTemplate.observationTemplates)];
        fetchDiseaseTemplatePromise = specUtil.respondWith(diseaseTemplates);
        _diseaseTemplateService.getLatestDiseaseTemplates.and.callFake(function () {
            return fetchDiseaseTemplatePromise;
        });
        _state = {
            current:{
                views:{
                    content:{
                        templateUrl:"dashboard/views/dashboard.html"
                    }
                }
            }
        }
    }));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        scope.patient = {};
        scope.visitHistory = {};

        var spinner = jasmine.createSpyObj('spinner', ['forPromise']);

        $controller('PatientDashboardController', {
            $scope: scope,
            diseaseTemplateService: _diseaseTemplateService,
            encounterService: jasmine.createSpy(),
            clinicalAppConfigService: _clinicalAppConfigService,
            dashboardConfig: _dashboardConfig,
            printer:{},
            $state : _state,
            spinner: spinner
        });
    }));

    it("should init dashboard sections", function (done) {
        fetchDiseaseTemplatePromise.then(function (data) {
            expect(scope.patientDashboardSections.length).toBe(4);
            expect(scope.patientDashboardSections[2].title).toBe("Breast Cancer Title");
            expect(scope.patientDashboardSections[3].title).toBe("Diabetes Title");
            done();
        });
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
                        } ,
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
                        } ,
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