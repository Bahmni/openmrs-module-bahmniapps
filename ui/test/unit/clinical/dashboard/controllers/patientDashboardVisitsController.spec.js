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
                return {};
            }
        };
        $controller('PatientDashboardVisitsController', {
            $scope: scope,
            $stateParams: {configName: "default"},
            spinner: spinner
        });
    }));

    it("should call the spinner service", function (done) {
        expect(spinner.forPromise).toHaveBeenCalled();
        expect(spinner.forPromise).toHaveBeenCalledWith(jasmine.any(Object), "#id");
        done();
    });

});