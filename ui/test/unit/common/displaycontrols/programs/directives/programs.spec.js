'use strict';
describe("Program display control", function () {

    var compile, rootScope, programService,translateFilter;
    var DateUtil = Bahmni.Common.Util.DateUtil;
    var element,q;

    beforeEach(function() {
        module('bahmni.common.displaycontrol.programs');
        module('ngHtml2JsPreprocessor');
    });
    beforeEach(module(function ($provide) {
        programService = jasmine.createSpyObj('programService', ['getPatientPrograms']);
        translateFilter = jasmine.createSpy('translateFilter');
        $provide.value('programService', programService);
        $provide.value('translateFilter',translateFilter);
    }));

    beforeEach(inject(function ($compile, $rootScope, $q) {
        compile = $compile;
        rootScope = $rootScope;
        q = $q;
    }));

    var today = DateUtil.endOfToday();
    var yesterday = DateUtil.addDays(today, -1);
    var tenDaysAgo = DateUtil.addDays(today, -10);
    var fiveDaysFromToday = DateUtil.addDays(today, 5);

    var data = {
        activePrograms: [{
            "display": "End Fever Program",
            "dateEnrolled": tenDaysAgo.toString(),
            "dateCompleted": null,
            "outcome": null
        }],

        endedPrograms: [{
            "display": "Tuberculosis Program",
            "dateEnrolled": tenDaysAgo.toString(),
            "dateCompleted": fiveDaysFromToday.toString(),
            "outcome": null
        }, {
            "display": "HIV Program",
            "dateEnrolled": tenDaysAgo.toString(),
            "dateCompleted": today.toString(),
            "outcome": null
        },
            {
                "display": "End TB Program",
                "dateEnrolled": tenDaysAgo.toString(),
                "dateCompleted": yesterday.toString(),
                "outcome": null
            },
        ]
    }

    var compileAndDigest = function () {
        element = angular.element('<programs patient="patient"></programs>');
        compile(element)(rootScope);
        rootScope.$digest();
    };

    it("Shows active programs and ended programs", function () {
        rootScope.patient = {
            uuid: "uuid"
        };

        var deferred;

        programService.getPatientPrograms.and.callFake(function () {
            deferred = q.defer();
            deferred.resolve(data);
            return deferred.promise;
        });
        compileAndDigest();
        var elementIsolatedScope = element.isolateScope();
        expect(elementIsolatedScope.activePrograms.length).toBe(1);
        expect(elementIsolatedScope.activePrograms[0].display).toBe("End Fever Program");

    });
});