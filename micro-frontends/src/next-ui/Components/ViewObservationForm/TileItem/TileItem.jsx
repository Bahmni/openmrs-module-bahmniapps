import React from "react";
import propTypes from "prop-types";
import { Document } from "@carbon/icons-react/next";
import {
  subLabels,
  isAbnormal,
  getValue,
} from "../../../utils/FormDisplayControl/FormView";
import "../viewObservationForm.scss";

export const TileItem = (props) => {
  const { items } = props;

  return (
    <>
      <div className="row-body">
        {items.map((item, index) => {
          const hasSubItems = item?.groupMembers?.length > 0;
          return hasSubItems ? (
            <div key={index} className="sub-items-body">
              <span className="sub-items-title">{item.concept.shortName}</span>
              <div className="row-body">
                {item.groupMembers.map((subItem, index) => {
                  return (
                    <div
                      key={index}
                      className={`row-element ${
                        isAbnormal(subItem.interpretation) ? "is-abnormal" : ""
                      }`}
                      data-testid={`subItem-${index}`}
                    >
                      <div className="row-content">
                        <div className="row-label">
                          {subItem.concept.shortName}&nbsp;
                          <span className="sub-label">
                            {subLabels(subItem.concept)}
                          </span>
                        </div>
                        <div className="row-value">
                          {getValue(subItem)}
                          &nbsp;{subItem.concept.units || ""}
                        </div>
                      </div>
                      {subItem.comment && (
                        <span className="notes-section">
                          <Document className="document-icon" />
                          {`${subItem.comment} - by ${
                            (subItem.providers && subItem.providers[0]?.name) ||
                            ""
                          }`}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div
              className={`row-element ${
                isAbnormal(item.interpretation) ? "is-abnormal" : ""
              }`}
              key={index}
            >
              <div className="row-content">
                <div className="row-label">
                  {item.concept.shortName}&nbsp;
                  <span className="sub-label">{subLabels(item.concept)}</span>
                </div>
                <div className="row-value">
                  {getValue(item)}
                  &nbsp;{item.concept.units || ""}
                </div>
              </div>
              {item.comment && (
                <span className="notes-section">
                  <Document className="document-icon" />
                  {`${item.comment} - by ${
                    (item.providers && item.providers[0]?.name) || ""
                  }`}
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
