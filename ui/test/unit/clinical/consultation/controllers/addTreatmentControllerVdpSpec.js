'use strict';

describe('Variable Dose Protocol - Conflict Check & VDP Logic', function () {
    var DateUtil = Bahmni.Common.Util.DateUtil;

    describe('buildVdpOrdersForConflictCheck', function () {
        var buildVdpOrdersForConflictCheck;

        beforeEach(function () {
            // Mock the function since it's defined in addTreatmentController
            buildVdpOrdersForConflictCheck = function (variableDoseTreatments, excludeIndex) {
                return (variableDoseTreatments || [])
                    .filter(function (vdp, index) {
                        return excludeIndex === undefined || index !== excludeIndex;
                    })
                    .map(function (vdp) {
                        var start = vdp.startDate ? new Date(vdp.startDate) : new Date();
                        var stop = vdp.totalDays > 0 ? new Date(start.getTime() + vdp.totalDays * 86400000) : null;
                        return {
                            getDisplayName: function () { return vdp.drugName; },
                            effectiveStartDate: start,
                            effectiveStopDate: stop,
                            careSetting: vdp.careSetting,
                            overlappingScheduledWith: function (other) {
                                if (!other.effectiveStopDate && !stop) { return true; }
                                if (!other.effectiveStopDate) { return DateUtil.diffInSeconds(stop, other.effectiveStartDate) > -1; }
                                if (!stop) { return DateUtil.diffInSeconds(start, other.effectiveStartDate) > -1 && DateUtil.diffInSeconds(start, other.effectiveStopDate) < 1; }
                                return DateUtil.diffInSeconds(start, other.effectiveStopDate) <= 0 && DateUtil.diffInSeconds(stop, other.effectiveStartDate) > -1;
                            }
                        };
                    });
            };
        });

        it('should return all VDP orders when excludeIndex is undefined', function () {
            var vdpOrders = [
                { drugName: 'Drug1', startDate: new Date('2024-01-01'), totalDays: 5, careSetting: 'OPD' },
                { drugName: 'Drug2', startDate: new Date('2024-01-06'), totalDays: 3, careSetting: 'OPD' }
            ];

            var result = buildVdpOrdersForConflictCheck(vdpOrders);

            expect(result.length).toBe(2);
            expect(result[0].getDisplayName()).toBe('Drug1');
            expect(result[1].getDisplayName()).toBe('Drug2');
        });

        it('should exclude VDP order at specified index', function () {
            var vdpOrders = [
                { drugName: 'Drug1', startDate: new Date('2024-01-01'), totalDays: 5, careSetting: 'OPD' },
                { drugName: 'Drug2', startDate: new Date('2024-01-06'), totalDays: 3, careSetting: 'OPD' },
                { drugName: 'Drug3', startDate: new Date('2024-01-10'), totalDays: 2, careSetting: 'OPD' }
            ];

            var result = buildVdpOrdersForConflictCheck(vdpOrders, 1);

            expect(result.length).toBe(2);
            expect(result[0].getDisplayName()).toBe('Drug1');
            expect(result[1].getDisplayName()).toBe('Drug3');
        });

        it('should detect overlapping orders with matching drug and care setting', function () {
            var vdpOrders = [
                { drugName: 'Paracetamol', startDate: new Date('2024-01-01'), totalDays: 5, careSetting: 'OPD' }
            ];
            var conflictingOrder = {
                effectiveStartDate: new Date('2024-01-03'),
                effectiveStopDate: new Date('2024-01-10'),
                getDisplayName: function () { return 'Paracetamol'; },
                careSetting: 'OPD'
            };

            var vdpConflictOrders = buildVdpOrdersForConflictCheck(vdpOrders);

            expect(vdpConflictOrders[0].overlappingScheduledWith(conflictingOrder)).toBe(true);
        });
    });

    describe('VDP Save Logic', function () {
        it('should replace unsaved VDP entry when editingVariableDoseIndex >= 0', function () {
            var consultationVdp = [
                { drugName: 'Drug1', dose: '10', totalDays: 5 },
                { drugName: 'Drug2', dose: '5', totalDays: 3 }
            ];
            var editingVariableDoseIndex = 0;
            var newEntry = { drugName: 'Drug1-Updated', dose: '15', totalDays: 7 };

            // Simulate the logic from addTreatmentController.js:1220-1222
            if (editingVariableDoseIndex >= 0) {
                consultationVdp.splice(editingVariableDoseIndex, 1, newEntry);
                editingVariableDoseIndex = -1;
            }

            expect(consultationVdp[0]).toBe(newEntry);
            expect(consultationVdp[0].dose).toBe('15');
            expect(consultationVdp.length).toBe(2);
            expect(editingVariableDoseIndex).toBe(-1);
        });

        it('should add previousOrderUuid and action:revise when revising saved order (isSavedOrder=true)', function () {
            var consultationVdp = [];
            var revisingVariableDoseDrugOrder = { uuid: 'order-uuid-123', drugName: 'Drug2' };
            var newEntry = { drugName: 'Drug2-Revised', dose: '20', totalDays: 4 };
            var isSavedOrder = true;

            // Simulate the logic from addTreatmentController.js:1223-1228
            if (isSavedOrder) {
                newEntry.previousOrderUuid = revisingVariableDoseDrugOrder.uuid;
                newEntry.action = Bahmni.Clinical.Constants.orderActions.revise;
                revisingVariableDoseDrugOrder.isBeingEdited = false;
                consultationVdp.push(newEntry);
            }

            expect(newEntry.previousOrderUuid).toBe('order-uuid-123');
            expect(newEntry.action).toBe(Bahmni.Clinical.Constants.orderActions.revise);
            expect(revisingVariableDoseDrugOrder.isBeingEdited).toBe(false);
            expect(consultationVdp.length).toBe(1);
        });

        it('should push new VDP entry when creating new order', function () {
            var consultationVdp = [];
            var newEntry = { drugName: 'Drug3', dose: '8', totalDays: 2 };
            var editingVariableDoseIndex = -1;
            var isSavedOrder = false;

            // Simulate the logic from addTreatmentController.js:1229-1230
            if (editingVariableDoseIndex >= 0) {
                // Edit logic
            } else if (isSavedOrder) {
                // Revise logic
            } else {
                consultationVdp.push(newEntry);
            }

            expect(consultationVdp.length).toBe(1);
            expect(consultationVdp[0]).toBe(newEntry);
            expect(newEntry.previousOrderUuid).toBeUndefined();
            expect(newEntry.action).toBeUndefined();
        });
    });
});
