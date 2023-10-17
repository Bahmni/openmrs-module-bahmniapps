import React from 'react'
import "./ErrorNotification.scss";
import { I18nProvider } from '../i18n/I18nProvider';
import { FormattedMessage } from 'react-intl';

const ErrorNotification = ({setEditError, editErrorMessage}) => {
    const errorMessage = editErrorMessage ? editErrorMessage : <FormattedMessage
    id={"EDIT_FORM_ERROR_MESSAGE"}
    defaultMessage={"Please enter a value in the mandatory fields or correct the value in the highlighted fields to proceed"}
  />;
  return (
    <I18nProvider>
        <div class="message-container error-message-container">
            <div class="message-text">
                <div class="types-for-errors error-message">
                    {errorMessage}
                </div>
                <div class="button-wrapper">
                    <button type="button" onClick={()=>{setEditError(false)}} class="show-btn">OK</button>
                </div>
            </div>
        </div>
    </I18nProvider>
  )
}

export default ErrorNotification;