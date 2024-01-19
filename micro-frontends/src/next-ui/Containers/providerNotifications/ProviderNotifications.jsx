import React from 'react'
import './ProviderNotifications.scss'
import PropTypes from 'prop-types';
import { ComboBox, Link } from 'carbon-components-react';
import { FormattedMessage } from 'react-intl';
import PatientsList from '../../Components/ProviderNotificationPatients/PatientsList';

export function ProviderNotifications(props) {
    const acknowledgementRequiredText = <FormattedMessage id="AKNOWLEDGEMENT_REQUIRED_TEXT" defaultMessage="Acknowledgement required" />;
    const archiveText = <FormattedMessage id="ARCHIVE_TEXT" defaultMessage="Archive" />;
    return (
        <div className='provider-notifications-next-ui'>
            <ComboBox
                id="search"
                titleText=""
                placeholder="Search a Patient"
                // items={props.hostData.notifications}
                // itemToString={(item) => (item ? item.text : '')}
                // onChange={(event) => props.hostApi.selectNotification(event.selectedItem)}
                // selectedItem={props.hostData.selectedNotification}
            />

            <div className='provider-notification-headers'>
                <span>{acknowledgementRequiredText}</span>
                <Link href="#" className="notification-link">{archiveText}</Link>
            </div>

            
            <PatientsList />
        </div>
    )
};

ProviderNotifications.propTypes = {
    hostData: PropTypes.object,
    hostApi: PropTypes.object
};