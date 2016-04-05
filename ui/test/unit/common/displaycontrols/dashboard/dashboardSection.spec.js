describe("Dashboard Section", function () {

    var dashboardSection;

    it("should get the view template for observation section", function () {
        var section = {
            "title": "Nutritional Values",
            "type": "vitals",
            "conceptNames": ["Height", "Weight", "BMI", "BMI STATUS"],
            "isObservation": true
        };

        dashboardSection = new Bahmni.Common.DisplayControl.Dashboard.Section(section);
        expect(dashboardSection.viewName).toBe("../common/displaycontrols/dashboard/views/sections/observationSection.html");
    });

    it("should get the view template for disposition section", function () {
        var section = {
            "title": "Nutritional Values",
            "type": "disposition",
            "conceptNames": ["Height", "Weight", "BMI", "BMI STATUS"],
            "disposition": true
        };

        dashboardSection = new Bahmni.Common.DisplayControl.Dashboard.Section(section);
        expect(dashboardSection.viewName).toBe("../common/displaycontrols/dashboard/views/sections/disposition.html");

    });

    it("should get the view template for labOrder section", function () {
        var section = {
            "title": "Nutritional Values",
            "type": "labOrders",
            "conceptNames": ["Height", "Weight", "BMI", "BMI STATUS"],
            "disposition": true
        };

        dashboardSection = new Bahmni.Common.DisplayControl.Dashboard.Section(section);
        expect(dashboardSection.viewName).toBe("../clinical/dashboard/views/dashboardSections/labOrders.html");

    })

    it("should get the view template for custom control section", function () {
        var section = {
            "title": "Custom Display Control",
            "type": "custom",
            "config":{

            }
        };
        dashboardSection = new Bahmni.Common.DisplayControl.Dashboard.Section(section);
        expect(dashboardSection.viewName).toBe("../common/displaycontrols/dashboard/views/sections/custom.html");
    })

});