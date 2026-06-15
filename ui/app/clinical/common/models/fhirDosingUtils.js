'use strict';

var FHIR_DOSING_INSTRUCTION_TYPE = 'org.openmrs.module.bahmniemrapi.drugorder.dosinginstructions.FhirDosingInstructions';

var LOADING_DOSE_STAGE_NAME = 'Loading Dose';
var LOADING_DOSE_DURATION_DISPLAY = '1 Occurrence(s)';

var DURATION_UNIT_TO_DAYS = {
    'day': 1, 'days': 1, 'day(s)': 1,
    'week': 7, 'weeks': 7, 'week(s)': 7,
    'month': 30, 'months': 30, 'month(s)': 30,
    'occurrence': 0, 'occurrences': 0, 'occurrence(s)': 0
};

var normalizeToDays = function (duration, durationUnitStr) {
    var d = parseFloat(duration) || 0;
    var unit = (durationUnitStr || '').toLowerCase().trim();
    var multiplier = DURATION_UNIT_TO_DAYS.hasOwnProperty(unit) ? DURATION_UNIT_TO_DAYS[unit] : 1;
    return d * multiplier;
};

var DURATION_UCUM = {
    'day': 'd', 'days': 'd', 'day(s)': 'd',
    'week': 'wk', 'weeks': 'wk', 'week(s)': 'wk',
    'month': 'mo', 'months': 'mo', 'month(s)': 'mo'
};

var toUcumDurationUnit = function (durationUnitStr) {
    return DURATION_UCUM[(durationUnitStr || '').toLowerCase().trim()] || 'd';
};

var fromUcumDurationUnit = function (ucum) {
    var map = { 'd': 'Day(s)', 'wk': 'Week(s)', 'mo': 'Month(s)' };
    return map[ucum] || 'Day(s)';
};

var safeParseJson = function (str) {
    if (!str) { return null; }
    try {
        return JSON.parse(str);
    } catch (e) {
        return null;
    }
};

var isFhirDosageArray = function (parsed) {
    return angular.isArray(parsed);
};

var parseFhirDosages = function (adminInstructionsStr) {
    var parsed = safeParseJson(adminInstructionsStr);
    if (!parsed || !isFhirDosageArray(parsed)) { return null; }
    return parsed;
};

var parseFlatAdminInstructions = function (adminInstructionsStr) {
    var parsed = safeParseJson(adminInstructionsStr);
    if (!parsed || isFhirDosageArray(parsed)) { return {}; }
    return parsed;
};

var isLoadingDoseOrder = function (adminInstructionsStr) {
    var parsed = safeParseJson(adminInstructionsStr);
    if (!parsed || !isFhirDosageArray(parsed)) { return false; }
    var firstDosage = parsed[0];
    if (!firstDosage) { return false; }
    var ext = (firstDosage.extension || []).find(function (e) { return e.url === 'isLoadingDose'; });
    return ext ? ext.valueBoolean === true : false;
};

var buildExtensionMap = function (extensions) {
    return (extensions || []).reduce(function (acc, e) {
        acc[e.url] = e.valueString !== undefined ? e.valueString : e.valueBoolean;
        return acc;
    }, {});
};

var buildFhirDosageArray = function (stages, units, route) {
    return (stages || []).map(function (stage, index) {
        var isLoadingDose = stage.stageName === LOADING_DOSE_STAGE_NAME;
        var extensions = [
            { url: 'isLoadingDose', valueBoolean: isLoadingDose }
        ];
        if (stage.additives) {
            extensions.push({ url: 'additives', valueString: stage.additives });
        }
        var doseAndRate = [{
            type: { text: 'ordered' },
            doseQuantity: { value: parseFloat(stage.dose) || 0, unit: units || '' }
        }];
        var rateValue = parseFloat(stage.rate);
        if (rateValue > 0) {
            doseAndRate[0].rateQuantity = { value: rateValue, unit: 'ml/hr' };
        }
        var timing = { code: { text: stage.frequency || '' } };
        if (!isLoadingDose) {
            timing.repeat = {
                duration: parseFloat(stage.duration) || 1,
                durationUnit: toUcumDurationUnit(stage.durationUnit || 'Days')
            };
        }
        return {
            sequence: index + 1,
            text: stage.stageName,
            timing: timing,
            route: { text: route || '' },
            doseAndRate: doseAndRate,
            additionalInstruction: stage.instructions ? [{ text: stage.instructions }] : [],
            patientInstruction: stage.additionalInstructions || '',
            extension: extensions
        };
    });
};

var fhirDosageToStage = function (dosage) {
    var extMap = buildExtensionMap(dosage.extension);
    var dr = dosage.doseAndRate && dosage.doseAndRate[0];
    var isLoadingDose = extMap.isLoadingDose === true;
    var durationDisplay = isLoadingDose
        ? LOADING_DOSE_DURATION_DISPLAY
        : ((dosage.timing && dosage.timing.repeat)
            ? String(dosage.timing.repeat.duration) + ' ' + fromUcumDurationUnit(dosage.timing.repeat.durationUnit)
            : '');
    var durationDays = isLoadingDose ? 0
        : ((dosage.timing && dosage.timing.repeat)
            ? normalizeToDays(dosage.timing.repeat.duration, fromUcumDurationUnit(dosage.timing.repeat.durationUnit))
            : 0);
    return {
        stageName: dosage.text || String(dosage.sequence || ''),
        sequence: dosage.sequence || 0,
        isLoadingDose: isLoadingDose,
        dose: dr ? String(dr.doseQuantity.value) : '',
        unit: dr ? (dr.doseQuantity.unit || '') : '',
        frequency: (dosage.timing && dosage.timing.code) ? dosage.timing.code.text : '',
        duration: durationDisplay,
        durationDays: durationDays,
        instructions: (dosage.additionalInstruction && dosage.additionalInstruction[0])
            ? dosage.additionalInstruction[0].text : '',
        additionalInstructions: dosage.patientInstruction || '',
        rate: (dr && dr.rateQuantity) ? String(dr.rateQuantity.value) : '',
        additives: extMap.additives || ''
    };
};

var toVariableDoseModalInitialValues = function (entry) {
    if (!entry) { return {}; }

    var toLabelValueObject = function (str) {
        if (!str) { return null; }
        return { label: str, value: str };
    };

    var parseDuration = function (durationRaw, durationUnitRaw) {
        if (durationUnitRaw) {
            return { duration: parseFloat(durationRaw) || 0, durationUnit: durationUnitRaw };
        }
        var str = String(durationRaw || '').trim();
        var match = str.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
        if (match) {
            return { duration: parseFloat(match[1]) || 0, durationUnit: match[2] };
        }
        return { duration: parseFloat(str) || 0, durationUnit: '' };
    };

    var allStages = entry.stages || [];
    var loadingStage = allStages.filter(function (s) { return s.isLoadingDose; })[0] || null;
    var regularStages = allStages.filter(function (s) { return !s.isLoadingDose; });

    var formStages = regularStages.map(function (s) {
        var hasInstructions = !!(s.instructions || s.additionalInstructions || s.rate || s.additives);
        var parsed = parseDuration(s.duration, s.durationUnit);
        return {
            dose: parseFloat(s.dose) || 0,
            frequency: toLabelValueObject(s.frequency),
            duration: parsed.duration,
            durationUnit: toLabelValueObject(parsed.durationUnit),
            instructions: toLabelValueObject(s.instructions),
            additionalInstructions: s.additionalInstructions || '',
            rate: parseFloat(s.rate) || 0,
            additives: s.additives || '',
            showInstructions: hasInstructions
        };
    });

    var units = (entry.dosingInstructions && (entry.dosingInstructions.quantityUnits || entry.dosingInstructions.doseUnits))
        || entry.units || entry.quantityUnit || entry.totalDosageUnits || '';

    var route = (entry.dosingInstructions && entry.dosingInstructions.route)
        || entry.route || '';

    return {
        drug: entry.drug || null,
        units: units,
        route: route,
        startDate: entry.startDate || null,
        isLoadingDose: !!loadingStage,
        loadingDose: loadingStage ? {
            dose: parseFloat(loadingStage.dose) || 0,
            instructions: toLabelValueObject(loadingStage.instructions),
            rate: parseFloat(loadingStage.rate) || 0,
            additives: loadingStage.additives || '',
            additionalInstructions: loadingStage.additionalInstructions || ''
        } : null,
        stages: formStages
    };
};

Bahmni.Clinical.FhirDosingUtils = {
    FHIR_DOSING_INSTRUCTION_TYPE: FHIR_DOSING_INSTRUCTION_TYPE,
    LOADING_DOSE_STAGE_NAME: LOADING_DOSE_STAGE_NAME,
    normalizeToDays: normalizeToDays,
    toUcumDurationUnit: toUcumDurationUnit,
    fromUcumDurationUnit: fromUcumDurationUnit,
    parseFhirDosages: parseFhirDosages,
    parseFlatAdminInstructions: parseFlatAdminInstructions,
    isLoadingDoseOrder: isLoadingDoseOrder,
    buildFhirDosageArray: buildFhirDosageArray,
    fhirDosageToStage: fhirDosageToStage,
    toVariableDoseModalInitialValues: toVariableDoseModalInitialValues
};
