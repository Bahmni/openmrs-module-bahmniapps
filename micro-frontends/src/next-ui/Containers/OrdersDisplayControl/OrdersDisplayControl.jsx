import React, {useEffect, useState} from "react";
import "../../../styles/carbon-conflict-fixes.scss";
import "../../../styles/carbon-theme.scss";
import "../../../styles/common.scss";
import { I18nProvider } from "../../Components/i18n/I18nProvider";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import { ViewOrders } from "../../Components/ViewOrders/ViewOrders";
import axios from "axios";
import {
    FHIR_EXT_CREATED_BY,
    FHIR_EXT_TASK_CREATED_ON,
    FHIR_EXT_TASK_NOTE,
    FHIR_EXT_TASK_OWNER,
    FHIR_EXT_ORDER_STATUS,
} from "../../constants";

const extractOrderIdFromReference = (reference) => {
    if (!reference || typeof reference !== 'string') {
        return null;
    }
    const parts = reference.split('/');
    return parts.length === 2 ? parts[1] : null;
};

const transformOrders = (entries = []) => {
    const cancelledOrderIds = new Set();
    entries.forEach(entry => {
        const replaces = entry.resource?.replaces;
        if (Array.isArray(replaces) && replaces.length > 0) {
            const cancelledId = extractOrderIdFromReference(replaces[0].reference);
            if (cancelledId) {
                cancelledOrderIds.add(cancelledId);
            }
        }
    });

    const orders = []
    entries.forEach(entry => {
        const resource = entry.resource;
        const orderId = resource.id;
        const extensions = resource.extension || [];
        let updatedAt, orderStatus, owner, notes, updatedBy;

        const isReplacementOrder = Array.isArray(resource.replaces) && resource.replaces.length > 0;
        const isCancelledOrder = cancelledOrderIds.has(orderId);

        if(resource.status !== "unknown" && !isReplacementOrder && !isCancelledOrder) {
            extensions.forEach(extension => {
                if (extension.url) {
                    if (extension.url.endsWith(FHIR_EXT_TASK_CREATED_ON)) {
                        updatedAt = new Date(extension.valueDateTime).getTime()
                    } else if (extension.url.endsWith(FHIR_EXT_ORDER_STATUS)) {
                        orderStatus = extension.valueString
                    } else if (extension.url.endsWith(FHIR_EXT_TASK_OWNER)) {
                        owner = extension.valueReference.display
                    } else if (extension.url.endsWith(FHIR_EXT_TASK_NOTE)) {
                        notes = extension.valueAnnotation.text ? extension.valueAnnotation.text.split('\n').join(' | ') : ""
                    } else if (extension.url.endsWith(FHIR_EXT_CREATED_BY)) {
                        updatedBy = extension.valueReference.display
                    }
                }
            })
            orders.push({
                name: resource.code?.text || "",
                createdBy: resource.requester?.display || "",
                createdAt: resource.authoredOn || "",
                updatedAt: updatedAt,
                orderStatus: orderStatus,
                statusUpdatedBy: orderStatus ? updatedBy : undefined,
                owner: owner,
                ownerUpdatedBy: owner ? updatedBy : undefined,
                notes: notes,
                notesUpdatedBy: notes ? updatedBy : undefined,
            });
        }
    });
    return orders;
};

export function OrdersDisplayControl({hostData}) {
    const { translationKey, orderType, patient, name, numberOfVisits } = hostData;
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const payload = {
            category: orderType.uuid,
            patient: patient.uuid,
        }
        if(numberOfVisits){
            payload.numberOfVisits = numberOfVisits;
        }
        axios.get("/openmrs/ws/fhir2/R4/ServiceRequest", {
            params: payload
        }).then(res => {
            const entries = res.data?.entry || [];
            const data = transformOrders(entries);
            data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(data);
        }).catch(err => {
            console.log(err);
            setOrders([]);
        });
    }, []);

    return <I18nProvider>
        <h2 className={"section-title-next-ui"}>
            <FormattedMessage id={translationKey} defaultMessage={translationKey}/>
        </h2>
        <div>
            {orders.length > 0 ? <ViewOrders orders={orders}/> : <div style={{padding: "5px"}}>
                <FormattedMessage id={"NO_ORDERS_MESSAGE"} defaultMessage={"No Orders found"} values={{name}}/>
            </div>}
        </div>
    </I18nProvider>
}

OrdersDisplayControl.propTypes = {
    hostData: PropTypes.object.isRequired,
    hostApi: PropTypes.object.isRequired,
};
