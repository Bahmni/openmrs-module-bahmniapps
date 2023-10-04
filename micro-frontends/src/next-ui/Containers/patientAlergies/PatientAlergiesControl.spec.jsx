import React from "react";
import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { PatientAlergiesControl } from "./PatientAlergiesControl";

const mockMedicationResponseData = {
  uuid: "100340AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  display: "Reference application allergic reactions",
  setMembers: [
    {
      uuid: "100341AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      display: "Allergic to bee stings",
      names: [
        {
          uuid: "100342AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          display: "Bee sting",
        },
      ],
    },
    {
      uuid: "100342AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      display: "Allergic to cats",
      names: [
        {
          uuid: "100342AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          display: "Cat",
        },
      ],
    },
    {
      uuid: "100343AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      display: "Allergic to dust",
      names: [
        {
          uuid: "100343AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          display: "Dust",
        },
      ],
    },
  ],
};

const mockFetchAllergensOrReactions = jest
  .fn()
  .mockResolvedValue(mockMedicationResponseData);

jest.mock("../../utils/PatientAllergiesControl/AllergyControlUtils", () => ({
  fetchAllergensOrReactions: () => mockFetchAllergensOrReactions(),
}));

jest.mock("../../Components/i18n/I18nProvider", () => ({
  I18nProvider: ({ children }) => <div>{children}</div>
}));

const testHostData = {
  patient: {
    uuid: "___patient_uuid__",
    givenName: "___patient_given_name__",
  },
  activeVisit: {
    uuid: "___visit_uuid__",
    visitType: {
      uuid: "___visit_type_uuid__",
    },
  },
  allergyControlConceptIdMap: {
    medicationAllergenUuid: "drug_allergen_Uuid",
    foodAllergenUuid: "food_allergen_Uuid",
    environmentalAllergenUuid: "environmental_allergen_Uuid",
    allergyReactionUuid: "allergy_reaction_Uuid",
  },
};
const testHostDataWithoutActiveVisit = {
  patient: {
    uuid: "___patient_uuid__",
    givenName: "___patient_given_name__",
  },
  activeVisit: null,
  allergyControlConceptIdMap: {
    medicationAllergenUuid: "drug_allergen_Uuid",
    foodAllergenUuid: "food_allergen_Uuid",
    environmentalAllergenUuid: "environmental_allergen_Uuid",
    allergyReactionUuid: "allergy_reaction_Uuid",
  },
};

describe("PatientAlergiesControl", () => {
  it("renders loading message when isLoading is true", () => {
    render(<PatientAlergiesControl hostData={testHostData} />);
    expect(screen.getByText("Loading... Please Wait")).not.toBeNull();
  });

  it("renders allergies section when isLoading is false", async () => {
    render(<PatientAlergiesControl hostData={testHostData} />);

    await waitFor(() => {
      expect(screen.getByText("Allergies")).not.toBeNull();
    });
  });

  it("renders allergies section with Add button when active visit", async () => {
    const { container } = render(
      <PatientAlergiesControl hostData={testHostData} />
    );

    await waitFor(() => {
      expect(screen.getByText("Add +")).not.toBeNull();
      expect(container.querySelector(".add-button")).not.toBeNull();
    });
  });

  it("renders allergies section without Add button when it is not active visit", async () => {
    const { container } = render(
      <PatientAlergiesControl hostData={testHostDataWithoutActiveVisit} />
    );

    await waitFor(() => {
      expect(container.querySelector(".add-button")).toBeNull();
    });
  });

  it("should show the side panel when add button is clicked", async () => {
    const { container } = render(
      <PatientAlergiesControl hostData={testHostData} />
    );

    await waitFor(() => {
      expect(screen.getByText("Add +")).toBeTruthy();
    });

    const addButton = container.querySelector(".add-button");
    fireEvent.click(addButton);
    expect(container.querySelector(".overlay-next-ui")).not.toBeNull();
  });

  it("should not show the side panel when Cancel button is clicked", async () => {
    const { container, getByTestId } = render(
      <PatientAlergiesControl hostData={testHostData} />
    );
    await waitFor(() => {
      expect(screen.getByText("Add +")).toBeTruthy();
    });

    const addButton = container.querySelector(".add-button");
    fireEvent.click(addButton);
    expect(container.querySelector(".overlay-next-ui")).not.toBeNull();

    fireEvent.click(getByTestId("cancel"));
    expect(container.querySelector(".overlay-next-ui")).toBeNull();
  });
});
