import React from "react";
import { render, fireEvent, screen, waitFor, getByTestId } from "@testing-library/react";
import { AddAllergy } from "./AddAllergy";
import { IntlProvider } from "react-intl";
import {
  saveAllergiesAPICall
} from "../../utils/PatientAllergiesControl/AllergyControlUtils";

jest.mock('../../utils/PatientAllergiesControl/AllergyControlUtils', () => ({
  saveAllergiesAPICall: jest.fn(),
}));

const mockAllergensData = [
  { name: "Eggs", kind: "Food", uuid: "162301AAAAAA" },
  { name: "Peanuts", kind: "Food", uuid: "162302AAAAAA" },
  { name: "Seafood", kind: "Food", uuid: "162303AAAAAA" },
  { name: "Bee", kind: "Environment", uuid: "162304AAAAAA" },
  { name: "Serum", kind: "Biological", uuid: "162305AAAAAA" },
  { name: "Penicillin", kind: "Medication", uuid: "162306AAAAAA" },
  { name: "Narcotic agent", kind: "Medication", uuid: "162307AAAAAA" },
];

const mockReactionsData = {
  "101AA": { name: "GI Upset" },
  "102AA": { name: "Fever" },
  "103AA": { name: "Headache" },
  "104AA": { name: "Nausea" },
  "105AA": { name: "Cough" },
};

const mockSeverityData = [
  { name: "Mild", uuid: "162301AAAAAA" },
  { name: "Moderate", uuid: "162302AAAAAA" },
  { name: "Severe", uuid: "162303AAAAAA" },
]
const patient = {
  uuid: "patient#1",
  name: "demo"
}
const provider = {
  uuid: "provider#1",
  name: "demo provider"
}

describe("AddAllergy", () => {
  const onClose = jest.fn();
  const onSave = jest.fn();
  const searchAllergen = () => {
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "pea" } });
  };
  const selectAllergen = () => {
    const selectAllergen = screen.getByText("Reaction(s)");
    fireEvent.click(selectAllergen);
  };
  const selectReaction = (container) => {
    const severity = container.querySelectorAll(".bx--checkbox")[0];
    fireEvent.click(severity);
    expect(severity.checked).toEqual(true);
  };

  const selectSeverity = (container) => {
    const selectSeverity = container.querySelectorAll(".bx--radio-button")[0];
    fireEvent.click(selectSeverity);
    expect(selectSeverity.checked).toEqual(true);
  };
  it("should render the component", () => {
    const { container } = render(
      <IntlProvider locale="en">
      <AddAllergy
        onClose={onClose}
        onSave={onSave}
        patient={patient}
        provider={provider}
        severityOptions={mockSeverityData}
        allergens={mockAllergensData}
        reaction={mockReactionsData}
      />
      </IntlProvider>
    );
    expect(container).toMatchSnapshot();
  });

  it("should call onClose when close button is clicked", () => {
    const { container } = render(
      <IntlProvider locale="en">
      <AddAllergy
        onClose={onClose}
        onSave={onSave}
        patient={patient}
        provider={provider}
        severityOptions={mockSeverityData}
        allergens={mockAllergensData}
        reaction={mockReactionsData}
      />
      </IntlProvider>
    );
    fireEvent.click(container.querySelector(".close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should show Search Allergen when allergen is empty", () => {
    const { getByTestId } = render(
      <IntlProvider locale="en">
      <AddAllergy
        onClose={onClose}
        onSave={onSave}
        patient={patient}
        provider={provider}
        severityOptions={mockSeverityData}
        allergens={mockAllergensData}
        reaction={mockReactionsData}
      />
      </IntlProvider>
    );
    expect(getByTestId("search-allergen")).not.toBeNull();
  });

  it("should show Allergen List when Search is done", () => {
    render(
      <IntlProvider locale="en">
      <AddAllergy
        onClose={onClose}
        onSave={onSave}
        patient={patient}
        provider={provider}
        severityOptions={mockSeverityData}
        allergens={mockAllergensData}
        reaction={mockReactionsData}
      />
      </IntlProvider>
    );
    searchAllergen();
    expect(screen.getByText("Peanuts")).not.toBeNull();
    expect(screen.getByText("Reaction(s)")).not.toBeNull();
  });

  it("should show select reactions when allergen is selected", () => {
    render(
      <IntlProvider locale="en">
      <AddAllergy
        onClose={onClose}
        onSave={onSave}
        patient={patient}
        provider={provider}
        severityOptions={mockSeverityData}
        allergens={mockAllergensData}
        reaction={mockReactionsData}
      />
      </IntlProvider>
    );
    searchAllergen();
    expect(screen.getByTestId("search-allergen")).not.toBeNull();
    expect(screen.getByText("Reaction(s)")).not.toBeNull();

    //select allergen
    selectAllergen();

    expect(() => screen.getByTestId("search-allergen")).toThrowError();
    expect(screen.getByTestId("select-reactions")).not.toBeNull();
  });

  it("should show search Allergen ocClick of back button", () => {
    render(
      <IntlProvider locale="en">
      <AddAllergy
        onClose={onClose}
        onSave={onSave}
        patient={patient}
        provider={provider}
        severityOptions={mockSeverityData}
        allergens={mockAllergensData}
        reaction={mockReactionsData}
      />
      </IntlProvider>
    );
    searchAllergen();
    selectAllergen();
    expect(() => screen.getByTestId("search-allergen")).toThrowError();
    expect(screen.getByTestId("select-reactions")).not.toBeNull();
    fireEvent.click(screen.getByText("Back to Allergies"));
    expect(screen.getByTestId("search-allergen")).not.toBeNull();
    expect(() => screen.getByTestId("select-reactions")).toThrowError();
  });

  it("should render severity after allergen is selected", () => {
    render(
      <IntlProvider locale="en">
        <AddAllergy
          onClose={onClose}
          onSave={onSave}
          patient={patient}
          provider={provider}
          severityOptions={mockSeverityData}
          allergens={mockAllergensData}
          reaction={mockReactionsData}
        />
      </IntlProvider>
    );
    searchAllergen();

    //select allergen
    selectAllergen();

    expect(screen.getByText("Severity")).not.toBeNull();
  });

  it("should enable save button when reactions and severity are selected", () => {
    const { container } = render(
      <IntlProvider locale="en">
        <AddAllergy
          onClose={onClose}
          onSave={onSave}
          patient={patient}
          provider={provider}
          severityOptions={mockSeverityData}
          allergens={mockAllergensData}
          reaction={mockReactionsData}
        />
      </IntlProvider>
    );
    searchAllergen();
    selectAllergen();
    //select reaction
    expect(screen.getByText("Save").getAttribute("disabled")).not.toBeNull();
    selectReaction(container);
    selectSeverity(container);
    expect(screen.getByText("Save").getAttribute("disabled")).toBeNull();
  });

  it("should update severity when severity is changed", () => {
    const { container } = render(
      <IntlProvider locale="en">
      <AddAllergy
        onClose={onClose}
        onSave={onSave}
        patient={patient}
        provider={provider}
        severityOptions={mockSeverityData}
        allergens={mockAllergensData}
        reaction={mockReactionsData}
      />
      </IntlProvider>
    );
    searchAllergen();
    selectAllergen();
    selectSeverity(container);
  });

  it("should render the textarea with the correct placeholder", async () => {
    const { container, getByTestId } = render(
      <IntlProvider locale="en">
      <AddAllergy
        onClose={onClose}
        onSave={onSave}
        patient={patient}
        provider={provider}
        severityOptions={mockSeverityData}
        allergens={mockAllergensData}
        reaction={mockReactionsData}
      />
      </IntlProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Save").getAttribute("disabled")).not.toBeNull();
    });

    searchAllergen();
    selectAllergen();

    const textArea = getByTestId("additional-comments");
    expect(textArea.placeholder).toBe(
      "Additional comments such as onset date etc."
    );
  });

  it("should save allergies successfully and set isSaveSuccess to true", async () => {
    const { container } = render(
      <IntlProvider locale="en">
      <AddAllergy
        onClose={onClose}
        onSave={onSave}
        patient={patient}
        provider={provider}
        severityOptions={mockSeverityData}
        allergens={mockAllergensData}
        reaction={mockReactionsData}
      />
      </IntlProvider>
    );
    saveAllergiesAPICall.mockResolvedValueOnce({ status: 201 });
    searchAllergen();
    selectAllergen();
    selectReaction(container);
    selectSeverity(container);
    const textArea = screen.getByPlaceholderText("Additional comments such as onset date etc.");
    expect(textArea).toBeTruthy();
    fireEvent.change(textArea, { target: { value: "New notes" } });
    fireEvent.blur(textArea);
    fireEvent.click(screen.getByText("Save"));

    expect(saveAllergiesAPICall).toHaveBeenCalledWith({
      allergen: {
        allergenType: "FOOD",
        codedAllergen : {uuid: "162302AAAAAA"}
      },
      reactions: [{reaction: { uuid: "101AA"}}],
      severity: { uuid: "162301AAAAAA"},
      comment: "New notes",
    }, "patient#1");
  });

  it("should set isSaveSuccess to false if saveAllergiesAPICall fails", async () => {
    const { container } = render(
      <IntlProvider locale="en">
      <AddAllergy
        onClose={onClose}
        onSave={onSave}
        patient={patient}
        provider={provider}
        severityOptions={mockSeverityData}
        allergens={mockAllergensData}
        reaction={mockReactionsData}
      />
      </IntlProvider> 
    );
    searchAllergen();
    selectAllergen();
    selectReaction(container);
    selectSeverity(container);

    saveAllergiesAPICall.mockResolvedValueOnce({ status: 400 });

    fireEvent.click(screen.getByText("Save"));
    expect(saveAllergiesAPICall).toHaveBeenCalledWith({
      allergen: {
        allergenType: "FOOD",
        codedAllergen : {uuid: "162302AAAAAA"}
      },
      reactions: [{reaction: { uuid: "101AA"}}],
      severity: { uuid: "162301AAAAAA"},
      comment: "",
    }, "patient#1");

  });
});
