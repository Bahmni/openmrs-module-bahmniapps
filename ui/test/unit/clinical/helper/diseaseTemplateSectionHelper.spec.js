'use strict';

describe("disease template section helper", function () {
    it("should add disease template sections in dashboard sections",function(){
        expect(patientDashboardSections.length).toBe(2);
        Bahmni.Clinical.DiseaseTemplateSectionHelper.populateDiseaseTemplateSections(patientDashboardSections,diseaseTemplatesList);
        expect(patientDashboardSections.length).toBe(4);
        expect(patientDashboardSections[2].title).toBe("Breast Cancer");
        expect(patientDashboardSections[3].title).toBe("Diabetes");
    });
})

var patientDashboardSections= [
    {
        "title": "Diagnosis",
        "name": "diagnosis"
    },
    {
        "title": "Lab Orders",
        "name": "labOrders"
    }
];

var diseaseTemplatesList =[
    {
        "name": "Breast Cancer",
        "sections": [
            {
                "name": "Breast Cancer progress",
                "visitStartDate": 1405586598000,
                "observations": [
                    {
                        "visitStartDate": 1405586598000,
                        "rootConcept": "Breast Cancer progress",
                        "encounterTime": 1411476674000,
                        "value": "95.0",
                        "time": 1411476674000,
                        "concept": "SPO2"
                    },
                    {
                        "visitStartDate": 1405586598000,
                        "rootConcept": "Breast Cancer progress",
                        "encounterTime": 1411476674000,
                        "value": "18.0",
                        "time": 1411476674000,
                        "concept": "RR"
                    }
                ]
            }
        ],
        toDashboardSection :function(){
            return {
                title:"Breast Cancer",
                name:'diseaseTemplate'
            }
        }
    },
    {
        "name": "Diabetes",
        "sections": [
            {
                "name": "Diabetes Intake",
                "visitStartDate": 1405586598000,
                "observations": [
                    {
                        "visitStartDate": 1405586598000,
                        "rootConcept": "Diabetes Intake",
                        "encounterTime": 1411648284000,
                        "value": "sdsdsd",
                        "time": 1411648284000,
                        "concept": "Test-B"
                    },
                    {
                        "visitStartDate": 1405586598000,
                        "rootConcept": "Diabetes Intake",
                        "encounterTime": 1411648284000,
                        "value": "2.0",
                        "time": 1411648284000,
                        "concept": "Test-A"
                    }
                ]
            }
        ],
        toDashboardSection :function(){
            return {
                title:"Diabetes",
                name:'diseaseTemplate'
            }
        }

    }
]