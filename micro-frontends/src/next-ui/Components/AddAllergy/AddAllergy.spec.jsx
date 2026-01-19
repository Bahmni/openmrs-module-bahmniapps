import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { render, fireEvent, screen, act } from "@testing-library/react";
import { AddAllergy } from "./AddAllergy";
import {
  saveAllergiesAPICall
} from "../../utils/PatientAllergiesControl/AllergyControlUtils";

jest.mock('../../utils/PatientAllergiesControl/AllergyControlUtils', () => ({
  saveAllergiesAPICall: jest.fn(),
}));
import { IntlProvider } from "react-intl";

const mockAllergensData = [
  { name: "Eggs", kind: "Food", uuid: "162301AAAAAA" },
  { name: "Peanuts", kind: "Food", uuid: "162302AAAAAA" },
  { name: "Seafood", kind: "Food", uuid: "162303AAAAAA" },
  { name: "Bee", kind: "Environment", uuid: "162304AAAAAA" },
  { name: "Serum", kind: "Biological", uuid: "162305AAAAAA" },
  { name: "Penicillin", kind: "Medication", uuid: "162306AAAAAA" },
  { name: "Narcotic agent", kind: "Medication", uuid: "162307AAAAAA" },
];

const mockExistingAllergies = [
  { name: "Milk", kind: "Food", uuid: "162308AAAAAA" }
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
        existingAllergies={[mockExistingAllergies]}
        reaction={mockReactionsData}
        noKnownAllergyUuid={"000000AAAAAA"}
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
        existingAllergies={[mockExistingAllergies]}
        noKnownAllergyUuid={"000000AAAAAA"}
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
        existingAllergies={[mockExistingAllergies]}
        noKnownAllergyUuid={"000000AAAAAA"}
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
        existingAllergies={[mockExistingAllergies]}
        noKnownAllergyUuid={"000000AAAAAA"}
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
        existingAllergies={[mockExistingAllergies]}
        noKnownAllergyUuid={"000000AAAAAA"}
      />
      </IntlProvider>
    );
    searchAllergen();
    expect(screen.getByTestId("search-allergen")).not.toBeNull();
    expect(screen.getByText("Reaction(s)")).not.toBeNull();

    //select allergen
    selectAllergen();

    expect(() => screen.getByTestId("search-allergen")).toThrow();
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
        existingAllergies={[mockExistingAllergies]}
        noKnownAllergyUuid={"000000AAAAAA"}
      />
      </IntlProvider>
    );
    searchAllergen();
    selectAllergen();
    expect(() => screen.getByTestId("search-allergen")).toThrow();
    expect(screen.getByTestId("select-reactions")).not.toBeNull();
    fireEvent.click(screen.getByText("Back to Allergies"));
    expect(screen.getByTestId("search-allergen")).not.toBeNull();
    expect(() => screen.getByTestId("select-reactions")).toThrow();
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
          existingAllergies={[mockExistingAllergies]}
          noKnownAllergyUuid={"000000AAAAAA"}
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
          existingAllergies={[mockExistingAllergies]}
          noKnownAllergyUuid={"000000AAAAAA"}
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
        existingAllergies={[mockExistingAllergies]}
        noKnownAllergyUuid={"000000AAAAAA"}
      />
      </IntlProvider>
    );
    searchAllergen();
    selectAllergen();
    selectSeverity(container);
    expect(screen.getByText("Severity")).not.toBeNull();
  });

  it("should render the textarea with the correct placeholder", async () => {
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
        existingAllergies={[mockExistingAllergies]}
        noKnownAllergyUuid={"000000AAAAAA"}
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
        existingAllergies={[mockExistingAllergies]}
        noKnownAllergyUuid={"000000AAAAAA"}
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
        existingAllergies={[mockExistingAllergies]}
        noKnownAllergyUuid={"000000AAAAAA"}
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

  it("should show known allergy selector when existingAllergies is empty", () => {
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
              existingAllergies={[]}
              noKnownAllergyUuid={"000000AAAAAA"}
          />
        </IntlProvider>
    );
    expect(screen.getByText("Does the patient have any known allergies?")).not.toBeNull();
  });

  it("should not show known allergy selector when existingAllergies is not empty", () => {
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
              existingAllergies={mockExistingAllergies}
              noKnownAllergyUuid={"000000AAAAAA"}
          />
        </IntlProvider>
    );
    expect(() => screen.getByText("Does the patient have any known allergies?")).toThrow();
  });

  it("should filter out 'No Known Allergy' from allergens when existingAllergies is not empty", () => {
    const allergensWithNoKnown = [
      ...mockAllergensData,
      { name: "No Known Allergy", kind: "Other", uuid: "000000AAAAAA" }
    ];
    render(
        <IntlProvider locale="en">
          <AddAllergy
              onClose={onClose}
              onSave={onSave}
              patient={patient}
              provider={provider}
              severityOptions={mockSeverityData}
              allergens={allergensWithNoKnown}
              reaction={mockReactionsData}
              existingAllergies={[mockExistingAllergies]}
              noKnownAllergyUuid={"000000AAAAAA"}
          />
        </IntlProvider>
    );
    searchAllergen();
    expect(() => screen.getByText("No Known Allergy")).toThrow();
  });

  it("should handle 'No' selection in known allergy radio button", () => {
    const allergensWithNoKnown = [
      ...mockAllergensData,
      { name: "No Known Allergy", kind: "Other", uuid: "000000AAAAAA" }
    ];
    render(
        <IntlProvider locale="en">
          <AddAllergy
              onClose={onClose}
              onSave={onSave}
              patient={patient}
              provider={provider}
              severityOptions={mockSeverityData}
              allergens={allergensWithNoKnown}
              reaction={mockReactionsData}
              existingAllergies={[]}
              noKnownAllergyUuid="000000AAAAAA"
          />
        </IntlProvider>
    );
    const noButton = screen.getByLabelText("No");
    fireEvent.click(noButton);
    expect(screen.getByText("No known allergy")).not.toBeNull();
    expect(screen.getByText("Save").getAttribute("disabled")).toBeNull();
  });

  it("should handle 'Yes' selection in known allergy radio button", () => {
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
              existingAllergies={[]}
              noKnownAllergyUuid={"000000AAAAAA"}
          />
        </IntlProvider>
    );
    const yesButton = screen.getByLabelText("Yes");
    fireEvent.click(yesButton);
    expect(getByTestId("search-allergen")).not.toBeNull();
    expect(screen.getByText("Save").getAttribute("disabled")).not.toBeNull();
  });
});
