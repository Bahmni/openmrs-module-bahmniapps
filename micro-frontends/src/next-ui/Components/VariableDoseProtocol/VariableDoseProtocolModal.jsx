import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Modal, ComboBox, Toggle, TextInput, TextArea, NumberInput, Checkbox } from "carbon-components-react";
import { Title, Dropdown as BahmniDropdown, DatePickerCarbon } from "bahmni-carbon-ui";
import { FormattedMessage, useIntl } from "react-intl";
import { I18nProvider } from "../i18n/I18nProvider";
import "../../../styles/carbon-conflict-fixes.scss";
import "../../../styles/carbon-theme.scss";
import "./VariableDoseProtocolModal.scss";

const DEBOUNCE_DELAY_MS = 300;

function useDebounce(fn, delay) {
    const timerRef = React.useRef(null);
    React.useEffect(() => {
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
    const [loadingDoseAdditives, setLoadingDoseAdditives] = useState('');
    const [loadingDoseAdditionalInstructions, setLoadingDoseAdditionalInstructions] = useState('');

    const doseUnits = hostData?.doseUnits || [];
    const routes = hostData?.routes || [];
    const dosingRules = hostData?.dosingRules || [];
    const drugFormDefaults = hostData?.drugFormDefaults || {};
    const dosageRuleUnitsMap = hostData?.dosageRuleUnitsMap || {};

    const loadingDoseUnitName = units?.value || 'Units';

    const showRateAndAdditives = dosingRule?.value === 'ml/kg';

    const isNextEnabled = !!(selectedDrug && units && startDate && (!isLoadingDose || loadingDoseValue > 0));
    const isDirty = !!(selectedDrug || dosingRule || units || route || isLoadingDose);

    const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

    const handleClose = () => {
        if (isDirty) {
            setShowCloseConfirmation(true);
        } else {
            hostApi?.onClose();
        }
    };

    const handleConfirmClose = () => {
        hostApi?.onClose();
    };

    const handleCancelClose = () => {
        setShowCloseConfirmation(false);
    };

    const handleSave = () => {
        hostApi?.onSave({
            drug: selectedDrug,
            dosingRule: dosingRule?.value || "",
            units: units?.value || "",
            route: route?.value || "",
            startDate,
            loadingDose: isLoadingDose ? {
                dose: String(loadingDoseValue),
                instructions: loadingDoseInstructions?.value || '',
                rate: String(loadingDoseRate),
                additives: loadingDoseAdditives,
                additionalInstructions: loadingDoseAdditionalInstructions,
            } : null,
        });
    };

    const performSearch = useCallback(
        (term) => {
            if (!term) {
                setSearchResults([]);
                return;
            }
            hostApi?.searchDrugs(term)
                .then((results) => {
                    setSearchResults(results || []);
                })
                .catch(() => {
                    setSearchResults([]);
                });
        },
        [hostApi]
    );

    const debouncedSearch = useDebounce(performSearch, DEBOUNCE_DELAY_MS);

    const handleDrugInputChange = ({ value }) => {
        debouncedSearch(value);
    };

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

    return (
        <>
        <Modal
            open={true}
            className="next-ui variable-dose-modal"
            modalHeading={
                <FormattedMessage
                    id="VARIABLE_DOSE_MODAL_TITLE"
                    defaultMessage="Order Drug - Variable Dose Protocol"
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
                                setLoadingDoseAdditives('');
                                setLoadingDoseAdditionalInstructions('');
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
                                    onChange={(e, dirOrObj, legacyVal) => {
                                        const v = (dirOrObj !== null && typeof dirOrObj === 'object') ? dirOrObj.value : legacyVal;
                                        setLoadingDoseValue(v !== undefined ? v : Number(e?.target?.value || 0));
                                    }}
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
                                    onChange={(e, dirOrObj, legacyVal) => {
                                        const v = (dirOrObj !== null && typeof dirOrObj === 'object') ? dirOrObj.value : legacyVal;
                                        setLoadingDoseRate(v !== undefined ? v : Number(e?.target?.value || 0));
                                    }}
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
