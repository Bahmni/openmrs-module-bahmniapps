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
      providers: [{ name: "test provider" }],
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
          providers: [{ name: "test provider" }],
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

  it("should render the correct items", () => {
    render(<TileItem {...initialProps} />);
    // label
    expect(screen.getByText("Comments")).toBeTruthy();
    // sub label
    expect(screen.getByText("(60 - 100)")).toBeTruthy();
    // value
    expect(screen.getByText("test comment text")).toBeTruthy();
    // notes
    expect(screen.getByText("notes example - by test provider")).toBeTruthy();
    // children notes
    expect(
      screen.getByText("nested children notes example - by test provider")
    ).toBeTruthy();
  });

  it("should highlight member in red if it is abnormal", () => {
    render(<TileItem {...initialProps} />);
    const element = screen.getByTestId("subItem-0");
    expect(element.classList.contains("is-abnormal")).toBeTruthy();
  });
});
