import React from "react";
import { Modal, Tile } from "carbon-components-react";
import propTypes from "prop-types";
import TileItem from "./TileItem/TileItem";
import { subLabels, isAbnormal } from "../../utils/FormDisplayControl/FormView";

import "./viewObservationForm.scss";
// import { FormattedMessage } from "react-intl";

const dummyFormData = [
  {
    concept: {
      shortName: "Vitals",
    },
    value: null,
    groupMembers: [
      {
        concept: {
          shortName: "Temperature (F)",
          hiNormal: 99.86,
          lowNormal: 95,
          units: null,
        },
        value: "100",
        interpretation: "ABNORMAL",
      },
      {
        concept: {
          shortName: "Pulse",
          hiNormal: 100,
          lowNormal: 60,
          units: "beats/min",
        },
        value: "12",
      },
      {
        concept: {
          shortName: "Respiratory rate",
          hiNormal: 18,
          lowNormal: 12,
          units: null,
        },
        value: "12",
        notes: "notes example",
      },
    ],
  },
  {
    concept: { shortName: "Hierarchy" },
    value: null,
    groupMembers: [
      {
        concept: { shortName: "Comments" },
        value:
          "Duis ut fermentum ex. Integer sodales tellus tortor, vel congue lorem mollis nec. Nam eget massa massa",
        groupMembers: [],
        notes: "notes example",
      },
      {
        concept: { shortName: "Vitals" },
        groupMembers: [
          {
            concept: {
              shortName: "Temperature (F)",
              hiNormal: 99.86,
              lowNormal: 95,
              units: null,
            },
            value: "100",
          },
          {
            concept: {
              shortName: "Pulse",
              hiNormal: 100,
              lowNormal: 60,
              units: "beats/min",
            },
            value: "12",
          },
          {
            concept: {
              shortName: "Respiratory rate",
              hiNormal: 18,
              lowNormal: 12,
              units: null,
            },
            value: "12",
            notes: "notes example",
          },
        ],
      },
      {
        concept: { shortName: "Comments1" },
        value:
          "Duis ut fermentum ex. Integer sodales tellus tortor, vel congue lorem mollis nec. Nam eget massa massa",
        groupMembers: [],
        interpretation: "ABNORMAL",
      },
      {
        concept: { shortName: "Comments2" },
        value:
          "Duis ut fermentum ex. Integer sodales tellus tortor, vel congue lorem mollis nec. Nam eget massa massa",
        groupMembers: [],
      },
    ],
  },
  {
    concept: { shortName: "Primary diagnosis" },
    value:
      "Duis ut fermentum ex. Integer sodales tellus tortor, vel congue lorem mollis nec. Nam eget massa massa",
    groupMembers: [],
  },
  {
    concept: { shortName: "Section4" },
    value: "",
    groupMembers: [
      {
        concept: { shortName: "Comments-1" },
        type: "text",
        value:
          "Duis ut fermentum ex. Integer sodales tellus tortor, vel congue lorem mollis nec. Nam eget massa massa",
        groupMembers: [],
      },
      {
        concept: { shortName: "Date of ops" },
        type: "date",
        value: "24-Sept-2023",
        groupMembers: [],
      },
    ],
  },
  {
    concept: { shortName: "Primary diagnosis2" },
    value:
      "Duis ut fermentum ex. Integer sodales tellus tortor, vel congue lorem mollis nec. Nam eget massa massa",
    groupMembers: [],
    interpretation: "ABNORMAL",
  },
  {
    concept: { shortName: "Primary diagnosis3" },
    value:
      "Duis ut fermentum ex. Integer sodales tellus tortor, vel congue lorem mollis nec. Nam eget massa massa",
    groupMembers: [],
  },
];

export const ViewObservationForm = (props) => {
  const { formName, closeViewObservationForm, formData } = props;

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
          <section className="section-body">
            {dummyFormData.map((section, key) => {
              return (
                <Tile key={key}>
                  <div
                    style={{
                      display: section?.groupMembers?.length ? "block" : "flex",
                    }}
                  >
                    <span
                      className={`section-header ${
                        section?.groupMembers?.length ? "" : "row-label"
                      } ${
                        isAbnormal(section.interpretation) ? "is-abnormal" : ""
                      }`}
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
                        className={`w-70 ${
                          isAbnormal(section.interpretation)
                            ? "is-abnormal"
                            : ""
                        }`}
                      >
                        {typeof section.value === "object"
                          ? section.value.shortName
                          : section.value}
                        &nbsp;{section.concept.units || ""}
                      </div>
                    )}
                  </div>
                </Tile>
              );
            })}
          </section>
        </section>
      </Modal>
    </div>
  );
};

ViewObservationForm.propTypes = {
  formName: propTypes.string,
  closeViewObservationForm: propTypes.func,
  formData: propTypes.array,
};
export default ViewObservationForm;
