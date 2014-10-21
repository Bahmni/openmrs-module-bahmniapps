'use strict';

describe("patient dashboard controller", function () {

    beforeEach(module('bahmni.clinical'));

    var _diseaseTemplateService, scope, _clinicalConfigService;
    var fetchDiseaseTemplatePromise;

    var patientDashboardSections = [
        {
            "title": "Diagnosis",
            "name": "diagnosis"
        },
        {
            "title": "Lab Orders",
            "name": "labOrders"
        }
    ];

    beforeEach(module(function () {
        _clinicalConfigService = jasmine.createSpyObj('clinicalConfigService', ['getObsIgnoreList', 'getAllPatientDashboardSections']);
        _clinicalConfigService.getAllPatientDashboardSections.and.returnValue(patientDashboardSections);
        _diseaseTemplateService = jasmine.createSpyObj('diseaseTemplateService', ['getLatestDiseaseTemplates']);
        var diseaseTemplates = [new Bahmni.Clinical.DiseaseTemplate("Breast Cancer", breastCancerDiseaseTemplate.observationTemplates),
            new Bahmni.Clinical.DiseaseTemplate("Diabetes", diabetesDiseaseTemplate.observationTemplates)];
        _diseaseTemplateService.getLatestDiseaseTemplates.and.callFake(function () {
            fetchDiseaseTemplatePromise = specUtil.respondWith(diseaseTemplates);
            return fetchDiseaseTemplatePromise;
        });
    }));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        $controller('PatientDashboardController', {
            $scope: scope,
            diseaseTemplateService: _diseaseTemplateService,
            $stateParams: jasmine.createSpy(),
            encounterService: jasmine.createSpy(),
            clinicalConfigService: _clinicalConfigService
        });
    }));

    it("should add disease template sections in dashboard sections", function (done) {
        fetchDiseaseTemplatePromise.then(function () {
            expect(scope.patientDashboardSections.length).toBe(4);
            expect(scope.patientDashboardSections[2].title).toBe("Breast Cancer");
            expect(scope.patientDashboardSections[3].title).toBe("Diabetes");
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
            "bahmniObservations": [

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
};

var diabetesDiseaseTemplate =
{
    "concept": {"name": "Diabetes"},
    "observationTemplates": [
        {
            "concept": {
                "name": "Diabetes - Intake"
            },
            "bahmniObservations": [

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
};