import React, {useState} from "react";
import PropTypes from "prop-types";
import {CaretDown, CaretRight} from "@carbon/icons-react/next";
import "./Accordion.scss";

export function Accordion({header, children, defaultOpen = false, className = ""}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`accordion ${className}`}>
            <div className="accordion-header" onClick={toggleAccordion}>
                <span className="accordion-icon">
                    {isOpen ? <CaretDown/> : <CaretRight/>}
                </span>
                {header}
            </div>
            {isOpen && <div className="accordion-content">{children}</div>}
        </div>
    );
}

Accordion.propTypes = {
    header: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
    defaultOpen: PropTypes.bool,
    className: PropTypes.string,
};
