import React from "react";
import { render, screen } from "@testing-library/react";
import ViewObservationForm from "./ViewObservationForm.jsx";

const initialProps = {
  formName: "Vitals",
  isViewFormLoading: false,
  formData: [
    {
      concept: {
        shortName: "Pulse",
        hiNormal: 100,
        lowNormal: 60,
        units: "beats/min",
      },
      value: "105",
      groupMembers: [],
      interpretation: "Abnormal",
    },
    {
      concept: { shortName: "Blood Pressure" },
      groupMembers: [
        {
          concept: {
            shortName: "Systolic Blood Pressure",
            hiNormal: 140,
            lowNormal: 100,
            units: "mmHg",
          },
          value: "120",
        },
        {
          concept: {
            shortName: "Diastolic Blood Pressure",
            hiNormal: 90,
            lowNormal: 60,
            units: "mmHg",
          },
          value: "80",
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

  it("should render the correct items", () => {
    render(<ViewObservationForm {...initialProps} />);
    // label
    expect(screen.getByText("Pulse")).toBeTruthy();
    // sub label
    expect(screen.getByText("(60 - 100)")).toBeTruthy();
    // value
    expect(screen.getByText("105 beats/min")).toBeTruthy();
  });

  it("should highlight member in red if it is abnormal", () => {
    render(<ViewObservationForm {...initialProps} />);
    const element = screen.getByTestId("section-label-0");
    expect(element.classList.contains("is-abnormal")).toBeTruthy();
  });

  it("should show loader", () => {
    const updatedProps = { ...initialProps, isViewFormLoading: true };
    render(<ViewObservationForm {...updatedProps} />);
    expect(screen.getByText("Loading... Please wait")).toBeTruthy();
  });
});
