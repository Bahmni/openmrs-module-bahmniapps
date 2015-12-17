'use strict';

describe("DiseaseTemplateService", function () {
    var _clinicalAppConfigService, _$http;
    var diseaseTemplateService;
    var mockHttp = function(method,data){
        _$http[method].and.returnValue(specUtil.createFakePromise(data));
    };
    beforeEach(module('bahmni.clinical'));
    beforeEach(module('bahmni.common.appFramework'));

    beforeEach(module(function () {
        _clinicalAppConfigService = jasmine.createSpyObj('clinicalAppConfigService', ['getAllConceptsConfig', 'getDiseaseTemplateConfig']);
        _clinicalAppConfigService.getAllConceptsConfig.and.returnValue({});
        _clinicalAppConfigService.getDiseaseTemplateConfig.and.returnValue({});
        _$http = jasmine.createSpyObj('$http', ['get', 'post']);
        
    }));

    beforeEach(module(function ($provide) {
        $provide.value('clinicalAppConfigService', _clinicalAppConfigService);
        $provide.value('$http', _$http);
        $provide.value('$q', Q);
    }));

    beforeEach(inject(['diseaseTemplateService', function (diseaseTemplateService) {
        this.diseaseTemplateService = diseaseTemplateService;
    }]));

    describe("disease templates", function () {
        it('should fetch latest disease templates for a patient', function (done) {
            mockHttp('post',diseaseTemplates);

            this.diseaseTemplateService.getLatestDiseaseTemplates("patientuuid").then(function (response) {
                expect(response.length).toBe(1);
                expect(response[0].name).toBe("Breast Cancer");
                expect(response[0].obsTemplates.length).toBe(2);
                done();
            });
        });

        it('should fetch all disease template for the patient', function (done) {
            mockHttp('post',diseaseTemplates[0]);

            this.diseaseTemplateService.getAllDiseaseTemplateObs("patientuuid", "Breast Cancer").then(function (response) {
                expect(response.name).toBe("Breast Cancer");
                expect(response.obsTemplates.length).toBe(2);
                done();
            });
        });

    });

    var diseaseTemplates = [
        {
            "concept": {"name": "Breast Cancer"},
            "observationTemplates": [
                {
                    "name": "Breast Cancer - Intake",
                    "bahmniObservations": [
                        {
                            "encounterDateTime": 1412157286000,
                            "abnormal": null,
                            "isAbnormal": null,
                            "conceptSortWeight": 6,
                            "uuid": "0f4dc38f-4588-49d9-a62c-ac045ddafa59",
                            "conceptUuid": "d1cbb048-d3e6-4da4-834f-7d97df21c171",
                            "observationDateTime": "2014-10-01T15:30:59.000+0530",
                            "value": "Paclitaxel",
                            "type": null,
                            "comment": null,
                            "concept": {
                                "shortName": null,
                                "uuid": "d1cbb048-d3e6-4da4-834f-7d97df21c171",
                                "name": "Chemotherapy",
                                "set": true,
                                "dataType": "N/A",
                                "units": null,
                                "conceptClass": "Misc"
                            }
                        }
                    ],
                    "visitStartDate": 1218997800000,
                    "concept": {
                        "shortName": "Intake",
                        "uuid": "2032baaa-88c5-4bb5-8383-8c8923dc0fc6",
                        "name": "Breast Cancer - Intake",
                        "set": true,
                        "dataType": "N/A",
                        "units": null,
                        "conceptClass": "Misc"
                    }
                },
                {
                    "name": "Breast Cancer - Progress",
                    "bahmniObservations": [
                        {
                            "encounterDateTime": 1412157286000,
                            "abnormal": null,
                            "isAbnormal": null,
                            "conceptSortWeight": 2,
                            "uuid": "0f4dc38f-4588-49d9-a62c-ac045ddafa59",
                            "conceptUuid": "d1cbb048-d3e6-4da4-834f-7d97df21c171",
                            "observationDateTime": "2014-10-01T15:30:59.000+0530",
                            "value": "Paclitaxel",
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
                        }
                    ],
                    "visitStartDate": 1218997800000,
                    "concept": {
                        "shortName": "Progress",
                        "uuid": "b9d7d390-3ed3-4a1d-9e7c-2ccc579d55f9",
                        "name": "Breast Cancer - Progress",
                        "set": true,
                        "dataType": "N/A",
                        "units": null,
                        "conceptClass": "Misc"
                    }
                }
            ]}
    ];
});

