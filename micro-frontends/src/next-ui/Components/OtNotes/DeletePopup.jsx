/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal } from "carbon-components-react";
import "../../../styles/carbon-conflict-fixes.scss";
import "../../../styles/carbon-theme.scss";
import { deleteOtNote } from "./utils";
import {FormattedMessage} from "react-intl";
import "./OtNotes.scss";
export function DeletePopup(props) {
    const { hostData, hostApi} = props;
    const [isLoading, setIsLoading] = useState(false);
    return <Modal
        open
        danger
        className="next-ui ot-notes-popup"
        modalHeading={<FormattedMessage id={"DELETE_NOTE_TITLE"} defaultMessage={"Delete Note"}/>}
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
        <FormattedMessage id={"DELETE_NOTE_MESSAGE"} defaultMessage={"Are you sure you want to delete this OT Note?"}/>
    </Modal>
}

DeletePopup.propTypes = {
    hostData: PropTypes.Object,
    hostApi: PropTypes.Object,
}
