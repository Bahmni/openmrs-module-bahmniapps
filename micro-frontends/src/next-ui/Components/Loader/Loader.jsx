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
