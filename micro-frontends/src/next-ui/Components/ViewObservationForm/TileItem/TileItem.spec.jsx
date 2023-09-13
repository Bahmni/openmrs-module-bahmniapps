import React from "react";
import { render, screen } from "@testing-library/react";
import TileItem from "./TileItem.jsx";

const initialProps = {
  items: [
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
          hiNormal: 99.86,
          lowNormal: 95,
          units: null,
          isAbnormal: true,
        },
        {
          label: "Pulse",
          value: "12",
          hiNormal: 100,
          lowNormal: 60,
          units: "beats/min",
          isAbnormal: false,
        },
        {
          label: "Respiratory rate",
          value: "12",
          hiNormal: 18,
          lowNormal: 12,
          units: null,
          isAbnormal: false,
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
