'use strict';

describe('Treatment Table DisplayControl', function () {

    var DEFAULT_DASHBOARD = {
        "dashboardName": "General",
        "default": true,
        "sections": [
            {
                "title": "Nutritional Values",
                "name": "vitals",
                "conceptNames": ["Height", "Weight", "BMI", "BMI STATUS"],
                "scope": "latest",
                "isObservation": true,
                "pivotTable": {
                    "numberOfVisits": "4",
                    "groupBy": "encounters",
                    "obsConcepts": ["Vitals", "Height", "Weight", "Pathology"],
                    "drugConcepts": "",
                    "labConcepts": ""
                }
            },
            {
                "title": "Diagnosis",
                "name": "diagnosis"
            },
            {
                "title": "Diabetes",
                "templateName": "Diabetes Template",
                "name": "diseaseTemplate",
                "showOnly": [],
                "pivotTable": {
                    "numberOfVisits": "15",
                    "groupBy": "encounters",
                    "obsConcepts": ["Weight", "Height", "Systolic", "Diastolic", "Diabetes, Foot Exam", "Diabetes, Eye Exam"],
                    "drugConcepts": ["Ipratropium Pressurised", "Garbhpal Rasa"],
                    "labConcepts": ["RBS", "FBS", "PP2BS", "Hb1AC", "Creatinine", "Albumin", "Polymorph"]
                }
            }
        ]
    };
    var ANOTHER_DASHBOARD = {
        "dashboardName": "General - 2",
        "sections": [
            {
                "title": "Patient Information",
                "name": "patientInformation",
                "patientAttributes": ["caste", "class", "education", "occupation"]
            }
        ]
    };
    var DASHBOARD_CONFIG = [
        DEFAULT_DASHBOARD,
        ANOTHER_DASHBOARD
    ];

    var dashboardConfig = new Bahmni.Clinical.ClinicalDashboardConfig(DASHBOARD_CONFIG);

    beforeEach(module('bahmni.clinical'));

    it("should set default dashboardConfig", function () {
        expect(dashboardConfig.getCurrentDashboard().dashboardName).toBe("General");
    });

    it("should get disease template sections for the current dashboard", function () {
        expect(dashboardConfig.getDiseaseTemplateSections().length).toBe(1);
        expect(dashboardConfig.getDiseaseTemplateSections()[0].title).toBe("Diabetes");
    });

    it("should returned unopened dashboards", function () {
        expect(dashboardConfig.getUnOpenedDashboards().length).toBe(1);
    });

    it("should switch dashboard", function () {
        dashboardConfig.switchDashboard(ANOTHER_DASHBOARD);
        expect(dashboardConfig.getUnOpenedDashboards().length).toBe(0);
        expect(dashboardConfig.getCurrentDashboard().dashboardName).toBe("General - 2");
    });

    it("should close dashboard", function () {
        dashboardConfig.closeDashboard(ANOTHER_DASHBOARD);
        expect(dashboardConfig.getCurrentDashboard().dashboardName).toBe("General");
        expect(dashboardConfig.getUnOpenedDashboards().length).toBe(1);
    });

    it("should show dashboard tabs", function () {
        expect(dashboardConfig.showTabs()).toBe(true);
    });
    
});