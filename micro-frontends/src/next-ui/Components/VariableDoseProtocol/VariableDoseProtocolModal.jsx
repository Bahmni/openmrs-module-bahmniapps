import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { Modal, ComboBox, Checkbox } from "carbon-components-react";
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

    const [selectedDrug, setSelectedDrug] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [dosingRule, setDosingRule] = useState(null);
    const [units, setUnits] = useState(null);
    const [isUnitsAutoPopulated, setIsUnitsAutoPopulated] = useState(false);
    const [route, setRoute] = useState(null);
    const [startDate, setStartDate] = useState(new Date());

    const doseUnits = hostData?.doseUnits || [];
    const routes = hostData?.routes || [];
    const dosingRules = hostData?.dosingRules || [];
    const drugFormDefaults = hostData?.drugFormDefaults || {};
    const dosageRuleUnitsMap = hostData?.dosageRuleUnitsMap || {};

    const isNextEnabled = !!(selectedDrug && units && startDate);
    const isDirty = !!(selectedDrug || dosingRule || units || route);

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
                        disabled={!selectedDrug}
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

export function VariableDoseProtocolModal(props) {
    return (
        <I18nProvider>
            <VariableDoseProtocolModalInner {...props} />
        </I18nProvider>
    );
}

VariableDoseProtocolModal.propTypes = {
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
    }),
    hostApi: PropTypes.shape({
        onClose: PropTypes.func,
        onSave: PropTypes.func,
        searchDrugs: PropTypes.func,
    }),
};
