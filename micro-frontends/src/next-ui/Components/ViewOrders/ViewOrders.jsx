import React from "react";
import "./ViewOrders.scss";
import "../../../styles/common.scss";
import PropTypes from "prop-types";
import {OrderItemContainer} from "./OrderItem";
import {Accordion} from "./Accordion";
import moment from "moment";

export function ViewOrders(props) {
    const {orders} = props;
    const formatDate = (dateString) => {
        if (!dateString) return "";
        return moment(dateString).format("DD MMM YYYY hh:mm a")
    };

    return (
        <div className="next-ui orders-view-container">
            {orders && orders.map((order, index) => {
                const header = (
                    <>
                        <div className="order-header-left">
                            <span className="order-name">{order.name}</span>
                        </div>
                        <div className="order-header-right">
                            <span className="order-provider">{order.createdBy}</span>
                            <span className="order-date">{formatDate(order.createdAt)}</span>
                        </div>
                    </>
                );
                return (
                    <Accordion
                        key={index}
                        header={header}
                        defaultOpen={index === 0}
                        className="order-item"
                    >
                        <OrderItemContainer {...order} createdAt={formatDate(order.createdAt)}
                                            updatedAt={formatDate(order.updatedAt)}/>
                    </Accordion>
                );
            })}
        </div>
    );
}

ViewOrders.propTypes = {
    orders: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            createdAt: PropTypes.string.isRequired,
            createdBy: PropTypes.string.isRequired,
            updatedAt: PropTypes.string,
            orderStatus: PropTypes.string,
            statusUpdatedBy: PropTypes.string,
            ownerUpdatedBy: PropTypes.string,
            owner: PropTypes.string,
            notes: PropTypes.string,
            notesUpdatedBy: PropTypes.string,
        })
    ).isRequired,
};
