/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import React from 'react';
import { FormattedMessage } from "react-intl";
import './Loader.scss';

const Loader = () => {
    const loadingMessage = (
        <FormattedMessage
        id={"LOADING_MESSAGE"}
        defaultMessage={"Loading... Please Wait"}
        />
    );
    return (
        <div className="loader-container">
        <div className="loader-content">
            <div className="lds-spinner">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            </div>
            <p className="loader-text">{loadingMessage}</p>
        </div>
        </div>
    );
};

export default Loader;
