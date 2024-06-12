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