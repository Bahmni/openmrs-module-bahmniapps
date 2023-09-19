import React from "react";
import { Modal, Tile } from "carbon-components-react";
import propTypes from "prop-types";
import TileItem from "./TileItem/TileItem";
import { subLabels, isAbnormal, getValue } from "../../utils/FormDisplayControl/FormView";

import "./viewObservationForm.scss";

export const ViewObservationForm = (props) => {
  const { formName, closeViewObservationForm, formData, isViewFormLoading } =
    props;

  return (
    <div>
      <Modal
        open
        passiveModal
        className="view-observation-form-modal"
        onRequestClose={closeViewObservationForm}
      >
        <section className="content-body">
          <h2 className="section-title">{formName}</h2>
          {isViewFormLoading ? (
            <div>Loading... Please wait</div>
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
};
export default ViewObservationForm;
