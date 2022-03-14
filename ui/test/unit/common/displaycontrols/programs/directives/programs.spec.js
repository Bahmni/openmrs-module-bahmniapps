'use strict';
describe("Program display control", function () {

    var compile, rootScope, programService, _provide, translateFilter;
    var DateUtil = Bahmni.Common.Util.DateUtil;
    var element, q;

    beforeEach(function () {
        module('bahmni.common.displaycontrol.programs');
        module('ngHtml2JsPreprocessor');
    });
    beforeEach(module(function ($provide) {
        programService = jasmine.createSpyObj('programService', ['getPatientPrograms', 'getProgramStateConfig']);
        translateFilter = jasmine.createSpy('translateFilter');
        $provide.value('programService', programService);
        $provide.value('translateFilter', translateFilter);
        _provide = $provide;
        $provide.value('$state', {params: {}})
        var $translate = jasmine.createSpyObj('$translate', ['instant']);
        $provide.value('$translate', $translate);
    }));

    beforeEach(inject(function ($compile, $rootScope, $q) {
        compile = $compile;
        rootScope = $rootScope;
        q = $q;
        rootScope.currentUser = {
            userProperties: function () {
                return {defaultLocale: 'en'};
            }
        }
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

        programService.getProgramStateConfig.and.callFake(function () {
            return true;
        });
        compileAndDigest();
        var elementIsolatedScope = element.isolateScope();
        expect(elementIsolatedScope.activePrograms.length).toBe(1);
        expect(elementIsolatedScope.activePrograms[0].display).toBe("End Fever Program");

        expect(elementIsolatedScope.getAttributeValue(
            {
                "uuid": "12cac096-ac84-419f-88c3-f140a3c13d99",
                "name": "Sample concept attribute",
                "value": {
                    "uuid": "c2107f30-3f10-11e4-adec-0800271c1b75",
                    "display": "UneducatedFull",
                    "name": {
                        "conceptNameType": "FULLY_SPECIFIED",
                        "display": "UneducatedFull"
                    },
                    "names": [
                        {
                            "display": "UneducatedFull"
                        },
                        {
                            "display": "UneducatedShort"
                        }
                    ]
                },
                "attributeType": {
                    "uuid": "uuid3",
                    "description": "Sample concept attribute",
                    "name": "Sample concept attribute",
                    "format": "org.bahmni.module.bahmnicore.customdatatype.datatype.CodedConceptDatatype"
                }
            }
        )).toBe("UneducatedShort");

        expect(elementIsolatedScope.getAttributeValue(
                {
                    "uuid": "12cac096-ac84-419f-88c3-f140a3c13d99",
                    "name": "Sample date attribute",
                    "value": "2016-01-13T00:00:00.000+0000",
                    "attributeType": {
                        "uuid": "uuid1",
                        "name": "Sample date attribute",
                        "description": "Date Attribute",
                        "format": "org.openmrs.customdatatype.datatype.DateDatatype"
                    }
                }) === Bahmni.Common.Util.DateUtil.formatDateWithoutTime("2016-01-13T00:00:00.000+0000")).toBeTruthy();

        expect(elementIsolatedScope.getAttributeValue({
                "uuid": "12cac096-ac84-419f-88c3-f140a3c13d99",
                "name": "Sample regex attribute",
                "value": "123",
                "attributeType": {
                    "uuid": "uuid2",
                    "description": "Sample regex attribute",
                    "name": "Sample regex attribute",
                    "format": "org.openmrs.customdatatype.datatype.RegexValidationDatatype"
                }
            }) === "123").toBeTruthy();

        expect(programService.getPatientPrograms).toHaveBeenCalledWith(rootScope.patient.uuid, true, undefined)
    });

    it("should make a call to get specific program from a patient", function () {
        _provide.value('$state', {params: {enrollment: 'patientProgramUuid'}});
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
        element.isolateScope();

        expect(programService.getPatientPrograms).toHaveBeenCalledWith(rootScope.patient.uuid, true, 'patientProgramUuid')
    })
});
