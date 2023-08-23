import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { PatientAlergiesControl } from "./PatientAlergiesControl";

it("works as a dummy test", () => {
  const hostData = { name: "__test_name__" };
  const hostApi = { callback: jest.fn() };
  const tx = jest.fn().mockImplementation(key => {
    switch (key) {
      case "SAMPLE_AT_LABEL":
        return "__test-translation__"
    }
    return '';
  })
  
  render(<PatientAlergiesControl hostData={hostData} hostApi={hostApi} tx={tx}/>);

  expect(screen.getByText('Displaying alergy control from __test_name__')).toBeTruthy();
  expect(screen.getByText('Translation: __test-translation__')).toBeTruthy();

  const button = screen.getByRole('button', { name: 'Click for callback' });
  expect(button).toBeTruthy();
  fireEvent.click(button);

  expect(hostApi.callback).toHaveBeenCalled();

});
