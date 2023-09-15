import React from "react";
import { render, screen } from "@testing-library/react";
import TileItem from "./TileItem.jsx";

const initialProps = {
  items: [
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
  ],
};

describe("TileItem", () => {
  it("should render the component", () => {
    const { container } = render(<TileItem {...initialProps} />);
    expect(container).toMatchSnapshot();
  });

  it("should render the correct items", () => {
    render(<TileItem {...initialProps} />);
    expect(screen.getByText("Comments")).toBeTruthy();
    expect(screen.getByText("(60 - 100)")).toBeTruthy();
  });
});
