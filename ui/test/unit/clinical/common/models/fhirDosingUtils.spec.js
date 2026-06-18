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

    describe('toVariableDoseModalInitialValues', function () {
        it('should return empty object for null input', function () {
            expect(utils.toVariableDoseModalInitialValues(null)).toEqual({});
        });

        it('should map basic entry fields to initialValues', function () {
            var drug = { name: 'Amoxicillin', uuid: 'drug-1' };
            var entry = {
                drug: drug,
                units: 'mg',
                route: 'Oral',
                startDate: new Date('2024-01-01'),
                stages: [
                    { stageName: 'Stage 1', isLoadingDose: false, dose: '10', frequency: 'Once a day', duration: '5', durationUnit: 'Day(s)', instructions: '', additionalInstructions: '', rate: '', additives: '' },
                    { stageName: 'Stage 2', isLoadingDose: false, dose: '5', frequency: 'Twice a day', duration: '3', durationUnit: 'Day(s)', instructions: '', additionalInstructions: '', rate: '', additives: '' }
                ]
            };
            var result = utils.toVariableDoseModalInitialValues(entry);
            expect(result.drug).toBe(drug);
            expect(result.units).toBe('mg');
            expect(result.route).toBe('Oral');
            expect(result.isLoadingDose).toBe(false);
            expect(result.loadingDose).toBeNull();
            expect(result.stages.length).toBe(2);
            expect(result.stages[0].dose).toBe(10);
            expect(result.stages[0].frequency).toEqual({ label: 'Once a day', value: 'Once a day' });
            expect(result.stages[0].duration).toBe(5);
            expect(result.stages[0].durationUnit).toEqual({ label: 'Day(s)', value: 'Day(s)' });
        });

        it('should extract loading dose stage and map it separately', function () {
            var entry = {
                drug: { name: 'Drug X', uuid: 'x' },
                units: 'ml',
                route: 'IV',
                startDate: null,
                stages: [
                    { stageName: 'Loading Dose', isLoadingDose: true, dose: '20', frequency: 'Once', duration: '1', durationUnit: 'Occurrence(s)', instructions: 'As directed', additionalInstructions: '', rate: '100', additives: 'NS 50ml' },
                    { stageName: 'Stage 1', isLoadingDose: false, dose: '10', frequency: 'Once a day', duration: '7', durationUnit: 'Day(s)', instructions: '', additionalInstructions: '', rate: '', additives: '' }
                ]
            };
            var result = utils.toVariableDoseModalInitialValues(entry);
            expect(result.isLoadingDose).toBe(true);
            expect(result.loadingDose).toBeDefined();
            expect(result.loadingDose.dose).toBe(20);
            expect(result.loadingDose.rate).toBe(100);
            expect(result.loadingDose.additives).toBe('NS 50ml');
            expect(result.stages.length).toBe(1);
        });

        it('should parse combined duration string like "5 Day(s)"', function () {
            var entry = {
                drug: { name: 'Drug Y', uuid: 'y' },
                units: 'mg',
                route: '',
                startDate: null,
                stages: [
                    { stageName: 'Stage 1', isLoadingDose: false, dose: '5', frequency: 'Once', duration: '5 Day(s)', durationUnit: undefined, instructions: '', additionalInstructions: '', rate: '', additives: '' }
                ]
            };
            var result = utils.toVariableDoseModalInitialValues(entry);
            expect(result.stages[0].duration).toBe(5);
            expect(result.stages[0].durationUnit).toEqual({ label: 'Day(s)', value: 'Day(s)' });
        });

        it('should extract units and route from dosingInstructions.quantityUnits and dosingInstructions.route for saved DrugOrderViewModel', function () {
            var entry = {
                drug: { name: 'Morphine', uuid: 'drug-2' },
                dosingInstructions: {
                    quantityUnits: 'Tablet(s)',
                    route: 'Intravenous'
                },
                effectiveStartDate: new Date('2024-03-01'),
                stages: [
                    { stageName: 'Stage 1', isLoadingDose: false, dose: '5', frequency: 'Once a day', duration: '3 Day(s)', durationUnit: undefined, instructions: '', additionalInstructions: '', rate: '', additives: '' }
                ]
            };
            var result = utils.toVariableDoseModalInitialValues(entry);
            expect(result.units).toBe('Tablet(s)');
            expect(result.route).toBe('Intravenous');
        });

        it('should fall back to dosingInstructions.doseUnits when quantityUnits is absent', function () {
            var entry = {
                drug: { name: 'Drug Z', uuid: 'drug-3' },
                dosingInstructions: {
                    doseUnits: 'mg',
                    route: 'Oral'
                },
                stages: []
            };
            var result = utils.toVariableDoseModalInitialValues(entry);
            expect(result.units).toBe('mg');
            expect(result.route).toBe('Oral');
        });

        it('should prefer top-level units and route when dosingInstructions is absent', function () {
            var entry = {
                drug: { name: 'Drug A', uuid: 'drug-4' },
                units: 'ml',
                quantityUnit: 'Capsule(s)',
                route: 'IV',
                stages: []
            };
            var result = utils.toVariableDoseModalInitialValues(entry);
            expect(result.units).toBe('ml');
            expect(result.route).toBe('IV');
        });

        it('should fall back to quantityUnit when top-level units is absent and dosingInstructions is absent', function () {
            var entry = {
                drug: { name: 'Drug B', uuid: 'drug-5' },
                quantityUnit: 'Capsule(s)',
                route: 'Oral',
                stages: []
            };
            var result = utils.toVariableDoseModalInitialValues(entry);
            expect(result.units).toBe('Capsule(s)');
            expect(result.route).toBe('Oral');
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

    describe('extractSelectValue', function () {
        it('should extract value from object with label and value properties', function () {
            var field = { label: 'Once daily', value: 'Once daily' };
            expect(utils.extractSelectValue(field)).toBe('Once daily');
        });

        it('should return string as-is when not an object', function () {
            expect(utils.extractSelectValue('Once daily')).toBe('Once daily');
        });

        it('should return null for null input', function () {
            expect(utils.extractSelectValue(null)).toBeNull();
        });

        it('should return undefined for undefined input', function () {
            expect(utils.extractSelectValue(undefined)).toBeUndefined();
        });

        it('should return object itself if it has no value property', function () {
            var field = { label: 'Once daily' };
            expect(utils.extractSelectValue(field)).toEqual(field);
        });
    });

    describe('buildDosageString', function () {
        it('should return empty string for null stage', function () {
            expect(utils.buildDosageString(null, 'Oral')).toBe('');
            expect(utils.buildDosageString(undefined, 'Oral')).toBe('');
        });

        it('should return empty string for empty stage object', function () {
            expect(utils.buildDosageString({}, 'Oral')).toBe('');
        });

        it('should build dosage string with all fields present', function () {
            var stage = {
                dose: '10',
                unit: 'mg',
                frequency: 'Twice a day',
                instructions: 'Before meals',
                duration: '5',
                durationUnit: 'Day(s)',
                rate: '5',
                additives: 'Saline'
            };
            var result = utils.buildDosageString(stage, 'Oral');
            expect(result).toBe('• 10 mg, Twice a day, Before meals, Oral, 5 Day(s), 5 ml/hr, Saline');
        });

        it('should handle dose with unit', function () {
            var stage = { dose: '100', unit: 'ml' };
            expect(utils.buildDosageString(stage, '')).toBe('• 100 ml');
        });

        it('should handle dose without unit', function () {
            var stage = { dose: '10' };
            expect(utils.buildDosageString(stage, '')).toBe('• 10');
        });

        it('should handle duration with durationUnit', function () {
            var stage = {
                dose: '5',
                unit: 'mg',
                duration: '3',
                durationUnit: 'Day(s)'
            };
            var result = utils.buildDosageString(stage, '');
            expect(result).toBe('• 5 mg, 3 Day(s)');
        });

        it('should handle duration without durationUnit', function () {
            var stage = {
                dose: '5',
                unit: 'mg',
                duration: '3'
            };
            var result = utils.buildDosageString(stage, '');
            expect(result).toBe('• 5 mg, 3');
        });

        it('should include route when provided', function () {
            var stage = {
                dose: '10',
                unit: 'mg',
                frequency: 'Once daily'
            };
            var result = utils.buildDosageString(stage, 'Oral');
            expect(result).toBe('• 10 mg, Once daily, Oral');
        });

        it('should omit route when not provided', function () {
            var stage = {
                dose: '10',
                unit: 'mg',
                frequency: 'Once daily'
            };
            var result = utils.buildDosageString(stage, '');
            expect(result).toBe('• 10 mg, Once daily');
        });

        it('should include rate with ml/hr suffix', function () {
            var stage = {
                dose: '10',
                unit: 'mg',
                rate: '5'
            };
            var result = utils.buildDosageString(stage, '');
            expect(result).toBe('• 10 mg, 5 ml/hr');
        });

        it('should include additives', function () {
            var stage = {
                dose: '10',
                unit: 'mg',
                additives: 'Saline'
            };
            var result = utils.buildDosageString(stage, '');
            expect(result).toBe('• 10 mg, Saline');
        });

        it('should include rate and additives together', function () {
            var stage = {
                dose: '100',
                unit: 'ml',
                rate: '10',
                additives: 'Saline'
            };
            var result = utils.buildDosageString(stage, '');
            expect(result).toBe('• 100 ml, 10 ml/hr, Saline');
        });

        it('should skip optional fields when absent', function () {
            var stage = {
                dose: '5',
                unit: 'mg'
            };
            var result = utils.buildDosageString(stage, '');
            expect(result).toBe('• 5 mg');
        });

        it('should handle object-format frequency (modal format)', function () {
            var stage = {
                dose: '10',
                unit: 'mg',
                frequency: { label: 'Once daily', value: 'Once daily' }
            };
            var result = utils.buildDosageString(stage, '');
            expect(result).toBe('• 10 mg, Once daily');
        });

        it('should handle object-format instructions (modal format)', function () {
            var stage = {
                dose: '10',
                unit: 'mg',
                instructions: { label: 'Before meals', value: 'Before meals' }
            };
            var result = utils.buildDosageString(stage, '');
            expect(result).toBe('• 10 mg, Before meals');
        });

        it('should handle object-format durationUnit (modal format)', function () {
            var stage = {
                dose: '5',
                unit: 'mg',
                duration: '3',
                durationUnit: { label: 'Day(s)', value: 'Day(s)' }
            };
            var result = utils.buildDosageString(stage, '');
            expect(result).toBe('• 5 mg, 3 Day(s)');
        });

        it('should skip zero dose', function () {
            var stage = {
                dose: '0',
                unit: 'mg',
                frequency: 'Once daily'
            };
            var result = utils.buildDosageString(stage, '');
            expect(result).toBe('Once daily');
        });

        it('should skip empty string values', function () {
            var stage = {
                dose: '10',
                unit: 'mg',
                frequency: '',
                instructions: 'Before meals'
            };
            var result = utils.buildDosageString(stage, '');
            expect(result).toBe('• 10 mg, Before meals');
        });
    });
});
