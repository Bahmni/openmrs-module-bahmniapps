import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { PatientAlergiesControl } from "./PatientAlergiesControl";

it("works as a dummy test", () => {
  const hostData = { name: "__test_name__" };
  const hostApi = { callback: jest.fn() };
  render(<PatientAlergiesControl hostData={hostData} hostApi={hostApi}/>);

  expect(screen.getByText('Displaying alergy control from __test_name__')).toBeTruthy();

  const button = screen.getByRole('button', { name: 'Click for callback' });
  expect(button).toBeTruthy();
  fireEvent.click(button);

  expect(hostApi.callback).toHaveBeenCalled();

});
