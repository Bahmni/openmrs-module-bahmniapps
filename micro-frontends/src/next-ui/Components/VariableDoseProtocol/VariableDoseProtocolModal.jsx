import React, { useState, useCallback, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, ComboBox, Toggle, TextInput, TextArea, NumberInput, Checkbox, Button } from "carbon-components-react";
import { TrashCan16, Add16 } from "@carbon/icons-react";
import { Title, Dropdown as BahmniDropdown, DatePickerCarbon } from "bahmni-carbon-ui";
import { FormattedMessage, useIntl } from "react-intl";
import { I18nProvider } from "../i18n/I18nProvider";
import "../../../styles/carbon-conflict-fixes.scss";
import "../../../styles/carbon-theme.scss";
import "./VariableDoseProtocolModal.scss";

const DEBOUNCE_DELAY_MS = 300;

const normalizeToDays = (duration, durationUnitStr) => {
    const d = parseFloat(duration) || 0;
    const unit = (durationUnitStr || "").toLowerCase().trim();
    if (unit.includes("week")) return d * 7;
    if (unit.includes("month")) return d * 30;
    return d;
};

const defaultStage = () => ({
    dose: 0,
    frequency: null,
    duration: 0,
    durationUnit: null,
    instructions: null,
    additionalInstructions: "",
    rate: 0,
    additives: "",
    showInstructions: false,
});

function useDebounce(fn, delay) {
    const timerRef = useRef(null);
    useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);
    return useCallback(
        (...args) => {
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => fn(...args), delay);
        },
        [fn, delay]
    );
}

export function VariableDoseProtocolModalInner({ hostData, hostApi }) {
    const intl = useIntl();

    const initialValues = hostData?.initialValues || {};

    const [selectedDrug, setSelectedDrug] = useState(initialValues.drug || null);
    const [searchResults, setSearchResults] = useState(
        initialValues.drug ? [initialValues.drug] : []
    );
    const [dosingRule, setDosingRule] = useState(null);
    const [units, setUnits] = useState(
        initialValues.units ? { label: initialValues.units, value: initialValues.units } : null
    );
    const [isUnitsAutoPopulated, setIsUnitsAutoPopulated] = useState(false);
    const [route, setRoute] = useState(
        initialValues.route ? { label: initialValues.route, value: initialValues.route } : null
    );
    const [startDate, setStartDate] = useState(
        initialValues.startDate ? new Date(initialValues.startDate) : new Date()
    );

    const [isLoadingDose, setIsLoadingDose] = useState(false);
    const [loadingDoseValue, setLoadingDoseValue] = useState(0);
    const [loadingDoseInstructions, setLoadingDoseInstructions] = useState(null);
    const [loadingDoseRate, setLoadingDoseRate] = useState(0);
    const [loadingDoseAdditives, setLoadingDoseAdditives] = useState("");
    const [loadingDoseAdditionalInstructions, setLoadingDoseAdditionalInstructions] = useState("");

    const [stages, setStages] = useState(
        initialValues.stages && initialValues.stages.length >= 2
            ? initialValues.stages
            : [defaultStage()]
    );

    const stagesFooterRef = useRef(null);
    const prevStagesLengthRef = useRef(stages.length);

    useEffect(() => {
        if (stages.length > prevStagesLengthRef.current && stagesFooterRef.current) {
            stagesFooterRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        prevStagesLengthRef.current = stages.length;
    }, [stages.length]);

    const doseUnits = hostData?.doseUnits || [];
    const routes = hostData?.routes || [];
    const dosingRules = hostData?.dosingRules || [];
    const drugFormDefaults = hostData?.drugFormDefaults || {};
    const dosageRuleUnitsMap = hostData?.dosageRuleUnitsMap || {};
    const frequencies = hostData?.frequencies || [];
    const durationUnits = hostData?.durationUnits || [];

    const loadingDoseUnitName = units?.value || "Units";
    const showRateAndAdditives = dosingRule?.value === "ml/kg";

    const isStageValid = (s) =>
        s.dose > 0 && s.frequency !== null && s.duration > 0 && s.durationUnit !== null;

    const isNextEnabled = !!(
        selectedDrug &&
        units &&
        startDate &&
        (!isLoadingDose || loadingDoseValue > 0) &&
        (isLoadingDose ? 1 : 0) + stages.length >= 2 &&
        stages.every(isStageValid)
    );

    const isDirty = !!(selectedDrug || dosingRule || units || route || isLoadingDose || stages.some(isStageValid));

    const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

    const handleClose = () => {
        if (isDirty) {
            setShowCloseConfirmation(true);
        } else {
            hostApi?.onClose();
        }
    };

    const handleConfirmClose = () => hostApi?.onClose();
    const handleCancelClose = () => setShowCloseConfirmation(false);

    const totalDuration = stages.reduce(
        (sum, s) => sum + normalizeToDays(s.duration, s.durationUnit?.value),
        0
    );
    const totalDosage = stages.reduce(
        (sum, s) => {
            const freq = frequencies.find((f) => f.name === s.frequency?.value);
            const freqPerDay = freq?.frequencyPerDay || 1;
            return sum + (parseFloat(s.dose) || 0) * freqPerDay * normalizeToDays(s.duration, s.durationUnit?.value);
        },
        isLoadingDose && loadingDoseValue > 0 ? parseFloat(loadingDoseValue) : 0
    );

    const handleSave = () => {
        hostApi?.onSave({
            drug: selectedDrug,
            dosingRule: dosingRule?.value || "",
            units: units?.value || "",
            route: route?.value || "",
            startDate,
            loadingDose: isLoadingDose ? {
                dose: String(loadingDoseValue),
                instructions: loadingDoseInstructions?.value || "",
                rate: loadingDoseRate > 0 ? String(loadingDoseRate) : "",
                additives: loadingDoseAdditives,
                additionalInstructions: loadingDoseAdditionalInstructions,
            } : null,
            stages: stages.map((s, i) => ({
                stageName: 'Stage ' + String(i + 1),
                dose: String(s.dose),
                unit: units?.value || "",
                frequency: s.frequency?.label || "",
                frequencyValue: s.frequency?.value || "",
                duration: String(s.duration),
                durationUnit: s.durationUnit?.value || "",
                instructions: s.instructions?.value || "",
                additionalInstructions: s.additionalInstructions,
                rate: s.rate > 0 ? String(s.rate) : "",
                additives: s.additives || "",
            })),
        });
    };

    const updateStage = (index, field, value) => {
        setStages((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
    };

    const addStage = (e) => {
        e.currentTarget.blur();
        setStages((prev) => [...prev, defaultStage()]);
    };
    const removeStage = (index) => setStages((prev) => prev.filter((_, i) => i !== index));

    const performSearch = useCallback(
        (term) => {
            if (!term) { setSearchResults([]); return; }
            hostApi?.searchDrugs(term)
                .then((results) => setSearchResults(results || []))
                .catch(() => setSearchResults([]));
        },
        [hostApi]
    );

    const debouncedSearch = useDebounce(performSearch, DEBOUNCE_DELAY_MS);
    const handleDrugInputChange = ({ value }) => debouncedSearch(value);

    const handleDrugChange = ({ selectedItem }) => {
        setSelectedDrug(selectedItem || null);
        if (!selectedItem) return;
        const dosageForm = selectedItem.dosageForm?.display;
        const defaults = dosageForm ? drugFormDefaults[dosageForm] : null;
        if (!defaults) return;
        if (defaults.doseUnits && doseUnits.some((u) => u.name === defaults.doseUnits)) {
            setUnits({ label: defaults.doseUnits, value: defaults.doseUnits });
        }
        if (defaults.route && routes.some((r) => r.name === defaults.route)) {
            setRoute({ label: defaults.route, value: defaults.route });
        }
    };

    const DRUG_NAME_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_DRUG_NAME_LABEL", defaultMessage: "Drug Name" });
    const DRUG_NAME_PLACEHOLDER = intl.formatMessage({ id: "VARIABLE_DOSE_DRUG_NAME_PLACEHOLDER", defaultMessage: "Type to Search a Drug" });
    const DOSAGE_RULE_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_DOSAGE_RULE_LABEL", defaultMessage: "Dosage Rule" });
    const SELECT_DOSAGE_RULE = intl.formatMessage({ id: "VARIABLE_DOSE_SELECT_DOSAGE_RULE", defaultMessage: "Select Dosage Rule" });
    const UNITS_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_UNITS_LABEL", defaultMessage: "Units" });
    const SELECT_UNIT = intl.formatMessage({ id: "VARIABLE_DOSE_SELECT_UNIT", defaultMessage: "Select Unit" });
    const START_DATE_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_START_DATE_LABEL", defaultMessage: "Start Date" });
    const ROUTE_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_ROUTE_LABEL", defaultMessage: "Route" });
    const SELECT_ROUTE = intl.formatMessage({ id: "VARIABLE_DOSE_SELECT_ROUTE", defaultMessage: "Select Route" });
    const PROTOCOL_HEADING = intl.formatMessage({ id: "VARIABLE_DOSE_PROTOCOL_HEADING", defaultMessage: "Protocol" });
    const ADD_LOADING_DOSE_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_ADD_LOADING_DOSE", defaultMessage: "Add Loading Dose" });
    const LOADING_DOSE_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_LOADING_DOSE_LABEL", defaultMessage: "Loading Dose" });
    const LOADING_DOSE_INSTRUCTIONS_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_LOADING_DOSE_INSTRUCTIONS", defaultMessage: "Instructions" });
    const LOADING_DOSE_SELECT_INSTRUCTIONS = intl.formatMessage({ id: "VARIABLE_DOSE_SELECT_INSTRUCTIONS", defaultMessage: "Select Instructions" });
    const LOADING_DOSE_RATE_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_LOADING_DOSE_RATE", defaultMessage: "Rate (ml/hr)" });
    const LOADING_DOSE_ADDITIVES_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_LOADING_DOSE_ADDITIVES", defaultMessage: "Additives" });
    const LOADING_DOSE_ADDITIONAL_INSTRUCTIONS_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_LOADING_DOSE_ADDITIONAL_INSTRUCTIONS", defaultMessage: "Additional Instructions" });

    const STAGE_DOSE_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_STAGE_DOSE_LABEL", defaultMessage: "Dosage" });
    const DELETE_STAGE_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_DELETE_STAGE", defaultMessage: "Delete Stage" });
    const STAGE_FREQUENCY_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_STAGE_FREQUENCY_LABEL", defaultMessage: "Frequency" });
    const STAGE_DURATION_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_STAGE_DURATION_LABEL", defaultMessage: "Duration" });
    const STAGE_DURATION_UNIT_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_STAGE_DURATION_UNIT_LABEL", defaultMessage: "Units" });
    const STAGE_SELECT_FREQUENCY = intl.formatMessage({ id: "VARIABLE_DOSE_STAGE_SELECT_FREQUENCY", defaultMessage: "Select an option" });
    const STAGE_SELECT_DURATION_UNIT = intl.formatMessage({ id: "VARIABLE_DOSE_STAGE_SELECT_DURATION_UNIT", defaultMessage: "Select" });
    const STAGE_INSTRUCTIONS_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_STAGE_INSTRUCTIONS_LABEL", defaultMessage: "Instructions" });
    const STAGE_RATE_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_STAGE_RATE_LABEL", defaultMessage: "Rate (ml/hr)" });
    const STAGE_ADDITIVES_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_STAGE_ADDITIVES_LABEL", defaultMessage: "Additives" });
    const STAGE_ADDITIONAL_INSTRUCTIONS_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_STAGE_ADDITIONAL_INSTRUCTIONS_LABEL", defaultMessage: "Additional Instructions" });
    const ADD_INSTRUCTIONS = intl.formatMessage({ id: "VARIABLE_DOSE_ADD_INSTRUCTIONS", defaultMessage: "Add Instructions" });
    const REMOVE_INSTRUCTIONS = intl.formatMessage({ id: "VARIABLE_DOSE_REMOVE_INSTRUCTIONS", defaultMessage: "Remove Instructions" });
    const ADD_STAGE_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_ADD_STAGE", defaultMessage: "Add Stage" });
    const TOTAL_DOSAGE_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_TOTAL_DOSAGE_LABEL", defaultMessage: "Total Dosage" });
    const TOTAL_DURATION_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_TOTAL_DURATION_LABEL", defaultMessage: "Total Duration" });
    const DAYS_LABEL = intl.formatMessage({ id: "VARIABLE_DOSE_DAYS", defaultMessage: "Day(s)" });

    const toNum = (v, fallback) => {
        const n = parseFloat(v);
        return isNaN(n) ? fallback : n;
    };

    const numberInputHandler = (setter) => (e, dirOrObj, legacyVal) => {
        const v = (dirOrObj !== null && typeof dirOrObj === "object") ? dirOrObj.value : legacyVal;
        setter(toNum(v !== undefined ? v : e?.target?.value, 0));
    };

    const stageNumberInputHandler = (index, field) => (e, dirOrObj, legacyVal) => {
        const v = (dirOrObj !== null && typeof dirOrObj === "object") ? dirOrObj.value : legacyVal;
        updateStage(index, field, toNum(v !== undefined ? v : e?.target?.value, 0));
    };

    return (
        <>
            <Modal
                open={true}
                className="next-ui variable-dose-modal"
                modalHeading={
                    <FormattedMessage
                        id="VARIABLE_DOSE_MODAL_TITLE"
                        defaultMessage="Order Drug - Variable Dosage Protocol"
                    />
                }
                primaryButtonText={
                    <FormattedMessage id="VARIABLE_DOSE_SAVE_BUTTON" defaultMessage="Save" />
                }
                secondaryButtonText={
                    <FormattedMessage id="VARIABLE_DOSE_CANCEL_BUTTON" defaultMessage="Cancel" />
                }
                primaryButtonDisabled={!isNextEnabled}
                onRequestClose={handleClose}
                onSecondarySubmit={handleClose}
                onRequestSubmit={handleSave}
                selectorPrimaryFocus="#variable-dose-drug-name"
                size="lg"
            >
                <div className="variable-dose-form-grid">
                    <ComboBox
                        id="variable-dose-drug-name"
                        titleText={<Title text={DRUG_NAME_LABEL} isRequired={true} />}
                        placeholder={DRUG_NAME_PLACEHOLDER}
                        items={searchResults}
                        itemToString={(item) => (item ? item.name || "" : "")}
                        filterItems={(items) => items}
                        onInputChange={(value) => handleDrugInputChange({ value })}
                        onChange={handleDrugChange}
                        selectedItem={selectedDrug}
                    />
                    <div className="variable-dose-accept-wrapper">
                        <Checkbox
                            id="variable-dose-accept"
                            labelText={
                                <FormattedMessage
                                    id="VARIABLE_DOSE_ACCEPT_LABEL"
                                    defaultMessage="Accept"
                                />
                            }
                            disabled={true}
                        />
                    </div>
                </div>

                <div className="variable-dose-form-grid">
                    {dosingRules.length > 0 ? (
                        <div onInput={(e) => {
                            if (e.target.value === "") {
                                setDosingRule(null);
                                setUnits(null);
                                setIsUnitsAutoPopulated(false);
                            }
                        }}>
                            <BahmniDropdown
                                id="variable-dose-dosing-rule"
                                titleText={DOSAGE_RULE_LABEL}
                                placeholder={SELECT_DOSAGE_RULE}
                                options={dosingRules.map((rule) => ({ label: rule, value: rule }))}
                                selectedValue={dosingRule}
                                onChange={(selectedItem) => {
                                    const rule = selectedItem || null;
                                    setDosingRule(rule);
                                    if (!rule) {
                                        setUnits(null);
                                        setIsUnitsAutoPopulated(false);
                                        return;
                                    }
                                    const ruleUnits = dosageRuleUnitsMap[rule.value || ""];
                                    if (ruleUnits && ruleUnits.length === 1) {
                                        setUnits({ label: ruleUnits[0], value: ruleUnits[0] });
                                        setIsUnitsAutoPopulated(true);
                                    } else {
                                        setIsUnitsAutoPopulated(false);
                                    }
                                }}
                                width="100%"
                            />
                        </div>
                    ) : (
                        <div />
                    )}

                    <BahmniDropdown
                        id="variable-dose-units"
                        titleText={UNITS_LABEL}
                        isRequired={true}
                        isDisabled={isUnitsAutoPopulated}
                        placeholder={SELECT_UNIT}
                        options={doseUnits.map((u) => ({ label: u.name, value: u.name }))}
                        selectedValue={units}
                        onChange={(selectedItem) => setUnits(selectedItem || null)}
                        width="100%"
                    />
                </div>

                <div className="variable-dose-form-grid">
                    <DatePickerCarbon
                        id="variable-dose-start-date"
                        title={START_DATE_LABEL}
                        isRequired={true}
                        placeholder="DD MMM YYYY"
                        dateFormat="d M Y"
                        value={startDate}
                        onChange={(dates) => {
                            if (dates.length === 1) setStartDate(dates[0]);
                        }}
                        width="100%"
                    />

                    <BahmniDropdown
                        id="variable-dose-route"
                        titleText={ROUTE_LABEL}
                        placeholder={SELECT_ROUTE}
                        options={routes.map((r) => ({ label: r.name, value: r.name }))}
                        selectedValue={route}
                        onChange={(selectedItem) => setRoute(selectedItem || null)}
                        width="100%"
                    />
                </div>

                <div className="vdp-protocol-section">
                    <h4 className="vdp-protocol-heading">{PROTOCOL_HEADING}</h4>
                    <div className="vdp-loading-dose-toggle-row">
                        <Toggle
                            id="loading-dose-toggle"
                            size="sm"
                            labelText=""
                            labelA=""
                            labelB=""
                            toggled={isLoadingDose}
                            onToggle={(checked) => {
                                setIsLoadingDose(checked);
                                if (!checked) {
                                    setLoadingDoseValue(0);
                                    setLoadingDoseInstructions(null);
                                    setLoadingDoseRate(0);
                                    setLoadingDoseAdditives("");
                                    setLoadingDoseAdditionalInstructions("");
                                }
                            }}
                        />
                        <span className="vdp-loading-dose-toggle-label">{ADD_LOADING_DOSE_LABEL}</span>
                    </div>
                    {isLoadingDose && (
                        <div className="vdp-loading-dose-fields">
                            <div className="vdp-loading-dose-dose-row">
                                <div className="vdp-loading-dose-stepper">
                                    <NumberInput
                                        id="loading-dose-dose"
                                        label={<Title text={LOADING_DOSE_LABEL} isRequired={true} />}
                                        value={loadingDoseValue}
                                        min={0}
                                        step={0.5}
                                        onChange={numberInputHandler(setLoadingDoseValue)}
                                    />
                                </div>
                                <div className="vdp-loading-dose-unit">
                                    <BahmniDropdown
                                        id="loading-dose-unit"
                                        titleText=""
                                        options={[{ label: loadingDoseUnitName, value: loadingDoseUnitName }]}
                                        selectedValue={{ label: loadingDoseUnitName, value: loadingDoseUnitName }}
                                        isDisabled={true}
                                        width="100%"
                                    />
                                </div>
                            </div>
                            <div className="vdp-loading-dose-details-row">
                                <BahmniDropdown
                                    id="loading-dose-instructions"
                                    titleText={LOADING_DOSE_INSTRUCTIONS_LABEL}
                                    placeholder={LOADING_DOSE_SELECT_INSTRUCTIONS}
                                    options={(hostData?.dosingInstructions || []).map((instruction) => ({ label: instruction.name, value: instruction.name }))}
                                    selectedValue={loadingDoseInstructions}
                                    onChange={(item) => setLoadingDoseInstructions(item || null)}
                                    width="100%"
                                />
                                {showRateAndAdditives && (
                                    <NumberInput
                                        id="loading-dose-rate"
                                        label={LOADING_DOSE_RATE_LABEL}
                                        value={loadingDoseRate}
                                        min={0}
                                        onChange={numberInputHandler(setLoadingDoseRate)}
                                    />
                                )}
                                {showRateAndAdditives && (
                                    <TextInput
                                        id="loading-dose-additives"
                                        labelText={LOADING_DOSE_ADDITIVES_LABEL}
                                        placeholder="Input Text"
                                        value={loadingDoseAdditives}
                                        onChange={(e) => setLoadingDoseAdditives(e.target.value)}
                                    />
                                )}
                            </div>
                            <TextArea
                                id="loading-dose-additional-instructions"
                                labelText={LOADING_DOSE_ADDITIONAL_INSTRUCTIONS_LABEL}
                                value={loadingDoseAdditionalInstructions}
                                onChange={(e) => setLoadingDoseAdditionalInstructions(e.target.value)}
                                rows={2}
                            />
                        </div>
                    )}

                    {stages.map((stage, index) => {
                        return (
                            <div
                                key={index}
                                className="vdp-stage-card"
                            >
                                <div className="vdp-stage-header-row">
                                    <h5 className="vdp-stage-heading">Stage {index + 1}</h5>
                                    <Button
                                        kind="ghost"
                                        size="sm"
                                        className="vdp-stage-delete-btn"
                                        aria-label={DELETE_STAGE_LABEL}
                                        onClick={() => removeStage(index)}
                                    >
                                        <TrashCan16 />
                                    </Button>
                                </div>
                                <div className="vdp-stage-main-row">
                                    <div className="vdp-stage-dose-group">
                                        <NumberInput
                                            id={`stage-dose-${index}`}
                                            label={STAGE_DOSE_LABEL}
                                            value={stage.dose}
                                            min={0}
                                            step={0.5}
                                            onChange={stageNumberInputHandler(index, "dose")}
                                        />
                                    </div>
                                    <div className="vdp-stage-frequency-group">
                                        <BahmniDropdown
                                            id={`stage-frequency-${index}`}
                                            titleText={STAGE_FREQUENCY_LABEL}
                                            placeholder={STAGE_SELECT_FREQUENCY}
                                            options={frequencies.map((f) => ({ label: f.name, value: f.name }))}
                                            selectedValue={stage.frequency}
                                            onChange={(item) => updateStage(index, "frequency", item || null)}
                                            width="100%"
                                        />
                                    </div>
                                    <div className="vdp-stage-duration-group">
                                        <NumberInput
                                            id={`stage-duration-${index}`}
                                            label={STAGE_DURATION_LABEL}
                                            value={stage.duration}
                                            min={0}
                                            onChange={stageNumberInputHandler(index, "duration")}
                                        />
                                    </div>
                                    <div className="vdp-stage-duration-unit-group">
                                        <BahmniDropdown
                                            id={`stage-duration-unit-${index}`}
                                            titleText={STAGE_DURATION_UNIT_LABEL}
                                            placeholder={STAGE_SELECT_DURATION_UNIT}
                                            options={durationUnits.map((u) => ({ label: u.name, value: u.name }))}
                                            selectedValue={stage.durationUnit}
                                            onChange={(item) => updateStage(index, "durationUnit", item || null)}
                                            width="100%"
                                        />
                                    </div>
                                </div>

                                {stage.showInstructions ? (
                                    <>
                                        <div className="vdp-stage-instructions-row">
                                            <BahmniDropdown
                                                id={`stage-instructions-${index}`}
                                                titleText={STAGE_INSTRUCTIONS_LABEL}
                                                placeholder={STAGE_SELECT_FREQUENCY}
                                                options={(hostData?.dosingInstructions || []).map((inst) => ({ label: inst.name, value: inst.name }))}
                                                selectedValue={stage.instructions}
                                                onChange={(item) => updateStage(index, "instructions", item || null)}
                                                width="100%"
                                            />
                                            {showRateAndAdditives && (
                                                <NumberInput
                                                    id={`stage-rate-${index}`}
                                                    label={STAGE_RATE_LABEL}
                                                    value={stage.rate}
                                                    min={0}
                                                    onChange={stageNumberInputHandler(index, "rate")}
                                                />
                                            )}
                                            {showRateAndAdditives && (
                                                <div className="vdp-stage-additives">
                                                    <TextInput
                                                        id={`stage-additives-${index}`}
                                                        labelText={STAGE_ADDITIVES_LABEL}
                                                        placeholder="Input Text"
                                                        value={stage.additives}
                                                        onChange={(e) => updateStage(index, "additives", e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <TextArea
                                            id={`stage-additional-instructions-${index}`}
                                            labelText={STAGE_ADDITIONAL_INSTRUCTIONS_LABEL}
                                            value={stage.additionalInstructions}
                                            onChange={(e) => updateStage(index, "additionalInstructions", e.target.value)}
                                            rows={2}
                                        />
                                        <Button
                                            kind="ghost"
                                            size="sm"
                                            className="vdp-toggle-instructions-btn"
                                            onClick={() => updateStage(index, "showInstructions", false)}
                                        >
                                            {REMOVE_INSTRUCTIONS}
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        kind="ghost"
                                        size="sm"
                                        className="vdp-toggle-instructions-btn"
                                        onClick={() => updateStage(index, "showInstructions", true)}
                                    >
                                        {ADD_INSTRUCTIONS}
                                    </Button>
                                )}
                            </div>
                        );
                    })}

                    <div className="vdp-stages-footer" ref={stagesFooterRef}>
                        <Button
                            kind="tertiary"
                            size="sm"
                            renderIcon={Add16}
                            className="vdp-add-stage-btn"
                            onClick={addStage}
                        >
                            {ADD_STAGE_LABEL}
                        </Button>
                        <span className="vdp-totals">
                            {!dosingRule && <>{TOTAL_DOSAGE_LABEL}: {totalDosage.toFixed(1)} {units?.value || ""} | </>}{TOTAL_DURATION_LABEL}: {totalDuration} {DAYS_LABEL}
                        </span>
                    </div>
                </div>
            </Modal>
            <Modal
                open={showCloseConfirmation}
                className="next-ui variable-dose-close-confirmation"
                style={{ zIndex: 10000 }}
                danger
                preventCloseOnClickOutside={true}
                modalHeading={
                    <FormattedMessage
                        id="VARIABLE_DOSE_CLOSE_CONFIRM_MESSAGE"
                        defaultMessage="You will lose the details entered. Do you want to continue?"
                    />
                }
                primaryButtonText={
                    <FormattedMessage id="VARIABLE_DOSE_CLOSE_CONFIRM_NO" defaultMessage="No" />
                }
                secondaryButtonText={
                    <FormattedMessage id="VARIABLE_DOSE_CLOSE_CONFIRM_YES" defaultMessage="Yes" />
                }
                onRequestClose={handleCancelClose}
                onRequestSubmit={handleCancelClose}
                onSecondarySubmit={handleConfirmClose}
            />
        </>
    );
}

VariableDoseProtocolModalInner.propTypes = {
    hostData: PropTypes.shape({
        doseUnits: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
        routes: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
        dosingRules: PropTypes.arrayOf(PropTypes.string),
        dosageRuleUnitsMap: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
        drugFormDefaults: PropTypes.objectOf(
            PropTypes.shape({
                doseUnits: PropTypes.string,
                route: PropTypes.string,
            })
        ),
        dosingInstructions: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
        frequencies: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
        durationUnits: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string })),
    }),
    hostApi: PropTypes.shape({
        onClose: PropTypes.func,
        onSave: PropTypes.func,
        searchDrugs: PropTypes.func,
    }),
};

export function VariableDoseProtocolModal(props) {
    return (
        <I18nProvider>
            <VariableDoseProtocolModalInner {...props} />
        </I18nProvider>
    );
}

VariableDoseProtocolModal.propTypes = VariableDoseProtocolModalInner.propTypes;
