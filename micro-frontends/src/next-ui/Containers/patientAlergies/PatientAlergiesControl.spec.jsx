import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { PatientAlergiesControl } from "./PatientAlergiesControl";

describe("PatientAlergiesControl", () => {
  it("should render the component", () => {
    const { container } = render(<PatientAlergiesControl hostData={{uuid: "___patient_uuid__"}} />);
    expect(container).toMatchSnapshot();
  });

  it('should show add button when isAddButton is enabled', () => {
    const { container } = render(<PatientAlergiesControl hostData={{uuid: "___patient_uuid__"}} isAddButtonEnabled={true} />);
    expect(container.querySelector('.add-button')).not.toBeNull();
  });

  it('should not show add button when isAddButton is disabled', () => {
    const { container } = render(<PatientAlergiesControl hostData={{uuid: "___patient_uuid__"}} isAddButtonEnabled={false} />);
    expect(container.querySelector('.add-button')).toBeNull();
  });

  it("should show the side panel when add button is clicked", () => {
    const { container } = render(<PatientAlergiesControl hostData={{uuid: "___patient_uuid__"}}/>);
    fireEvent.click(container.querySelector('.add-button'));
    expect(container.querySelector(".overlay-next-ui")).not.toBeNull();
  });

  it("should not show the side panel when Cancel button is clicked", () => {
    const { container, getByTestId } = render(<PatientAlergiesControl hostData={{uuid: "___patient_uuid__"}}/>);
    fireEvent.click(container.querySelector('.add-button'));
    expect(container.querySelector(".overlay-next-ui")).not.toBeNull();

    fireEvent.click(getByTestId('cancel'));
    expect(container.querySelector(".overlay-next-ui")).toBeNull();
  });
});