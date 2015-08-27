'use strict';
describe("Program display control", function () {

    var compile, rootScope, programService;
    var DateUtil = Bahmni.Common.Util.DateUtil;
    var element;

    beforeEach(function() {
        module('bahmni.common.displaycontrol.programs');
        module('ngHtml2JsPreprocessor');
    });
    beforeEach(module(function ($provide) {
        programService = jasmine.createSpyObj('programService', ['getPatientPrograms']);
        $provide.value('programService', programService);
    }));

    beforeEach(inject(function ($compile, $rootScope) {
        compile = $compile;
        rootScope = $rootScope;
    }));

    var today = DateUtil.endOfToday();
    var yesterday = DateUtil.addDays(today, -1);
    var tenDaysAgo = DateUtil.addDays(today, -10);
    var fiveDaysFromToday = DateUtil.addDays(today, 5);

    var data = {
        results: [
            {
                "display": "Tuberculosis Program",
                "dateEnrolled": DateUtil.formatDateWithoutTime(tenDaysAgo),
                "dateCompleted": DateUtil.formatDateWithTime(yesterday),
                "outcome": null
            },
            {
                "display": "HIV Program",
                "dateEnrolled": DateUtil.formatDateWithoutTime(tenDaysAgo),
                "dateCompleted": DateUtil.formatDateWithoutTime(today),
                "outcome": null
            },
            {
                "display": "End TB Program",
                "dateEnrolled": DateUtil.formatDateWithoutTime(tenDaysAgo),
                "dateCompleted": DateUtil.formatDateWithoutTime(fiveDaysFromToday),
                "outcome": null
            },
            {
                "display": "End Fever Program",
                "dateEnrolled": DateUtil.formatDateWithoutTime(tenDaysAgo),
                "dateCompleted": null,
                "outcome": null
            }
        ]
    };

    var compileAndDigest = function () {
        element = angular.element('<programs patient="patient"></programs>');
        compile(element)(rootScope);
        rootScope.$digest();
    };

    it("Shows active programs", function () {
        rootScope.patient = {
            uuid: "uuid"
        };

        programService.getPatientPrograms.and.returnValue(specUtil.createFakePromise(data));
        compileAndDigest();

        var elementIsolatedScope = element.isolateScope();

        expect(elementIsolatedScope.activePrograms.length).toBe(1);
        expect(elementIsolatedScope.activePrograms[0].display).toBe("End Fever Program");
    });

    it("Shows past programs and sort by descending order of program end date when dateCompleted is not given", function () {
        rootScope.patient = {
            uuid: "uuid"
        };

        programService.getPatientPrograms.and.returnValue(specUtil.createFakePromise(data));
        compileAndDigest();

        var elementIsolatedScope = element.isolateScope();

        expect(elementIsolatedScope.pastPrograms.length).toBe(3);
        expect(elementIsolatedScope.pastPrograms[0].display).toBe("HIV Program");
    });
});