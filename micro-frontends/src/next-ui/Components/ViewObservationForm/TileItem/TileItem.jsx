import React from "react";
import propTypes from "prop-types";
import { Document } from "@carbon/icons-react/next";
import "../viewObservationForm.scss";
// import { FormattedMessage } from "react-intl";

export const TileItem = (props) => {
  const { title, items } = props;
  return (
    <>
      {items.map((item, index) => {
        const hasSubItems = item?.children?.length > 0;
        return (
          <div key={index}>
            {hasSubItems ? (
              <>
                {title !== item.label ? (
                  <span className="sub-items-title">{item.label}</span>
                ) : null}
                <div className="row-body">
                  {item.children.map((subItem, index) => {
                    return (
                      <div key={index} className="row-element">
                        <div className="row-content">
                          <div className="row-label">{subItem.label}</div>
                          <div className="w-70">{subItem.value}</div>
                        </div>
                        {subItem.notes && (
                          <span className="notes-section">
                            <Document className="document-icon" />
                            {subItem.notes}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="row-body">
                <div className="row-element">
                  <div className="row-content">
                    <div className="row-label">{item.label}</div>
                    <div className="w-70">{item.value}</div>
                  </div>
                  {item.notes && (
                    <span className="notes-section">
                      <Document className="document-icon" />
                      {item.notes}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

TileItem.propTypes = {
  title: propTypes.string,
  items: propTypes.array,
};
export default TileItem;
