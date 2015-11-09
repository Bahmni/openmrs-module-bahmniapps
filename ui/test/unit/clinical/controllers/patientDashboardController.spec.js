'use strict';

describe("patient dashboard controller", function () {

    beforeEach(module('bahmni.clinical'));

    var scope, _clinicalDashboardConfig, _clinicalAppConfigService, _state;
    var diseaseTemplates;

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

        _clinicalDashboardConfig = new Bahmni.Clinical.ClinicalDashboardConfig([
            {dashboardName: "General", displayByDefault: true, sections: patientDashboardSections}
        ]);

        diseaseTemplates = [
            new Bahmni.Clinical.DiseaseTemplate({name: "Breast Cancer"}, breastCancerDiseaseTemplate.observationTemplates),
            new Bahmni.Clinical.DiseaseTemplate({name: "Diabetes"}, diabetesDiseaseTemplate.observationTemplates)
        ];

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
            encounterService: jasmine.createSpy(),
            clinicalAppConfigService: _clinicalAppConfigService,
            clinicalDashboardConfig: _clinicalDashboardConfig,
            latestDiseaseTemplates: diseaseTemplates,
            visitSummary :{},
            printer:{},
            $state : _state,
            spinner: spinner
        });
    }));

    it("should init dashboard sections", function (done) {
            expect(scope.diseaseTemplates.length).toBe(2);
            expect(scope.diseaseTemplates[0].name).toBe("Breast Cancer");
            expect(scope.diseaseTemplates[1].name).toBe("Diabetes");
            expect(scope.sectionGroups[0].length).toBe(patientDashboardSections.length);
            expect(scope.sectionGroups[0][0].title).toBe(patientDashboardSections[0].title);
            expect(scope.sectionGroups[0][1].title).toBe(patientDashboardSections[1].title);
            expect(scope.sectionGroups[0][2].title).toBe(patientDashboardSections[2].title);
            expect(scope.sectionGroups[0][3].title).toBe(patientDashboardSections[3].title);
            done();
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