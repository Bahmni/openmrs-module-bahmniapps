'use strict';

describe('Treatment Table DisplayControl', function () {

    var DEFAULT_DASHBOARD = {
        "dashboardName": "General",
        "maxRecentlyViewedPatients": 8,
        "displayByDefault": true,
        "sections": [
            {
                "name": "vitals"
            },
            {
                "title": "Diabetes",
                "name": "diseaseTemplate"
            },
            {
                "title": "Diagnosis",
                "name": "diagnosis"
            },
            {
                "title": "TB",
                "name": "diseaseTemplate"
            }
        ]
    };
    var ANOTHER_DASHBOARD = {
        "dashboardName": "General - 2",
        "displayByDefault": true,
        "sections": [
            {
                "title": "Patient Information",
                "name": "patientInformation"
            }
        ]
    };

    var DASHBOARD_CONFIG = [
        DEFAULT_DASHBOARD,
        ANOTHER_DASHBOARD
    ];

    var dashboardConfig = new Bahmni.Clinical.ClinicalDashboardConfig(DASHBOARD_CONFIG);

    beforeEach(module('bahmni.clinical'));

    it("should get disease template sections for the current dashboard", function () {
        expect(dashboardConfig.getDiseaseTemplateSections().length).toBe(2);
        expect(dashboardConfig.getDiseaseTemplateSections()[0].title).toBe("Diabetes");
        expect(dashboardConfig.getDiseaseTemplateSections()[1].title).toBe("TB");
    });

    it("should get max recently viewed patients", function () {
        expect(dashboardConfig.getMaxRecentlyViewedPatients()).toBe(8);
    });

    it("should get default number of maximum recently viewed patients if not specified", function () {
        var anotherDashboardConfig = new Bahmni.Clinical.ClinicalDashboardConfig([ANOTHER_DASHBOARD]);
        expect(anotherDashboardConfig.getMaxRecentlyViewedPatients()).toBe(10);
    });

});