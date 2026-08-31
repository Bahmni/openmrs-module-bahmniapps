import React, {useEffect, useState} from "react";
import "../../../styles/carbon-conflict-fixes.scss";
import "../../../styles/carbon-theme.scss";
import "../../../styles/common.scss";
import { I18nProvider } from "../../Components/i18n/I18nProvider";
import PropTypes from "prop-types";
import { FormattedMessage } from "react-intl";
import { ViewOrders } from "../../Components/ViewOrders/ViewOrders";
import axios from "axios";
import { FHIR_URL, FHIR_SERVICE_REQUEST_URL, FHIR_EXT_ORDER_SHORT_NAME } from "../../constants";

const extractOrderIdFromReference = (reference) => {
    if (!reference || typeof reference !== 'string') {
        return null;
    }
    const parts = reference.split('/');
    return parts.length === 2 ? parts[1] : null;
};

const buildTasksByOrderId = (taskEntries = []) => {
    const tasksByOrderId = new Map();
    taskEntries.forEach(entry => {
        const task = entry.resource;
        if (task?.basedOn && Array.isArray(task.basedOn) && task.basedOn.length > 0) {
            const orderId = extractOrderIdFromReference(task.basedOn[0].reference);
            if (orderId && !tasksByOrderId.has(orderId)) {
                tasksByOrderId.set(orderId, task);
            }
        }
    });
    return tasksByOrderId;
};

const getOrderName = (resource) => {
    const extensions = resource?.extension;
    if (Array.isArray(extensions)) {
        const shortNameExt = extensions.find(ext => ext?.url?.endsWith(FHIR_EXT_ORDER_SHORT_NAME));
        if (shortNameExt?.valueString) {
            return shortNameExt.valueString;
        }
    }
    return resource?.code?.text || "";
};

const transformOrders = (entries = [], tasksByOrderId = new Map()) => {
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

    const orders = [];
    entries.forEach(entry => {
        const resource = entry.resource;
        const orderId = resource.id;

        const isReplacementOrder = Array.isArray(resource.replaces) && resource.replaces.length > 0;
        const isCancelledOrder = cancelledOrderIds.has(orderId);

        if(resource.status !== "unknown" && !isReplacementOrder && !isCancelledOrder) {
            const relatedTask = tasksByOrderId.get(orderId);

            orders.push({
                name: getOrderName(resource),
                createdBy: resource.requester?.display || "",
                createdAt: resource.authoredOn || "",
                updatedAt: relatedTask?.meta?.lastUpdated ? new Date(relatedTask.meta.lastUpdated).getTime() : undefined,
                orderStatus: relatedTask?.status ? relatedTask.status.toUpperCase() : undefined,
                owner: relatedTask?.owner?.display,
                notes: relatedTask?.note?.[0]?.text ? relatedTask.note[0].text.split('\n').join(' | ') : undefined,
            });
        }
    });
    return orders;
};

export function OrdersDisplayControl({hostData}) {
    const { translationKey, orderType, patient, name, numberOfVisits } = hostData;
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrdersAndTasks = async () => {
            try {
                const payload = {
                    category: orderType.uuid,
                    patient: patient.uuid,
                    _count: 100
                };
                if(numberOfVisits){
                    payload.numberOfVisits = numberOfVisits;
                }

                const serviceRequestRes = await axios.get(FHIR_SERVICE_REQUEST_URL, { params: payload });
                const serviceRequestEntries = serviceRequestRes.data?.entry || [];

                const orderUuids = serviceRequestEntries.map(e => e.resource?.id).filter(Boolean);
                let taskEntries = [];

                if (orderUuids.length > 0) {
                    try {
                        const basedOnFilter = orderUuids.map(id => `ServiceRequest/${id}`).join(',');
                        const tasksRes = await axios.get(FHIR_URL, {
                            params: {
                                'based-on': basedOnFilter,
                                _count: 100
                            }
                        });
                        taskEntries = tasksRes.data?.entry || [];
                    } catch (taskErr) {
                        console.warn('Failed to fetch task data for patient:', patient.uuid, taskErr);
                    }
                }

                const tasksByOrderId = buildTasksByOrderId(taskEntries);
                const data = transformOrders(serviceRequestEntries, tasksByOrderId);
                data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(data);
            } catch (err) {
                console.error('Failed to fetch orders for patient:', patient.uuid, err);
                setOrders([]);
            }
        };

        fetchOrdersAndTasks();
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
