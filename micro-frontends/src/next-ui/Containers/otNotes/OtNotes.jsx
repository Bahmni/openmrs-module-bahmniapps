/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


import React from "react";
import PropTypes from "prop-types";
import {I18nProvider} from "../../Components/i18n/I18nProvider";
import {SavePopup} from "../../Components/OtNotes/SavePopup";
import {DeletePopup} from "../../Components/OtNotes/DeletePopup";

export function OtNotesDeletePopup(props) {
    return (
        <I18nProvider>
            <DeletePopup {...props}/>
        </I18nProvider>
    );
}
export function OtNotesSavePopup(props) {
    return (
        <I18nProvider>
            <SavePopup {...props}/>
        </I18nProvider>
    );
}
OtNotesDeletePopup.propTypes = {
    hostData: PropTypes.object,
    hostApi: PropTypes.object,
}

OtNotesSavePopup.propTypes = {
    hostData: PropTypes.object,
    hostApi: PropTypes.object,
}