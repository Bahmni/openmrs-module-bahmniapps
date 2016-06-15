'use strict';

describe('Treatment Table DisplayControl', function () {

    var DEFAULT_DASHBOARD = {
        "dashboardName": "General",
        "maxRecentlyViewedPatients": 8,
        "displayByDefault": true,
        "sections": [
            {
                "type": "vitals"
            },
            {
                "title": "Diabetes",
                "type": "diseaseTemplate"
            },
            {
                "title": "Diagnosis",
                "type": "diagnosis"
            },
            {
                "title": "TB",
                "type": "diseaseTemplate"
            }
        ]
    };
    var ANOTHER_DASHBOARD = {
        "dashboardName": "General - 2",
        "displayByDefault": true,
        "sections": [
            {
                "title": "Patient Information",
                "type": "patientInformation"
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

    it("should have identifierkey as dashboardName when there is no translation key", function(){
        expect(dashboardConfig.identifierKey).toBe("dashboardName");
    })

    it("should not have identifierkey as dashboardName when there is translation key", function(){
        ANOTHER_DASHBOARD.translationKey = 'another_dasboard_translation_key';
        var anotherDashboardConfig = new Bahmni.Clinical.ClinicalDashboardConfig([ANOTHER_DASHBOARD]);
        expect(anotherDashboardConfig.identifierKey).toBe("translationKey");
    })

});