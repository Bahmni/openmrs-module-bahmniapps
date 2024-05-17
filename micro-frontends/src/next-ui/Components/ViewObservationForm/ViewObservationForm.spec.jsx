import React from "react";
import { render, screen } from "@testing-library/react";
import ViewObservationForm from "./ViewObservationForm.jsx";

const initialProps = {
  formName: "Vitals",
  formNameTranslations: "Vitals",
  isViewFormLoading: false,
  formData: [
    {
      concept: {
        shortName: "Pulse",
        hiNormal: 100,
        lowNormal: 60,
      },
      value: "105",
      groupMembers: [],
      interpretation: "Abnormal",
      comment: "notes example",
      providers: [{ name: "test provider" }],
    },
    {
      concept: {
        shortName: "Pulse",
        hiNormal: 100,
        lowNormal: 60,
        units: "beats/min",
      },
      valueAsString: "105",
      groupMembers: [],
      comment: "notes example",
    },
    {
      concept: { shortName: "Blood Pressure" },
      groupMembers: [
        {
          concept: {
            shortName: "Systolic Blood Pressure",
            hiNormal: 140,
            lowNormal: 100,
            units: "mmHg"
          },
          value: "120",
          interpretation: "Abnormal",
          comment: "notes example",
          providers: [{ name: "test provider" }],
        },
        {
          concept: {
            shortName: "Diastolic Blood Pressure",
            hiNormal: 90,
            lowNormal: 60,
            units: "mmHg",
          },
          value: "80",
          comment: "notes example",
        },
      ],
    },
  ],
};

describe("ViewObservationForm", () => {
  it("should match the screenshot", () => {
    const { container } = render(<ViewObservationForm {...initialProps} />);
    expect(container).toMatchSnapshot();
  });

  it("should highlight member in red if it is abnormal", () => {
    render(<ViewObservationForm {...initialProps} />);
    const element = screen.getByTestId("section-label-0");
    expect(element.classList.contains("is-abnormal")).toBeTruthy();
  });

  it("should show loader", () => {
    const updatedProps = { ...initialProps, isViewFormLoading: true };
    render(<ViewObservationForm {...updatedProps} />);
    expect(screen.queryAllByText("Active loading indicator")).toHaveLength(2);
  });
});
