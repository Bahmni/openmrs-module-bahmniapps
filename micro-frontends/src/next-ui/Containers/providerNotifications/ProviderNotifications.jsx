import React from 'react'
import './ProviderNotifications.scss'
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import PatientsList from '../../Components/ProviderNotificationPatients/PatientsList';
import { I18nProvider } from '../../Components/i18n/I18nProvider';

export function ProviderNotifications() {
    const acknowledgementRequiredText = <FormattedMessage id="ACKNOWLEDGEMENT_REQUIRED_TEXT" defaultMessage="Acknowledgement required" />;


    return (
        <I18nProvider>
            <div className='provider-notifications-next-ui'>
                <div className='provider-notification-headers'>
                        <span>{acknowledgementRequiredText}: </span>
                </div>
                <PatientsList />
            </div>
        </I18nProvider>
    )
};

ProviderNotifications.propTypes = {
    hostData: PropTypes.object,
    hostApi: PropTypes.object
};