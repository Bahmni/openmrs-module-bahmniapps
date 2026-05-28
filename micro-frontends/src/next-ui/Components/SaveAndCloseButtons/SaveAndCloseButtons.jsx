/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import React from "react";
import propTypes from "prop-types";
import {Button} from "carbon-components-react";
import "../../../styles/carbon-conflict-fixes.scss";
import "../../../styles/carbon-theme.scss";
import "../../../styles/common.scss";
import { FormattedMessage } from "react-intl";

export const SaveAndCloseButtons = (props) => {
    const { onSave, onClose, isSaveDisabled, primaryButtonText= <FormattedMessage id={'SAVE'} defaultMessage={'Save'}/> } = props;
    return (
        <div className="footer">
            <Button kind="secondary" data-testid="cancel" onClick={onClose}>
                <span><FormattedMessage id={'CANCEL'} defaultMessage={'Cancel'}/></span>
            </Button>
            <Button kind="primary" onClick={onSave} disabled={isSaveDisabled}>
                { primaryButtonText }
            </Button>
        </div>
    );
}

SaveAndCloseButtons.propTypes = {
    onSave: propTypes.func.isRequired,
    onClose: propTypes.func.isRequired,
    isSaveDisabled: propTypes.bool.isRequired,
    primaryButtonText: propTypes.string
}
export default SaveAndCloseButtons;
