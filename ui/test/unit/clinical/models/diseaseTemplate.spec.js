describe("DiseaseTemplate", function () {
    it("should map the server model to view model for patient dashboard", function () {
        var diseaseTemplateJson = {"concept": {"name": "Breast Cancer", "shortName" : "Breast Cancer -shortName"}, "observationTemplates": observationTemplates};
        var diseaseTemplate = new Bahmni.Clinical.DiseaseTemplateMapper(diseaseTemplateJson, {});

        expect(diseaseTemplate.name).toBe("Breast Cancer");
        expect(diseaseTemplate.label).toBe("Breast Cancer -shortName");
        expect(diseaseTemplate.obsTemplates.length).toBe(2);
        expect(diseaseTemplate.obsTemplates[0].name).toBe("Breast Cancer - Intake");
        expect(diseaseTemplate.obsTemplates[0].visitStartDate).toBe(1218997800000);
        expect(diseaseTemplate.obsTemplates[0].encounters.length).toBe(2);
        expect(diseaseTemplate.obsTemplates[0].encounters[0].encounterDateTime).toBe('1412158286000');
        expect(diseaseTemplate.obsTemplates[0].encounters[0].observations.length).toBe(1);
        expect(diseaseTemplate.obsTemplates[0].encounters[0].observations[0].uuid).toBe('0f4dc38f-4588-49d9-a62c-ac045ddafa60');

        expect(diseaseTemplate.obsTemplates[0].encounters[1].encounterDateTime).toBe('1412157286000');
        expect(diseaseTemplate.obsTemplates[0].encounters[1].observations.length).toBe(1);
        expect(diseaseTemplate.obsTemplates[0].encounters[1].observations[0].uuid).toBe('0f4dc38f-4588-49d9-a62c-ac045ddafa59');

        expect(diseaseTemplate.obsTemplates[1].encounters.length).toBe(1);
        expect(diseaseTemplate.obsTemplates[1].encounters[0].encounterDateTime).toBe('1412159286000');
        expect(diseaseTemplate.obsTemplates[1].encounters[0].observations.length).toBe(1);
        expect(diseaseTemplate.obsTemplates[1].encounters[0].observations[0].uuid).toBe('0f4dc38f-4588-49d9-a62c-ac045ddafa61');
    });

    it("should map grid observations values as comma seperated values", function() {
        var diseaseTemplateJson = {"concept": {"name": "Gynacology", "shortName" : "GYN"}, "observationTemplates": gridTypeDiseaseTemplate};
        var diseaseTemplate = new Bahmni.Clinical.DiseaseTemplateMapper(diseaseTemplateJson, {"P/V (per vaginal) - Uterus": {grid: true}});

        expect(diseaseTemplate.obsTemplates[0].name).toBe("P/V (per vaginal) - Uterus");
        expect(diseaseTemplate.obsTemplates[0].value).toBe("Enlarged, Soft, A/V, Restricted Mobile");
    });
});


var observationTemplates = [
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
            },
            {
                "encounterDateTime": 1412158286000,
                "abnormal": null,
                "isAbnormal": null,
                "conceptSortWeight": 6,
                "uuid": "0f4dc38f-4588-49d9-a62c-ac045ddafa60",
                "conceptUuid": "d1cbb048-d3e6-4da4-834f-7d97df21c172",
                "observationDateTime": "2014-10-02T15:30:59.000+0530",
                "value": "Cancer",
                "type": null,
                "comment": null,
                "concept": {
                    "shortName": null,
                    "uuid": "d1cbb048-d3e6-4da4-834f-7d97df21c171",
                    "name": "Blood",
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
                "encounterDateTime": 1412159286000,
                "abnormal": null,
                "isAbnormal": null,
                "conceptSortWeight": 2,
                "uuid": "0f4dc38f-4588-49d9-a62c-ac045ddafa61",
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
];

var gridTypeDiseaseTemplate = [
    {
        "name": "P/V (per vaginal) - Uterus",
        "concept": {"name": "P/V (per vaginal) - Uterus"},
        "bahmniObservations": [
            {"value": "Enlarged", "concept": {"name": "Size"}},
            {"value": "Soft", "concept": {"name": "Form"}},
            {"value": "A/V", "concept": {"name": "Position"}},
            {"value": "Restricted Mobile", "concept": {"name": "Mobility"}},
        ]
    }
];
