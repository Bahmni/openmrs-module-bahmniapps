'use strict';

describe("condition", function () {
    var Condition = Bahmni.Common.Domain.Condition;
    var Conditions = Bahmni.Common.Domain.Conditions;
    var DateUtil = Bahmni.Common.Util.DateUtil;

    describe("toggleNonCoded", function () {
        it("should negate the value of isNonCoded", function () {
            var condition = new Condition({
                isNonCoded: true
            });
            condition.toggleNonCoded();
            expect(condition.isNonCoded).toBeFalsy();

            condition.toggleNonCoded();
            expect(condition.isNonCoded).toBeTruthy();
        });
    });

    describe("clearConcept", function () {
        it("should reset concept uuid", function () {
            var condition = new Condition({concept: {uuid: 'uuid'}});
            condition.clearConcept();
            expect(condition.concept.uuid).toBeUndefined();
        });
    });

    describe("isValidConcept", function () {
        it("should be okay to not have concept name", function () {
            var condition = new Condition({
                concept: {uuid: 'uuid'},
                isNonCoded: false
            });
            expect(condition.isValidConcept()).toBeTruthy();
        });
        it("shouldn't be okay to have coded concept without uuid", function () {
            var condition = new Condition({
                concept: {name: 'concept name'},
                isNonCoded: false
            });
            expect(condition.isValidConcept()).toBeFalsy();
        });
        it("should be okay to have non coded concept", function () {
            var condition = new Condition({
                concept: {name: 'concept name'},
                isNonCoded: true
            });
            expect(condition.isValidConcept()).toBeTruthy();
        });
    });

    describe("isValid", function () {
        it("should be okay to have coded concept with a status", function () {
            var condition = new Condition({
                concept: {uuid: 'uuid'},
                isNonCoded: false,
                status: 'ACTIVE'
            });
            expect(condition.isValid()).toBeTruthy();
        });
        it("should be okay to have non coded concept with a status", function () {
            var condition = new Condition({
                concept: {name: 'concept name'},
                isNonCoded: true,
                status: 'ACTIVE'
            });
            expect(condition.isValid()).toBeTruthy();
        });
        it("shouldn't be okay to have non coded concept without status", function () {
            var condition = new Condition({
                concept: {name: 'concept name'},
                isNonCoded: true
            });
            expect(condition.isValid()).toBeFalsy();
        });
        it("shouldn't be okay to have coded concept without status", function () {
            var condition = new Condition({
                concept: {name: 'concept name'},
                isNonCoded: false
            });
            expect(condition.isValid()).toBeFalsy();
        });
    });

    describe("isEmpty", function () {
        it("should be empty when status,Concept and onsetDate is not given", function () {
            var condition = new Condition({});
            expect(condition.isEmpty()).toBeTruthy();
        });
        it("should be empty when status,Concept or onsetDate is given ", function () {
            var condition = new Condition({
                concept: {name: 'concept name'}
            });
            expect(condition.isEmpty()).toBeFalsy();

            var condition = new Condition({
                onSetDate:new Date()
            });
            expect(condition.isEmpty()).toBeFalsy();

            var condition = new Condition({
                status:'ACTIVE'
            });
            expect(condition.isEmpty()).toBeFalsy();
            var condition = new Condition({
                additionalDetail:'some notes'
            });
            expect(condition.isEmpty()).toBeFalsy();
        });
    })

    describe("isActive", function () {
        it("shouldn't be okay if status is INACTIVE", function () {
            var condition = new Condition({
                status: 'INACTIVE'
            });
            expect(condition.isActive()).toBeFalsy();
        });
        it("should be okay if status is ACTIVE", function () {
            var condition = new Condition({
                status: 'ACTIVE'
            });
            expect(condition.isActive()).toBeTruthy();
        });
    });

    describe("displayString", function () {
        it("should be the name of non coded condition", function () {
            var condition = new Condition({
                conditionNonCoded: 'conditionNonCoded name'
            });
            expect(condition.displayString()).toBe('conditionNonCoded name');
        });
        it("should be the short name of coded condition", function () {
            var condition = new Condition({
                concept: {shortName: 'coded short name'}
            });
            expect(condition.displayString()).toBe('coded short name');
        });
        it("should be the full name of coded condition", function () {
            var condition = new Condition({
                concept: {name: 'coded full name'}
            });
            expect(condition.displayString()).toBe('coded full name');
        });
    });

    describe("getPreviousActiveCondition", function () {
        it("should be the same condition when given condition is ACTIVE", function () {
            var condition = new Condition({
                status: 'ACTIVE'
            });
            expect(Conditions.getPreviousActiveCondition(condition, [])).toBe(condition);
        });
        it("should be the same condition when there is no previous condition", function () {
            var condition = new Condition({
                status: 'INACTIVE'
            });
            expect(Conditions.getPreviousActiveCondition(condition, [])).toBe(condition);
        });
        it("should be the second previous condition when that is active", function () {
            var conditions = [
                new Condition({
                    uuid: '1st condition uuid',
                    previousConditionUuid: '2nd condition uuid'
                }),
                new Condition({
                    uuid: '2nd condition uuid',
                    previousConditionUuid: '3rd condition uuid'
                }),
                new Condition({
                    status: 'ACTIVE',
                    uuid: '3rd condition uuid'
                })
            ];

            expect(Conditions.getPreviousActiveCondition(conditions[0],conditions)).toBe(conditions[2]);
        });

    });

    describe("fromConditionHistories", function () {
        it("should consider only condition which is not voided", function () {
            var conditionHistory = {};
            conditionHistory.conditions = [
                {
                    uuid: '001',
                    concept: {uuid: "Headache UUID"},
                    status: 'ACTIVE',
                    onSetDate: DateUtil.parse('2015-01-01'),
                    voided: true
                },
                {
                    uuid: '002',
                    concept: {uuid: "Headache UUID"},
                    status: 'HISTORY_OF',
                    onSetDate: DateUtil.parse('2016-01-01'),
                    voided: true
                },
                {
                    uuid: '003',
                    concept: {uuid: "Headache UUID"},
                    status: 'ACTIVE',
                    onSetDate: DateUtil.parse('2017-01-01')
                }
            ];

            var latestConditions = Conditions.fromConditionHistories([conditionHistory]);
            expect(latestConditions.length).toBe(1);
            expect(latestConditions[0].uuid).toBe('003');

        });
        it("should take recently onSet condition", function () {
            var conditionHistory = {};
            conditionHistory.conditions = [
                {
                    uuid: '001',
                    concept: {uuid: "Headache UUID"},
                    status: 'ACTIVE',
                    onSetDate: DateUtil.parse('2015-01-01')
                },
                {
                    uuid: '002',
                    concept: {uuid: "Headache UUID"},
                    status: 'HISTORY_OF',
                    onSetDate: DateUtil.parse('2016-01-01')
                },
                {
                    uuid: '003',
                    concept: {uuid: "Headache UUID"},
                    status: 'ACTIVE',
                    onSetDate: DateUtil.parse('2017-01-01')
                }
            ];

            var latestConditions = Conditions.fromConditionHistories([conditionHistory]);
            expect(latestConditions.length).toBe(1);
            expect(latestConditions[0].uuid).toBe('003');

        });
    });
});
