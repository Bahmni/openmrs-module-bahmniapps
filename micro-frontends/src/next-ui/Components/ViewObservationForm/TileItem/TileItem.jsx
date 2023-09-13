import React from "react";
import propTypes from "prop-types";
import { Document } from "@carbon/icons-react/next";
import "../viewObservationForm.scss";
// import { FormattedMessage } from "react-intl";

export const TileItem = (props) => {
  const { items } = props;

  const subLabels = (subItem) => {
    let label = "";
    const { lowNormal, hiNormal } = subItem;
    if (lowNormal && hiNormal) {
      label = `(${lowNormal} - ${hiNormal})`;
    } else if (lowNormal && !hiNormal) {
      label = `(>${lowNormal})`;
    } else if (!lowNormal && hiNormal) {
      label = `(<${hiNormal})`;
    }
    return <span className={"sub-label"}>{label}</span>;
  };

  return (
    <>
      <div className="row-body">
        {items.map((item, index) => {
          const hasSubItems = item?.children?.length > 0;

          return hasSubItems ? (
            <div key={index} className="sub-items-body">
              <span className="sub-items-title">{item.label}</span>
              <div className="row-body">
                {item.children.map((subItem, index) => {
                  return (
                    <div
                      key={index}
                      className={`row-element ${
                        subItem.isAbnormal ? "is-abnormal" : ""
                      }`}
                    >
                      <div className="row-content">
                        <div className="row-label">
                          {subItem.label}&nbsp;{subLabels(subItem)}
                        </div>
                        <div className="w-70">
                          {subItem.value}&nbsp;{subItem.units || ""}
                        </div>
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
            </div>
          ) : (
            <div
              className={`row-element ${item.isAbnormal ? "is-abnormal" : ""}`}
              key={index}
            >
              <div className="row-content">
                <div className="row-label">
                  {item.label}&nbsp;{subLabels(item)}
                </div>
                <div className="w-70">
                  {item.value}&nbsp;{item.units || ""}
                </div>
              </div>
              {item.notes && (
                <span className="notes-section">
                  <Document className="document-icon" />
                  {item.notes}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

TileItem.propTypes = {
  items: propTypes.array,
};
export default TileItem;
