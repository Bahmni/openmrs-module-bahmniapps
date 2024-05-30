import React from 'react'
import './Notifications.scss'
import PropTypes from 'prop-types';

export function ProviderNotifications(props) {
    return (
        <div className='notifications-next-ui'>
            <h1>ProviderNotifications</h1>
        </div>
    )
};

ProviderNotifications.propTypes = {
    hostData: PropTypes.object,
    hostApi: PropTypes.object
};