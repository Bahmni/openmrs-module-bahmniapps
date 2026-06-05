'use strict';

describe('FhirDosingUtils', function () {
    var utils;

    beforeEach(function () {
        utils = Bahmni.Clinical.FhirDosingUtils;
    });

    describe('normalizeToDays', function () {
        it('should return 0 for occurrence units', function () {
            expect(utils.normalizeToDays(1, 'Occurrence(s)')).toBe(0);
            expect(utils.normalizeToDays(3, 'occurrences')).toBe(0);
        });

        it('should multiply by 7 for weeks', function () {
            expect(utils.normalizeToDays(2, 'Week(s)')).toBe(14);
        });

        it('should multiply by 30 for months', function () {
            expect(utils.normalizeToDays(1, 'Month(s)')).toBe(30);
        });

        it('should multiply by 1 for unknown units', function () {
            expect(utils.normalizeToDays(5, 'unknown')).toBe(5);
        });

        it('should return 0 when duration is 0', function () {
            expect(utils.normalizeToDays(0, 'Day(s)')).toBe(0);
        });
    });

    describe('isLoadingDoseOrder', function () {
        it('should return false for null input', function () {
            expect(utils.isLoadingDoseOrder(null)).toBe(false);
            expect(utils.isLoadingDoseOrder(undefined)).toBe(false);
        });

        it('should return false for invalid JSON', function () {
            expect(utils.isLoadingDoseOrder('not-json')).toBe(false);
        });

        it('should return true for FHIR array with isLoadingDose extension', function () {
            var fhirStr = JSON.stringify([{
                extension: [{ url: 'isLoadingDose', valueBoolean: true }]
            }]);
            expect(utils.isLoadingDoseOrder(fhirStr)).toBe(true);
        });

        it('should return false for FHIR array without isLoadingDose extension', function () {
            var fhirStr = JSON.stringify([{
                extension: [{ url: 'isLoadingDose', valueBoolean: false }]
            }]);
            expect(utils.isLoadingDoseOrder(fhirStr)).toBe(false);
        });

        it('should return false for empty FHIR array', function () {
            expect(utils.isLoadingDoseOrder(JSON.stringify([]))).toBe(false);
        });

        it('should return false for FHIR dosage with no extension', function () {
            var fhirStr = JSON.stringify([{ sequence: 1 }]);
            expect(utils.isLoadingDoseOrder(fhirStr)).toBe(false);
        });
    });

    describe('parseFhirDosages', function () {
        it('should return null for null input', function () {
            expect(utils.parseFhirDosages(null)).toBeNull();
        });

        it('should return null for flat JSON object', function () {
            expect(utils.parseFhirDosages(JSON.stringify({ isLoadingDose: false }))).toBeNull();
        });

        it('should return array for valid FHIR array', function () {
            var arr = [{ sequence: 1 }];
            expect(utils.parseFhirDosages(JSON.stringify(arr))).toEqual(arr);
        });
    });

    describe('parseFlatAdminInstructions', function () {
        it('should return empty object for null', function () {
            expect(utils.parseFlatAdminInstructions(null)).toEqual({});
        });

        it('should return empty object for FHIR array', function () {
            expect(utils.parseFlatAdminInstructions(JSON.stringify([{ sequence: 1 }]))).toEqual({});
        });

        it('should return flat object for flat JSON', function () {
            var obj = { instructions: 'As directed', isLoadingDose: false };
            expect(utils.parseFlatAdminInstructions(JSON.stringify(obj))).toEqual(obj);
        });
    });

    describe('buildFhirDosageArray', function () {
        it('should build loading dose with isLoadingDose extension and no timing.repeat', function () {
            var stages = [{ stageName: 'Loading Dose', dose: '5', frequency: 'Once', duration: '1', durationUnit: 'Occurrence(s)', rate: '', additives: '', instructions: '', additionalInstructions: '' }];
            var result = utils.buildFhirDosageArray(stages, 'mg', 'Oral');
            var ext = result[0].extension.find(function (e) { return e.url === 'isLoadingDose'; });
            expect(ext).toBeTruthy();
            expect(ext.valueBoolean).toBe(true);
            expect(result[0].timing.repeat).toBeUndefined();
        });

        it('should add rateQuantity when rate > 0', function () {
            var stages = [{ stageName: '1', dose: '10', frequency: 'Once a day', duration: '3', durationUnit: 'Day(s)', rate: '100', additives: '', instructions: '', additionalInstructions: '', isLoadingDose: false }];
            var result = utils.buildFhirDosageArray(stages, 'ml', 'IV');
            expect(result[0].doseAndRate[0].rateQuantity).toBeDefined();
            expect(result[0].doseAndRate[0].rateQuantity.value).toBe(100);
        });

        it('should not add rateQuantity when rate is 0 or empty', function () {
            var stages = [{ stageName: '1', dose: '10', frequency: 'Once a day', duration: '3', durationUnit: 'Day(s)', rate: '', additives: '', instructions: '', additionalInstructions: '', isLoadingDose: false }];
            var result = utils.buildFhirDosageArray(stages, 'mg', 'Oral');
            expect(result[0].doseAndRate[0].rateQuantity).toBeUndefined();
        });

        it('should add additives extension when present', function () {
            var stages = [{ stageName: '1', dose: '10', frequency: 'Once a day', duration: '3', durationUnit: 'Day(s)', rate: '', additives: 'NS 100ml', instructions: '', additionalInstructions: '', isLoadingDose: false }];
            var result = utils.buildFhirDosageArray(stages, 'mg', 'Oral');
            var ext = result[0].extension.find(function (e) { return e.url === 'additives'; });
            expect(ext).toBeTruthy();
            expect(ext.valueString).toBe('NS 100ml');
        });
    });

    describe('fhirDosageToStage', function () {
        it('should return loading dose duration from constant', function () {
            var dosage = {
                sequence: 1, text: 'Loading Dose',
                timing: { code: { text: 'Once' } },
                route: { text: 'Oral' },
                doseAndRate: [{ type: { text: 'ordered' }, doseQuantity: { value: 5, unit: 'mg' } }],
                additionalInstruction: [], patientInstruction: '',
                extension: [
                    { url: 'isLoadingDose', valueBoolean: true }
                ]
            };
            var result = utils.fhirDosageToStage(dosage);
            expect(result.duration).toBe('1 Occurrence(s)');
            expect(result.durationDays).toBe(0);
            expect(result.isLoadingDose).toBe(true);
        });

        it('should compute duration in Day(s) for regular stage', function () {
            var dosage = {
                sequence: 2, text: 'Stage 1',
                timing: { repeat: { duration: 3, durationUnit: 'd' }, code: { text: 'Once a day' } },
                route: { text: 'Oral' },
                doseAndRate: [{ type: { text: 'ordered' }, doseQuantity: { value: 10, unit: 'mg' } }],
                additionalInstruction: [{ text: 'As directed' }], patientInstruction: '',
                extension: [{ url: 'isLoadingDose', valueBoolean: false }]
            };
            var result = utils.fhirDosageToStage(dosage);
            expect(result.duration).toBe('3 Day(s)');
            expect(result.durationDays).toBe(3);
            expect(result.isLoadingDose).toBe(false);
            expect(result.instructions).toBe('As directed');
        });

        it('should fall back to sequence when text is missing', function () {
            var dosage = {
                sequence: 3,
                timing: { repeat: { duration: 2, durationUnit: 'd' }, code: { text: 'Twice a day' } },
                route: { text: 'Oral' },
                doseAndRate: [{ type: { text: 'ordered' }, doseQuantity: { value: 5, unit: 'mg' } }],
                additionalInstruction: [], patientInstruction: '',
                extension: [{ url: 'isLoadingDose', valueBoolean: false }]
            };
            var result = utils.fhirDosageToStage(dosage);
            expect(result.stageName).toBe('3');
        });
    });
});
