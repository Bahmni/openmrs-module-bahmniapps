import React from "react";
import { render, screen } from "@testing-library/react";
import TileItem from "./TileItem.jsx";

const initialProps = {
  items: [
    {
      concept: { shortName: "Comments" },
      value: "test comment text",
      groupMembers: [],
      comment: "notes example",
      interpretation: "Abnormal",
      providers: [{ name: "test provider" }],
    },
    {
      concept: { shortName: "Comments" },
      value: "test comment text",
      groupMembers: [],
      comment: "notes example",
      interpretation: "Abnormal",
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
          interpretation: "Abnormal",
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
          comment: "nested children notes example",
          providers: "test provider",
        },
      ],
    },
  ],
};

describe("TileItem", () => {
  it("should match the screenshot", () => {
    const { container } = render(<TileItem {...initialProps} />);
    expect(container).toMatchSnapshot();
  });

  it("should highlight member in red if it is abnormal", () => {
    render(<TileItem {...initialProps} />);
    const element = screen.getByTestId("subItem-0");
    expect(element.classList.contains("is-abnormal")).toBeTruthy();
  });
});
