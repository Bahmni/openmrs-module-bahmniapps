'use strict';

describe('Filters: treatment', function () {
    var dosageStringFilter, stageQuantityFilter, treatmentService, $q, $rootScope;

    beforeEach(module('bahmni.common.uiHelper'));

    beforeEach(module(function ($provide) {
        treatmentService = jasmine.createSpyObj('treatmentService', ['getConfig']);
        $provide.value('treatmentService', treatmentService);
    }));

    beforeEach(inject(function ($filter, _$q_, _$rootScope_) {
        $q = _$q_;
        $rootScope = _$rootScope_;

        treatmentService.getConfig.and.returnValue($q.when({
            data: {
                frequencies: [
                    { name: 'Once daily', frequencyPerDay: 1 },
                    { name: 'Once a day', frequencyPerDay: 1 },
                    { name: 'Twice a day', frequencyPerDay: 2 },
                    { name: 'Four times a day', frequencyPerDay: 4 }
                ]
            }
        }));

        dosageStringFilter = $filter('dosageString');
        stageQuantityFilter = $filter('stageQuantity');

        $rootScope.$apply();
    }));

    describe('Filter: dosageString', function () {
        it('should return empty string for null stage', function () {
            expect(dosageStringFilter(null, {})).toBe('');
        });

        it('should delegate to buildDosageString with drugOrder.route', function () {
            var stage = {
                dose: '10',
                unit: 'mg',
                frequency: 'Once daily'
            };
            var drugOrder = { route: 'Oral' };
            var result = dosageStringFilter(stage, drugOrder);
            expect(result).toContain('Oral');
            expect(result).toContain('10 mg');
            expect(result).toContain('Once daily');
        });

        it('should handle drugOrder without route property', function () {
            var stage = {
                dose: '10',
                unit: 'mg'
            };
            var drugOrder = {};
            var result = dosageStringFilter(stage, drugOrder);
            expect(result).toBe('10 mg');
        });
    });

    describe('Filter: stageQuantity', function () {
        it('should return dose only for loading dose', function () {
            var stage = {
                dose: '300',
                unit: 'mg',
                isLoadingDose: true,
                frequency: 'Twice a day',
                durationDays: 3
            };
            expect(stageQuantityFilter(stage)).toBe('300 mg');
        });

        it('should calculate quantity using frequency lookup', function () {
            var stage = {
                dose: '100',
                unit: 'mg',
                isLoadingDose: false,
                frequency: 'Twice a day',
                durationDays: 5
            };
            // Frequency lookup: "Twice a day" → 2, so 100 × 2 × 5 = 1000
            expect(stageQuantityFilter(stage)).toBe('1000 mg');
        });

        it('should handle different frequency frequencies', function () {
            var stage = {
                dose: '50',
                unit: 'mg',
                isLoadingDose: false,
                frequency: 'Four times a day',
                durationDays: 3
            };
            // Frequency lookup: "Four times a day" → 4, so 50 × 4 × 3 = 600
            expect(stageQuantityFilter(stage)).toBe('600 mg');
        });

        it('should default frequencyPerDay to 1 when frequency not in config', function () {
            var stage = {
                dose: '100',
                unit: 'mg',
                isLoadingDose: false,
                frequency: 'Unknown frequency',
                durationDays: 2
            };
            // Unknown frequency defaults to 1, so 100 × 1 × 2 = 200
            expect(stageQuantityFilter(stage)).toBe('200 mg');
        });

        it('should handle floating point dose', function () {
            var stage = {
                dose: '10.5',
                unit: 'mg',
                isLoadingDose: false,
                frequency: 'Twice a day',
                durationDays: 3
            };
            // Frequency lookup: "Twice a day" → 2, so 10.5 × 2 × 3 = 63
            expect(stageQuantityFilter(stage)).toBe('63 mg');
        });
    });
});
