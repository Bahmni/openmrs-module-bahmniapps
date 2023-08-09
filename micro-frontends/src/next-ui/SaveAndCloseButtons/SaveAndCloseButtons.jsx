import React from "react";
import propTypes from "prop-types";
import {Button} from "carbon-components-react";
import "../../styles/carbon-conflict-fixes.scss";
import "../../styles/carbon-theme.scss";
import "../../styles/common.scss";
import { FormattedMessage } from "react-intl";

export const SaveAndCloseButtons = (props) => {
    const { onSave, onClose, isSaveDisabled } = props;
    return (
        <div className="footer">
            <span>
                <Button kind="secondary" data-testid="cancel" onClick={onClose}>
                    <span><FormattedMessage id={'APPOINTMENT_CREATE_CANCEL'} defaultMessage={'Cancel'}/></span>
                </Button>
            </span>
            <span>
                <Button kind="primary" onClick={onSave} data-testid="check-and-save" disabled={isSaveDisabled}>
                        <span>
                        <FormattedMessage id={'SAVE'} defaultMessage={'Save'}/>
                    </span>
                </Button>
            </span>
        </div>
    );
}

SaveAndCloseButtons.propTypes = {
    onSave: propTypes.func.isRequired,
    onClose: propTypes.func.isRequired,
    isSaveDisabled: propTypes.bool.isRequired,
}
export default SaveAndCloseButtons;