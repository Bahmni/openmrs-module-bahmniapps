import React, {useState} from "react";
import PropTypes from "prop-types";
import {ChevronUp, ChevronDown} from "@carbon/icons-react/next";
import {Accordion} from "./Accordion";
import "./OrderItem.scss";
import { DB_FULFILLER_STATUS_TO_UI_STATUS } from "../../constants";
import { FormattedMessage } from "react-intl";

export function OrderItem({name, value, updatedBy}) {
    const [isOpen, setIsOpen] = useState(false);
    return <div className="order-item-wrapper">
        <div className="order-item-header" onClick={() => updatedBy && setIsOpen(!isOpen)}>
            <div>{name}</div>
            <div>{value}</div>
            {updatedBy ? <div className="order-item-chevron">{isOpen ? <ChevronUp/> : <ChevronDown/>}</div>: <div/>}
        </div>
        {isOpen && <div className="order-item-details">{updatedBy}</div>}
    </div>
}

export function OrderItemContainer(props) {
    const {updatedAt, orderStatus, statusUpdatedBy, owner, ownerUpdatedBy, notes, notesUpdatedBy, createdAt} = props;

    const header = <span>{updatedAt || createdAt}</span>;

    return (
        <Accordion
            header={header}
            defaultOpen={true}
            className="order-item-container"
        >
            <div>
                <OrderItem updatedBy={statusUpdatedBy}
                           name={<FormattedMessage id={"STATUS"} defaultMessage={"Status"}/>}
                           value={orderStatus == null ? "New": DB_FULFILLER_STATUS_TO_UI_STATUS[orderStatus]}/>
                <OrderItem updatedBy={ownerUpdatedBy} name={<FormattedMessage id={"OWNER"} defaultMessage={"Owner"}/>}
                           value={owner ? owner : "Unassigned"}/>
                {notes &&
                    <OrderItem updatedBy={notesUpdatedBy} name={<FormattedMessage id={"NOTES"} defaultMessage={"Notes"}/>}
                               value={notes}/>}
            </div>
        </Accordion>
    );
}

OrderItem.propTypes = {
    name: PropTypes.element,
    value: PropTypes.string,
    updatedBy: PropTypes.string,
}
OrderItemContainer.propTypes = {
    updatedAt: PropTypes.string,
    orderStatus: PropTypes.string,
    statusUpdatedBy: PropTypes.string,
    owner: PropTypes.string,
    ownerUpdatedBy: PropTypes.string,
    notes: PropTypes.string,
    notesUpdatedBy: PropTypes.string,
}
