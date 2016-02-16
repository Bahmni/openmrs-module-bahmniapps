describe("PatientDashboardProgramsController", function () {
    var scope, state;

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        scope.section={templateName:""};
        state = jasmine.createSpyObj('$state',['go']);
        $controller('PatientDashboardProgramsController', {
            $scope: scope,
            $state:state,
            $stateParams:null
        });
    }));

    describe("gotoDetailsPage", function () {
        it("should transition to patient.patientProgram.show state", function(){
            scope.gotoDetailsPage()
            expect(state.go).toHaveBeenCalledWith('patient.patientProgram.show');
        });
    });

});