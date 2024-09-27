import React from 'react'
import './ProviderNotifications.scss'
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import PatientsList from '../../Components/ProviderNotificationPatients/PatientsList';

export function ProviderNotifications() {
    const acknowledgementRequiredText = <FormattedMessage id="ACKNOWLEDGEMENT_REQUIRED_TEXT" defaultMessage="Acknowledgement required" />;


    return (
        <div className='provider-notifications-next-ui'>
          <div className='provider-notification-headers'>
                <span>{acknowledgementRequiredText}: </span>
            </div>
            <PatientsList />
        </div>
    )
};

ProviderNotifications.propTypes = {
    hostData: PropTypes.object,
    hostApi: PropTypes.object
};