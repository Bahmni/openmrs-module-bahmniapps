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
        var sections = dashboard.getSections(diseaseTemplates);
        expect(sections.length).toBe(1);
        expect(sections[0].length).toBe(3);
    });

    describe("group sections by type", function () {
        it("should group the sections based on the full width", function () {
            var sections = [
                {},
                {"displayType": "Full-Page"},
                {"displayType": "Full-Page"},
                {}
            ];

            var groupedSections = dashboard.groupSectionsByType(sections);
            expect(groupedSections.length).toBe(4);
            expect(groupedSections[0]).toEqual([sections[0]]);
            expect(groupedSections[1]).toEqual([sections[1]]);
            expect(groupedSections[2]).toEqual([sections[2]]);
            expect(groupedSections[3]).toEqual([sections[3]]);
        });

        it("should group sections with all half page width", function() {
            var sections = [ {}, {}, {} ];

            var groupedSections = dashboard.groupSectionsByType(sections);
            expect(groupedSections).toEqual([sections]);
        });

        it("should group the mixed sections", function () {
            var groupedSections = dashboard.groupSectionsByType(sections);

            var sections = [
                {},
                {"displayType": "Full-Page"},
                {},
                {"displayType": "Full-Page"},
                {}
            ];
            var groupedSections = dashboard.groupSectionsByType(sections);
            expect(groupedSections.length).toBe(5);
        });

    });
});