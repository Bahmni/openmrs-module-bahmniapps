'use strict';

describe("disease template section helper", function () {
    it("should add disease template sections in dashboard sections", function () {
        var diseaseTemplates = [new Bahmni.Clinical.DiseaseTemplate(breastCancerDiseaseTemplate), new Bahmni.Clinical.DiseaseTemplate(diabetesDiseaseTemplate)];

        expect(patientDashboardSections.length).toBe(2);
        Bahmni.Clinical.DiseaseTemplateSectionHelper.populateDiseaseTemplateSections(patientDashboardSections, diseaseTemplates);
        expect(patientDashboardSections.length).toBe(4);
        expect(patientDashboardSections[2].title).toBe("Breast Cancer");
        expect(patientDashboardSections[3].title).toBe("Diabetes");
    });
});

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

var breastCancerDiseaseTemplate =
{
    "name": "Breast Cancer",
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
    "name": "Diabetes",
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