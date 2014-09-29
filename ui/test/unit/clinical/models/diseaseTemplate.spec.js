describe("DiseaseTemplate",function(){
    it("should map the server model to view model for patient dashboard",function(){

        var diseaseTemplate = new Bahmni.Clinical.DiseaseTemplate(diseaseTemplateFromServer);
        expect(diseaseTemplate.name).toBe("Breast Cancer");
        expect(diseaseTemplate.sections.length).toBe(1);
        expect(diseaseTemplate.sections[0].name).toBe("Breast Cancer Intake");
        expect(diseaseTemplate.sections[0].visitStartDate).toBe("1218997800000");
        expect(diseaseTemplate.sections[0].observations.length).toBe(4);
    })
});

var diseaseTemplateFromServer = {
    "name": "Breast Cancer",
    "observations": [
    [
        {
            "type": "text",
            "time": "1219052345000",
            "concept": "Receptor Status",
            "links": {
                "providerURIs": [],
                "patientURI": "NEED-TO-CONFIGURE/ws/rest/v1/patient/86526ed5-3c11-11de-a0ba-001e378eb67a",
                "visitURI": "NEED-TO-CONFIGURE/ws/rest/v1/visit/ad41fb41-a41a-4ad6-8835-2f59099acf5b",
                "encounterURI": "NEED-TO-CONFIGURE/ws/rest/v1/encounter/f8ee31f6-1c8e-11e4-bb80-f18addb6f9bb"
            },
            "visitStartDate": "1218997800000",
            "conceptSortWeight": "3",
            "rootConcept": "Breast Cancer Intake",
            "encounterTime": "1221762600000"
        },
        {
            "value": "",
            "type": "numeric",
            "time": "1219052345000",
            "concept": "Histopathology",
            "links": {
                "providerURIs": [],
                "patientURI": "NEED-TO-CONFIGURE/ws/rest/v1/patient/86526ed5-3c11-11de-a0ba-001e378eb67a",
                "visitURI": "NEED-TO-CONFIGURE/ws/rest/v1/visit/ad41fb41-a41a-4ad6-8835-2f59099acf5b",
                "encounterURI": "NEED-TO-CONFIGURE/ws/rest/v1/encounter/bb0af6767-707a-4629-9850-f15206e63ab0"
            },
            "visitStartDate": "1218997800000",
            "conceptSortWeight": "1",
            "rootConcept": "Breast Cancer Intake",
            "encounterTime": "1219084200000"
        },
        {
            "value": "",
            "type": "numeric",
            "time": "1219052345000",
            "concept": "Problem Index",
            "links": {
                "providerURIs": [],
                "patientURI": "NEED-TO-CONFIGURE/ws/rest/v1/patient/86526ed5-3c11-11de-a0ba-001e378eb67a",
                "visitURI": "NEED-TO-CONFIGURE/ws/rest/v1/visit/ad41fb41-a41a-4ad6-8835-2f59099acf5b",
                "encounterURI": "NEED-TO-CONFIGURE/ws/rest/v1/encounter/bb0af6767-707a-4629-9850-f15206e63ab0"
            },
            "visitStartDate": "1218997800000",
            "conceptSortWeight": "4",
            "rootConcept": "Breast Cancer Intake",
            "encounterTime": "1219084200000"
        },
        {
            "value": "175.0",
            "type": "numeric",
            "time": "1219052345000",
            "concept": "Temperature",
            "links": {
                "providerURIs": [],
                "patientURI": "NEED-TO-CONFIGURE/ws/rest/v1/patient/86526ed5-3c11-11de-a0ba-001e378eb67a",
                "visitURI": "NEED-TO-CONFIGURE/ws/rest/v1/visit/ad41fb41-a41a-4ad6-8835-2f59099acf5b",
                "encounterURI": "NEED-TO-CONFIGURE/ws/rest/v1/encounter/f8ee31f6-1c8e-11e4-bb80-f18addb6f9bb"
            },
            "visitStartDate": "1218997800000",
            "conceptSortWeight": "2",
            "rootConcept": "Breast Cancer Intake",
            "encounterTime": "1221762600000"
        }
    ],
    []
]
}