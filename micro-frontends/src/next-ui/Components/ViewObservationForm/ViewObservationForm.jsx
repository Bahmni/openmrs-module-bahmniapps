import React from "react";
import { Modal, Tile } from "carbon-components-react";
import propTypes from "prop-types";
import TileItem from "./TileItem/TileItem";
import "./viewObservationForm.scss";
// import { FormattedMessage } from "react-intl";

const objectStructure = {
  sections: [
    {
      title: "Vitals",
      value: null,
      children: [
        {
          label: "Vitals",
          value: null,
          children: [
            {
              label: "Temperature",
              value: "12",
            },
            {
              label: "Pulse",
              value: "12",
            },
            {
              label: "Respiratory rate",
              value: "12",
              notes: "notes example",
            },
          ],
        },
      ],
    },
    {
      title: "Hierarchy",
      value: null,
      children: [
        {
          label: "Comments",
          value:
            "Duis ut fermentum ex. Integer sodales tellus tortor, vel congue lorem mollis nec. Nam eget massa massa",
          children: [],
          notes: "notes example",
        },
        {
          label: "Vitals",
          children: [
            {
              label: "Temperature",
              value: "12",
            },
            {
              label: "Pulse",
              value: "12",
            },
            {
              label: "Respiratory rate",
              value: "12",
            },
          ],
        },
      ],
    },
    {
      title: "Primary diagnosis",
      value:
        "Duis ut fermentum ex. Integer sodales tellus tortor, vel congue lorem mollis nec. Nam eget massa massa",
      children: [],
    },
    {
      title: "Section4",
      value: "",
      children: [
        {
          label: "Comments-1",
          type: "text",
          value:
            "Duis ut fermentum ex. Integer sodales tellus tortor, vel congue lorem mollis nec. Nam eget massa massa",
          children: [],
          notes: "notes example",
        },
        {
            label: "Date of ops",
            type: "date",
            value:
              "24-Sept-2023",
            children: [],
          },
      ],
    },
  ],
};

export const ViewObservationForm = (props) => {
  const { formName, closeViewObservationForm } = props;
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
            {objectStructure.sections.map((section, key) => {
              return (
                <Tile key={key}>
                  <div
                    style={{
                      display: section?.children?.length ? "block" : "flex",
                    }}
                  >
                    <span
                      className={`section-header ${
                        section?.children?.length ? "" : "row-label"
                      }`}
                    >
                      {section.title}
                    </span>
                    {section?.children?.length ? (
                      <TileItem
                        title={section.title}
                        items={section.children}
                      />
                    ) : (
                      <div className="w-70">{section.value}</div>
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
};
export default ViewObservationForm;
