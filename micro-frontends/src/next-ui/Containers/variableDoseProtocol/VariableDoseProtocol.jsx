import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "carbon-components-react";
import { Add16 } from "@carbon/icons-react";
import { FormattedMessage } from "react-intl";
import { I18nProvider } from "../../Components/i18n/I18nProvider";
import { VariableDoseProtocolModalInner } from "../../Components/VariableDoseProtocol/VariableDoseProtocolModal";

function VariableDoseProtocolInner({ hostData, hostApi }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleClose = () => {
        setIsOpen(false);
        hostApi?.onClose?.();
    };

    const handleSave = (data) => {
        setIsOpen(false);
        hostApi?.onSave?.(data);
    };

    const augmentedHostApi = { ...hostApi, onClose: handleClose, onSave: handleSave };

    return (
        <>
            <Button
                kind="tertiary"
                size="md"
                renderIcon={Add16}
                onClick={() => setIsOpen(true)}
                className="variable-dose-trigger-btn"
                style={{ width: "98%", fontSize: "1.2rem", lineHeight: "1em" }}
            >
                <FormattedMessage
                    id="VARIABLE_DOSE_PROTOCOL_BUTTON_LABEL"
                    defaultMessage="Variable Dose Protocol"
                />
            </Button>
            {isOpen && (
                <VariableDoseProtocolModalInner
                    hostData={hostData}
                    hostApi={augmentedHostApi}
                />
            )}
        </>
    );
}

export function VariableDoseProtocol(props) {
    return (
        <div className="next-ui">
            <I18nProvider>
                <VariableDoseProtocolInner {...props} />
            </I18nProvider>
        </div>
    );
}

VariableDoseProtocol.propTypes = {
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
