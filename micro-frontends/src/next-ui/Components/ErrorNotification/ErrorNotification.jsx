import React from 'react'
import "./ErrorNotification.scss";

const ErrorNotification = ({setEditError}) => {
  return (
    <div class="message-container error-message-container">
        <div class="message-text">
            <div class="types-for-errors error-message">
                Please enter a value in the mandatory fields or correct the value in the highlighted fields to proceed
            </div>
            <div class="button-wrapper">
                <button type="button" onClick={()=>{setEditError(false)}} class="show-btn">OK</button>
            </div>
        </div>
    </div>
  )
}

export default ErrorNotification;