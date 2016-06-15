describe("Dashboard", function () {

    var DASHBOARD = {
        "dashboardName": "General",
        "default": true,
        "sections": [
            {
                "title": "Nutritional Values",
                "type": "vitals",
                "conceptNames": ["Height", "Weight", "BMI", "BMI STATUS"]
            },
            {
                "title": "Diagnosis",
                "type": "diagnosis"
            },
            {
                "title": "Diabetes",
                "templateName": "Diabetes Template",
                "type": "diseaseTemplate"
            },
            {
                "title": "tuberculosis",
                "templateName": "TB Template",
                "type": "diseaseTemplate"
            }
        ]
    };

    var dashboard;

    beforeEach(function () {
        dashboard = new Bahmni.Common.DisplayControl.Dashboard(DASHBOARD);
    });

    it("should get section by name", function () {
        expect(dashboard.getSectionByType("vitals").title).toBe("Nutritional Values");
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

        it("should group the half and one-fourth sections", function () {

            var sections = [
                {"displayType": "Half-Page"},
                {"displayType": "LAYOUT_25_75"}
            ];
            var groupedSections = dashboard.groupSectionsByType(sections);
            expect(groupedSections.length).toBe(1);
            expect(groupedSections[0].length).toBe(2);
        });

        it("should group the three-fourth and one-fourth sections", function () {

            var sections = [
                {"displayType": "LAYOUT_75_25"},
                {"displayType": "LAYOUT_25_75"}
            ];
            var groupedSections = dashboard.groupSectionsByType(sections);
            expect(groupedSections.length).toBe(1);
            expect(groupedSections[0].length).toBe(2);
        });

        it("should group all half-page and one-fourth sections", function () {

                var sections = [
                    {"displayType": "Half-Page"},
                    {"displayType": "Half-Page"},
                    {"displayType": "LAYOUT_25_75"},
                    {"displayType": "Half-Page"},
                    {"displayType": "LAYOUT_25_75"}
                ];
                var groupedSections = dashboard.groupSectionsByType(sections);
                expect(groupedSections.length).toBe(1);
                expect(groupedSections[0].length).toBe(5);
        });

        it("should group full-page sections separately", function () {

                var sections = [
                    {"displayType": "Half-Page"},
                    {"displayType": "Full-Page"},
                    {"displayType": "LAYOUT_25_75"},
                    {"displayType": "Half-Page"},
                    {"displayType": "LAYOUT_25_75"}
                ];
                var groupedSections = dashboard.groupSectionsByType(sections);
                expect(groupedSections.length).toBe(3);
                expect(groupedSections[0].length).toBe(1);
                expect(groupedSections[1].length).toBe(1);
                expect(groupedSections[2].length).toBe(3);
        });

        it("should group all three-fourth and one-fourth present in-between", function () {

                var sections = [
                    {"displayType": "Half-Page"},
                    {"displayType": "LAYOUT_25_75"},
                    {"displayType": "LAYOUT_75_25"},
                    {"displayType": "LAYOUT_25_75"},
                    {"displayType": "Half-Page"},
                    {"displayType": "LAYOUT_25_75"}
                ];
                var groupedSections = dashboard.groupSectionsByType(sections);
                expect(groupedSections.length).toBe(3);
                expect(groupedSections[0].length).toBe(1);
                expect(groupedSections[1].length).toBe(2);
                expect(groupedSections[2].length).toBe(3);
        });

        it("sections with no displayType should be grouped as half-page sections", function () {

                var sections = [
                    {"displayType": "Half-Page"},
                    {},
                    {"displayType": "LAYOUT_75_25"},
                    {"displayType": "LAYOUT_25_75"},
                    {},
                    {"displayType": "Half-Page"},
                    {"displayType": "LAYOUT_25_75"}
                ];
                var groupedSections = dashboard.groupSectionsByType(sections);
                expect(groupedSections.length).toBe(3);
                expect(groupedSections[0].length).toBe(2);
                expect(groupedSections[1].length).toBe(2);
                expect(groupedSections[2].length).toBe(3);
        });

        it("should group all half-page one-fourth together if no displayType mentioned", function () {

            var sections = [
                {"displayType": "Half-Page"},
                {},
                {},
                {"displayType": "LAYOUT_25_75"},
                {"displayType": "LAYOUT_75_25"},
                {"displayType": "Half-Page"},
                {"displayType": "LAYOUT_25_75"}
            ];
            var groupedSections = dashboard.groupSectionsByType(sections);
            expect(groupedSections.length).toBe(3);
            expect(groupedSections[0].length).toBe(3);
            expect(groupedSections[1].length).toBe(2);
            expect(groupedSections[2].length).toBe(2);
        });

        it("should group one-fourth with the first three-fourth section", function () {

            var sections = [
                {"displayType": "LAYOUT_75_25"},
                {"displayType": "LAYOUT_25_75"},
                {"displayType": "LAYOUT_75_25"}
            ];
            var groupedSections = dashboard.groupSectionsByType(sections);
            expect(groupedSections.length).toBe(2);
            expect(groupedSections[0].length).toBe(2);
            expect(groupedSections[1].length).toBe(1);
        });

        it("should group with half-page and one-fourth section if displayType is incorrect", function () {

            var sections = [
                {"displayType": "LAYOUT_25_75"},
                {"displayType": "INCORRECT"},
                {"displayType": "Half-Page"},
                {"displayType": "LAYOUT_75_25"}
            ];
            var groupedSections = dashboard.groupSectionsByType(sections);
            expect(groupedSections.length).toBe(2);
            expect(groupedSections[0].length).toBe(3);
            expect(groupedSections[1].length).toBe(1);
        });

    });
});