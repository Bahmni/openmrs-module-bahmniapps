import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "carbon-components-react";
import "../../../styles/carbon-conflict-fixes.scss";
import "../../../styles/carbon-theme.scss";
import { deleteOtNote } from "./utils/otNotesUtils";
import {FormattedMessage} from "react-intl";
import "./OtNotes.scss";
export function OtNotesDeletePopup(props) {
    const { hostData, hostApi} = props;
    const [isLoading, setIsLoading] = useState(false);
    return <Modal
        open
        danger
        className="next-ui ot-notes-popup"
        modalHeading={<FormattedMessage id={"DELETE_OT_NOTE_HEADING"} defaultMessage={"Delete Note"}/>}
        primaryButtonText={isLoading? <FormattedMessage id={"LOADING"} defaultMessage={"Loading..."}/> : <FormattedMessage id={"YES"} defaultMessage={"Yes"}/>}
        secondaryButtonText={<FormattedMessage id={"NO"} defaultMessage={"No"}/>}
        onRequestClose={hostApi?.onClose}
        onSecondarySubmit={hostApi?.onClose}
        onRequestSubmit={() => {
            setIsLoading(true);
            deleteOtNote(hostData?.noteId).then(() => {
                setIsLoading(false);
                hostApi?.onSuccess();
            });
        }}
    >
        <FormattedMessage id={"DELETE_OT_NOTE_MESSAGE"} defaultMessage={"Are you sure you want to delete this OT Note?"}/>
    </Modal>
}

OtNotesDeletePopup.propTypes = {
    hostData: PropTypes.Object,
    hostApi: PropTypes.Object,
}
