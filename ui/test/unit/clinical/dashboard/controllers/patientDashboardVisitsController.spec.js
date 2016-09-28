describe("PatientDashboardVisitsController", function () {
    var scope;
    var spinner = jasmine.createSpyObj("spinner", ["forPromise"]);
    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        scope.section = {templateName: "", id: "id"};
        scope.visitHistory = {visits: []};
        scope.dashboard = {
            getSectionByType: function (type) {
                return {
                    "translationKey": "DASHBOARD_TITLE_VISITS_KEY",
                    "type": "visits",
                    "displayOrder": 17,
                    "dashboardConfig": {
                        "title": "visitDashboard",
                        "maximumNoOfVisits": 8,
                        "groupByVisits": true
                    }
                }
            }
        };

        $controller('PatientDashboardVisitsController', {
            $scope: scope,
            $stateParams: {configName: "default", patientUuid: "fc6ede09-f16f-4877-d2f5-ed8b2182ec11"},
            spinner: spinner
        });
    }));

    it("should call the spinner service", function () {
        expect(scope.noOfVisits).toBe(0);
        expect(scope.dashboardConfig.title).toBe("visitDashboard");
        expect(scope.patientUuid).toBe("fc6ede09-f16f-4877-d2f5-ed8b2182ec11");
    });

});