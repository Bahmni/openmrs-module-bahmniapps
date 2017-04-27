'use strict';

describe("surgicalAppointmentController", function () {
    var scope, controller;
    var surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['getSurgeonNames']);
    var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
    spinner.forPromise.and.callFake(function () {
        return specUtil.simplePromise({});
    });


    beforeEach(function () {
        module('bahmni.ot');
        inject(function ($controller, $rootScope) {
            controller = $controller;
            scope = $rootScope.$new();
        });
    });

    var createController = function () {
        controller('surgicalAppointmentController', {
            $scope: scope,
            spinner: spinner,
            surgicalAppointmentService: surgicalAppointmentService
        });
    };

    it("Should get the surgeon Names from openMRS", function () {
        var data = {results: [{answers: [{ displayString: "sample name" }, { displayString: "sample name2" }, { displayString: "sample name3" }]}]};
        surgicalAppointmentService.getSurgeonNames.and.returnValue(specUtil.simplePromise({ data: data }));
        createController();

        expect(surgicalAppointmentService.getSurgeonNames).toHaveBeenCalled();
    });
});
