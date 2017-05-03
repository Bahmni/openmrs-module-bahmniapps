'use strict';

describe("surgicalAppointmentController", function () {
    var scope, controller, q;
    var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
    var surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['getSurgeons']);
    var locationService = jasmine.createSpyObj('locationService', ['getAllByTag']);
    spinner.forPromise.and.callFake(function () {
        return specUtil.simplePromise({});
    });


    beforeEach(function () {
        module('bahmni.ot');
        inject(function ($controller, $rootScope, $q) {
            controller = $controller;
            scope = $rootScope.$new();
            q = $q;
        });
    });

    var createController = function () {
        controller('surgicalAppointmentController', {
            $scope: scope,
            $q: q,
            spinner: spinner,
            surgicalAppointmentService: surgicalAppointmentService,
            locationService: locationService
        });
    };

    it("should get the surgeon Names from openMRS", function () {
        var surgeons = {results: [{answers: [{ displayString: "sample name" }, { displayString: "sample name2" }, { displayString: "sample name3" }]}]};
        var locations = {
            results: [{display: 'OT1'}, {display: 'OT2'}, {display: 'OT3'}]
        };
        surgicalAppointmentService.getSurgeons.and.returnValue(specUtil.simplePromise({ data: surgeons }));
        locationService.getAllByTag.and.returnValue(specUtil.simplePromise({ data: locations }));
        expect(scope.surgeons).toBeUndefined();

        createController();
        expect(surgicalAppointmentService.getSurgeons).toHaveBeenCalled();
    });

    it("should not invalidate start datetime or end datetime when either of them is missing", function () {
        createController();
        expect(scope.isStartDatetimeBeforeEndDatetime()).toBeTruthy();
        expect(scope.isStartDatetimeBeforeEndDatetime(new Date())).toBeTruthy();
        expect(scope.isStartDatetimeBeforeEndDatetime(undefined, new Date())).toBeTruthy();
    });

    it("should validate a form having end date greater than start date", function () {
        createController();
        scope.createSurgicalBlockForm = {};
        scope.createSurgicalBlockForm.$valid = true;
        scope.surgicalForm.startDatetime = new Date(2017, 1, 30, 1, 11);
        scope.surgicalForm.endDatetime = new Date(2017, 1, 30, 2, 11);
        expect(scope.isFormValid()).toBeTruthy();
    });

    it("should not validate a form having end date less than start date", function () {
        createController();
        scope.createSurgicalBlockForm = {};
        scope.createSurgicalBlockForm.$valid = true;
        scope.surgicalForm.endDatetime = new Date(2017, 1, 30, 1, 11);
        scope.surgicalForm.startDatetime = new Date(2017, 1, 30, 2, 11);
        expect(scope.isFormValid()).toBeFalsy();
    })
});
