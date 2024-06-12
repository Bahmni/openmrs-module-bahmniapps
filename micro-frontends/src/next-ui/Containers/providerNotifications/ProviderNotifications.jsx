import React, { useEffect, useState } from 'react';
import './ProviderNotifications.scss';
import PropTypes from 'prop-types';
import PatientsList from '../../Components/ProviderNotificationPatients/PatientsList';
import { FormattedMessage } from 'react-intl';
import { I18nProvider } from '../../Components/i18n/I18nProvider';
import { getCookies } from '../../utils/cookieHandler/cookieHandler';
import { getProvider, getEmergencyDrugAcknowledgements, sortMedicationList, groupByIdentifier } from '../../utils/providerNotifications/ProviderNotificationUtils';
import { acknowledgeEmergencyMedication } from '../../utils/providerNotifications/ProviderNotificationUtils';
import { MEDICATION_ACKNOWLEDGE_SQL_PROPERTY, verifierFunction } from '../../constants';
import { NotificationCarbon } from "bahmni-carbon-ui";

export function ProviderNotifications() {
    const acknowledgementRequiredText = (<FormattedMessage id="AKNOWLEDGEMENT_REQUIRED_TEXT" defaultMessage="Acknowledgement required" />);
    const noDrugsToBeAcknowledgedText = (<FormattedMessage id="NO_DRUGS_TO_BE_AKNOWLEDGED_TEXT" defaultMessage="You have no new drugs to be acknowledged." />);
    const [patientListWithMedications, setPatientListWithMedications] = useState([]);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationTitle, setNotificationTitle] = useState("");
    const [notificationType, setNotificationType] = useState("success");
    const [providerUuid, setProviderUuid] = useState();
    const cookies = getCookies();
    const locationUuid = JSON.parse(cookies["bahmni.user.location"]).uuid;

    const fetchProviderAndMedications = async () => {
        try {
            const provider = await getProvider();
            const providerUuid = provider.currentProvider.uuid;
            setProviderUuid(providerUuid);
            const emergencyDrugAcknowledgementResponse = await getEmergencyDrugAcknowledgements(locationUuid, MEDICATION_ACKNOWLEDGE_SQL_PROPERTY, providerUuid);
            const patientListGroupedByIdentifier = groupByIdentifier(emergencyDrugAcknowledgementResponse, 'identifier');
            const sortedMedicationList = sortMedicationList(Object.values(patientListGroupedByIdentifier));
            setPatientListWithMedications(sortedMedicationList);
        } catch (error) {
            console.error(error);
        }
    };
    
    const handleOnClick = async (medication_administration_performer_uuid, medication_administration_uuid, providerNotes) => {
        try {
            const response = await acknowledgeEmergencyMedication({
                providers: [
                {
                    uuid: medication_administration_performer_uuid,
                    providerUuid,
                    function: verifierFunction
                }
                ],
                notes: [{ authorUuid: providerUuid, text: providerNotes }]
            }, medication_administration_uuid);
            updateNotification(response)
            fetchProviderAndMedications();
        } catch (error) {
            updateNotification({ success: false, message: error.message });
        }
    };

    const updateNotification = async (response) => {
        setShowNotification(true);
        setNotificationTitle(response.message);
        setNotificationType(response.success ? "success" : "error");
    }

    const hideNotification = () => {
        setShowNotification(false);
    }

    useEffect(() => {
        fetchProviderAndMedications();
    }, []);

    const notificationComponent = (
        <NotificationCarbon 
            messageDuration={3000} 
            onClose={hideNotification} 
            showMessage={showNotification} 
            kind={notificationType} 
            title={notificationTitle}
        />
    );

    return (
        <I18nProvider>
            <div className='provider-notifications-next-ui'>
                {patientListWithMedications.length === 0 ? (
                    <div className='provider-notification-headers'>{noDrugsToBeAcknowledgedText}</div>
                ) : (
                    <>
                        <div className='provider-notification-headers'>
                            <span>{acknowledgementRequiredText}: </span>
                        </div>
                        <PatientsList patientListWithMedications={patientListWithMedications} handleOnClick={handleOnClick} />
                    </>
                )}
                {notificationComponent}
            </div>
        </I18nProvider>
    );
}

ProviderNotifications.propTypes = {
    hostData: PropTypes.object,
    hostApi: PropTypes.object
};
