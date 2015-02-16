describe("Dashboard", function () {

    var DASHBOARD = {
        "dashboardName": "General",
        "default": true,
        "sections": [
            {
                "title": "Nutritional Values",
                "name": "vitals",
                "conceptNames": ["Height", "Weight", "BMI", "BMI STATUS"]
            },
            {
                "title": "Diagnosis",
                "name": "diagnosis"
            },
            {
                "title": "Diabetes",
                "templateName": "Diabetes Template",
                "name": "diseaseTemplate"
            },
            {
                "title": "tuberculosis",
                "templateName": "TB Template",
                "name": "diseaseTemplate"
            }
        ]
    };

    var dashboard;

    beforeEach(function () {
        dashboard = new Bahmni.Common.DisplayControl.Dashboard(DASHBOARD);
    });

    it("should get section by name", function () {
        expect(dashboard.getSectionByName("vitals").title).toBe("Nutritional Values");
    });
    
    it("should only get disease template section with data", function () {
        var diseaseTemplates = [
            {
                name: "Diabetes Template",
                obsTemplates: [
                    {value: "1"},
                    {value: "2"}
                ]
            }
        ];
        expect(dashboard.getSections(diseaseTemplates).length).toBe(3);
    });
});