import React from "react";
import { Modal, Tile, Loading } from "carbon-components-react";
import propTypes from "prop-types";
import { Document } from "@carbon/icons-react/next";
import TileItem from "./TileItem/TileItem";
import {
  subLabels,
  isAbnormal,
  getValue,
} from "../../utils/FormDisplayControl/FormView";

import "./viewObservationForm.scss";

export const ViewObservationForm = (props) => {
  const { formName, closeViewObservationForm, formData, isViewFormLoading, showPrintOption, printForm } =
    props;

  return (
    <div>
      <Modal
        open
        passiveModal
        className="view-observation-form-modal"
        onRequestClose={closeViewObservationForm}
      >
        {showPrintOption && <button className="confirm print-button" onClick={printForm}>Print</button> }
        <section className="content-body">
          <h2 className="section-title">{formName}</h2>
          {isViewFormLoading ? (
            <div>
              <Loading />
            </div>
          ) : (
            <section className="section-body">
              {formData.map((section, index) => {
                return (
                  <Tile key={index}>
                    <div
                      style={{
                        display: section?.groupMembers?.length
                          ? "block"
                          : "flex",
                      }}
                    >
                      <span
                        className={`section-header ${
                          section?.groupMembers?.length ? "" : "row-label"
                        } ${
                          isAbnormal(section.interpretation)
                            ? "is-abnormal"
                            : ""
                        }`}
                        data-testid={`section-label-${index}`}
                      >
                        {section.concept.shortName}&nbsp;
                        <span className="sub-label">
                          {subLabels(section.concept)}
                        </span>
                      </span>
                      {section?.groupMembers?.length ? (
                        <TileItem items={section.groupMembers} />
                      ) : (
                        <div
                          className={`row-value ${
                            isAbnormal(section.interpretation)
                              ? "is-abnormal"
                              : ""
                          }`}
                        >
                          {getValue(section)}
                          &nbsp;{section.concept.units || ""}
                        </div>
                      )}
                    </div>
                    {section.comment && (
                      <span className="notes-section">
                        <Document className="document-icon" />
                        {`${section.comment} - by ${
                          (section.providers && section.providers[0]?.name) ||
                          ""
                        }`}
                      </span>
                    )}
                  </Tile>
                );
              })}
            </section>
          )}
        </section>
      </Modal>
    </div>
  );
};

ViewObservationForm.propTypes = {
  formName: propTypes.string,
  closeViewObservationForm: propTypes.func,
  formData: propTypes.array,
  isViewFormLoading: propTypes.bool,
  showPrintOption: propTypes.bool,
  printForm: propTypes.func
};
export default ViewObservationForm;
