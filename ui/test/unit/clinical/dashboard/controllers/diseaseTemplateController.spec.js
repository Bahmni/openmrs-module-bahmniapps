describe("DiseaseTemplateController", function () {
    var scope;

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        scope.section={templateName:""};
        $controller('DiseaseTemplateController', {
            $scope: scope
        });
    }));

    describe("initialization", function () {
        it("should set showDateTimeForIntake to false", function () {
            expect(scope.showDateTimeForIntake).toBeFalsy();
        });
        it("should set showTimeForProgress to true", function () {
            expect(scope.showTimeForProgress).toBeTruthy();
        });
    });

    describe("getDiseaseTemplateSection", function () {
        it("should return the matched section based on the name", function () {
            scope.diseaseTemplates = [{name:"diabetes progress", "conceptNames":["concept one"]},
                {name: "diabetes intake", "conceptNames":["concept two"]},
                {name: "obstetrics", "conceptNames":["concept three"]}]
            var diseaseTemplateSection = scope.getDiseaseTemplateSection("diabetes progress");
            expect(diseaseTemplateSection).not.toBeUndefined();
            expect(diseaseTemplateSection.conceptNames[0]).toBe("concept one");
        });
    });

});