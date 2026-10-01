/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import React from "react";
import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { PatientAlergiesControl } from "./PatientAlergiesControl";
import { IntlProvider } from "react-intl";
import { getNoKnownAllergyUuid, getOtherNonCodedAllergenUuid } from "../../utils/PatientAllergiesControl/AllergyControlUtils";

const mockMedicationResponseData = {
  uuid: "100340AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  display: "Reference application allergic reactions",
  setMembers: [
    {
      uuid: "100341AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      display: "Allergic to bee stings",
      name:
        {
          uuid: "100342AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          display: "Bee sting",
        }
    },
    {
      uuid: "100342AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      display: "Allergic to cats",
      name:
        {
          uuid: "100342AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          display: "Cat",
        }
    },
    {
      uuid: "100343AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      display: "Allergic to dust",
      name:
        {
          uuid: "100343AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
          display: "Dust",
        }
    },
  ],
};
const mockAllergies = {
  resourceType: "Bundle",
  id: "bc0e5930-dd91-4fcd-92a6-62c8f87569a3",
  entry: [
    {
      resource: {
        resourceType: "AllergyIntolerance",
        id: "eb96124f-0dfc-4194-8567-e033a68b0b42",
        type: "allergy",
        category: [
          "food"
        ],
        criticality: "unable-to-assess",
        code: {
          coding: [
            {
              code: "547c5ebf-b064-4541-bf79-70a0bebd2bc5",
              display: "Eggs"
            }
          ]
        },
        recordedDate: "2023-10-04T23:27:44+05:30",
        reaction: [
          {
            substance: {
              coding: [
                {
                  code: "547c5ebf-b064-4541-bf79-70a0bebd2bc5",
                  display: "Eggs"
                }
              ]
            },
            manifestation: [
              {
                coding: [
                  {
                    code: "1171f21f-1810-496f-b8db-ea8dc9d05940",
                    display: "Mental status change"
                  }
                ]
              }
            ],
            severity: "moderate"
          }
        ]
      }
    }
  ]
}

const mockFetchAllergensOrReactions = jest
  .fn()
  .mockResolvedValue(mockMedicationResponseData);

const mockFetchAllergiesAndReactionsForPatient = jest.fn().mockResolvedValue(mockAllergies);

jest.mock("../../utils/PatientAllergiesControl/AllergyControlUtils", () => ({
  fetchAllergensOrReactions: (conceptId) => mockFetchAllergensOrReactions(conceptId),
  fetchAllergiesAndReactionsForPatient: () => mockFetchAllergiesAndReactionsForPatient(),
  getNoKnownAllergyUuid: jest.fn().mockResolvedValue("no_known_allergy_code_uuid"),
  getOtherNonCodedAllergenUuid: jest.fn().mockResolvedValue("other_non_coded_allergen_uuid")
}));

jest.mock("../../Components/i18n/I18nProvider", () => ({
  I18nProvider: ({ children }) => <div>{children}</div>
}));

const testHostData = {
  patient: {
    uuid: "___patient_uuid__",
    givenName: "___patient_given_name__",
  },
  provider: {
    uuid: "provider#1",
    name: "demo provider"
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
    allergySeverityUuid: "allergy_severity_Uuid",
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
    allergySeverityUuid: "allergy_severity_Uuid",
  },
};
const mockAppService = {
  getAppDescriptor: () => ({
        getConfigValue: param => true
      }
  )
}

describe("PatientAlergiesControl", () => {
  it("renders loading message when isLoading is true", () => {
    render(<IntlProvider locale="en">
      <PatientAlergiesControl hostData={testHostData} appService={mockAppService}/>
    </IntlProvider>);
    expect(screen.getByText("Loading... Please Wait")).not.toBeNull();
  });

  it("renders allergies section when isLoading is false", async () => {
    render(
      <IntlProvider locale="en">
        <PatientAlergiesControl hostData={testHostData} appService={mockAppService}/>;
      </IntlProvider>
    );
    await waitFor(() => {
      expect(screen.getByText("Allergies")).not.toBeNull();
    });
  });

  it("renders allergies section with Add button when active visit", async () => {
    const { container } = render(
      <IntlProvider locale="en">
        <PatientAlergiesControl hostData={testHostData} appService={mockAppService}/>
      </IntlProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Add +")).not.toBeNull();
      expect(container.querySelector(".add-button")).not.toBeNull();
    });
  });

  it("renders allergies section without Add button when it is not active visit", async () => {
    const { container } = render(
      <IntlProvider locale="en">
        <PatientAlergiesControl hostData={testHostDataWithoutActiveVisit} appService={mockAppService}/>
      </IntlProvider>
    );

    await waitFor(() => {
      expect(container.querySelector(".add-button")).toBeNull();
    });
  });

  it("should show the side panel when add button is clicked", async () => {
    const { container } = render(
      <IntlProvider locale="en">
        <PatientAlergiesControl hostData={testHostData} appService={mockAppService}/>
      </IntlProvider>
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
      <IntlProvider locale="en">
        <PatientAlergiesControl hostData={testHostData} appService={mockAppService}/>
      </IntlProvider>
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

  it("should fetch noKnownAllergyUuid even when enableNoKnownAllergy toggle is off", async () => {
    const mockAppServiceToggleOff = {
      getAppDescriptor: () => ({
        getConfigValue: () => false
      })
    };
    render(
      <IntlProvider locale="en">
        <PatientAlergiesControl hostData={testHostData} appService={mockAppServiceToggleOff}/>
      </IntlProvider>
    );
    await waitFor(() => {
      expect(getNoKnownAllergyUuid).toHaveBeenCalled();
    });
  });

  describe("Other, Non-Coded allergen display", () => {
    // fhir2 always returns "Other" as coding[0].display for this concept -
    // the free-text name only appears in code.text. Every saved "Other"
    // allergy shares the same coding, so relying on coding[0].display alone
    // shows "Other" for all of them instead of each one's specified name.
    const otherNonCodedAllergyEntry = (id, freeTextName) => ({
      resource: {
        resourceType: "AllergyIntolerance",
        id,
        type: "allergy",
        category: ["medication"],
        criticality: "unable-to-assess",
        code: {
          coding: [
            {
              code: "other_non_coded_allergen_uuid",
              display: "Other"
            }
          ],
          text: freeTextName
        },
        recordedDate: "2023-10-04T23:27:44+05:30",
        reaction: [
          {
            manifestation: [
              {
                coding: [
                  { code: "108AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", display: "Bronchospasm" }
                ]
              }
            ],
            severity: "mild"
          }
        ]
      }
    });

    it("shows each Other allergy's own specified name, not the generic 'Other' coding display", async () => {
      mockFetchAllergiesAndReactionsForPatient.mockResolvedValueOnce({
        resourceType: "Bundle",
        entry: [
          otherNonCodedAllergyEntry("allergy-1", "ABC"),
          otherNonCodedAllergyEntry("allergy-2", "BCG"),
          otherNonCodedAllergyEntry("allergy-3", "XYZ"),
        ],
      });

      render(
        <IntlProvider locale="en">
          <PatientAlergiesControl hostData={testHostData} appService={mockAppService}/>
        </IntlProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("ABC")).not.toBeNull();
      });
      expect(screen.getByText("BCG")).not.toBeNull();
      expect(screen.getByText("XYZ")).not.toBeNull();
      expect(() => screen.getByText("Other")).toThrow();
    });

    it("still shows the coded display name for a regular coded allergy without code.text", async () => {
      mockFetchAllergiesAndReactionsForPatient.mockResolvedValueOnce(mockAllergies);

      render(
        <IntlProvider locale="en">
          <PatientAlergiesControl hostData={testHostData} appService={mockAppService}/>
        </IntlProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Eggs")).not.toBeNull();
      });
    });

    it("shows coding[0].display, not code.text, for a regular allergy whose code.text differs from it", async () => {
      // A regular coded allergy is never expected to have a code.text that
      // diverges from its coding display, but this proves the display logic
      // doesn't just trust code.text whenever it's present — only for the
      // concept the backend confirmed is Other, Non-Coded (matched by uuid).
      mockFetchAllergiesAndReactionsForPatient.mockResolvedValueOnce({
        resourceType: "Bundle",
        entry: [
          {
            resource: {
              ...mockAllergies.entry[0].resource,
              code: {
                coding: mockAllergies.entry[0].resource.code.coding,
                text: "Some unrelated free text",
              },
            },
          },
        ],
      });

      render(
        <IntlProvider locale="en">
          <PatientAlergiesControl hostData={testHostData} appService={mockAppService}/>
        </IntlProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Eggs")).not.toBeNull();
      });
      expect(() => screen.getByText("Some unrelated free text")).toThrow();
    });
  });

  describe("Other, Non-Coded allergen selectability (global property resolution)", () => {
    it("keeps the Add button disabled while allergy.concept.otherNonCoded hasn't resolved yet", async () => {
      let resolveOtherNonCoded;
      getOtherNonCodedAllergenUuid.mockImplementationOnce(
        () => new Promise((resolve) => { resolveOtherNonCoded = resolve; }),
      );

      const { container } = render(
        <IntlProvider locale="en">
          <PatientAlergiesControl hostData={testHostData} appService={mockAppService}/>
        </IntlProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Allergies")).not.toBeNull();
      });
      // Still unresolved: the button must not be rendered yet, or this
      // install could let a user select "Other, Non-Coded" with no way to
      // tell it apart from a regular allergen — reproducing the 500.
      expect(container.querySelector(".add-button")).toBeNull();

      resolveOtherNonCoded("other_non_coded_allergen_uuid");
      await waitFor(() => {
        expect(container.querySelector(".add-button")).not.toBeNull();
      });
    });

    it("keeps the Add button disabled when allergy.concept.otherNonCoded fails to resolve, and logs the failure", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      getOtherNonCodedAllergenUuid.mockRejectedValueOnce(new Error("global property not found"));

      const { container } = render(
        <IntlProvider locale="en">
          <PatientAlergiesControl hostData={testHostData} appService={mockAppService}/>
        </IntlProvider>
      );

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining("allergy.concept.otherNonCoded"),
          expect.any(Error),
        );
      });
      expect(container.querySelector(".add-button")).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Other, Non-Coded allergen extraction across categories (real pipeline)", () => {
    // 5622AAAA ("Other, Non-Coded") is a genuine member of the CIEL drug,
    // food and environment allergen answer sets in a standard Bahmni
    // dictionary — so it's expected to appear once per category it actually
    // belongs to, tagged with that category's kind, not merged into one and
    // not leaking into a category it isn't a member of (environment, here).
    const conceptSet = (uuid, members) => ({ uuid, setMembers: members });
    const OTHER_NON_CODED = {
      uuid: "other_non_coded_allergen_uuid",
      display: "Other",
    };

    it("appears under every category it is a real setMember of, with that category's kind, and not under others", async () => {
      mockFetchAllergensOrReactions.mockImplementation((conceptId) => {
        switch (conceptId) {
          case "drug_allergen_Uuid":
            return Promise.resolve(conceptSet("drug_allergen_Uuid", [OTHER_NON_CODED]));
          case "food_allergen_Uuid":
            return Promise.resolve(conceptSet("food_allergen_Uuid", [OTHER_NON_CODED]));
          case "environmental_allergen_Uuid":
            // Deliberately does NOT include OTHER_NON_CODED.
            return Promise.resolve(conceptSet("environmental_allergen_Uuid", []));
          case "allergy_reaction_Uuid":
            return Promise.resolve({
              setMembers: [{ uuid: "reaction-1", name: { display: "Hives" } }],
            });
          case "allergy_severity_Uuid":
            return Promise.resolve({
              setMembers: [{ uuid: "severity-1", display: "Mild" }],
              answers: [],
            });
          default:
            return Promise.resolve({ setMembers: [] });
        }
      });

      const { container } = render(
        <IntlProvider locale="en">
          <PatientAlergiesControl hostData={testHostData} appService={mockAppService}/>
        </IntlProvider>
      );

      await waitFor(() => {
        expect(container.querySelector(".add-button")).not.toBeNull();
      });
      fireEvent.click(container.querySelector(".add-button"));

      const searchInput = screen.getByRole("searchbox");
      fireEvent.change(searchInput, { target: { value: "Other" } });

      const drugTag = screen.getAllByText("Drug");
      const foodTag = screen.getAllByText("Food");
      expect(drugTag.length).toBeGreaterThan(0);
      expect(foodTag.length).toBeGreaterThan(0);
      expect(screen.queryAllByText("Environment")).toHaveLength(0);
      // Exactly one "Other" entry per category it's actually a member of —
      // not deduplicated into a single result, not tripled into all three.
      expect(screen.getAllByText("Other")).toHaveLength(2);

      // Restore the module-level default so later tests in this file (if
      // any are ever added after this one) aren't affected by this override.
      mockFetchAllergensOrReactions.mockResolvedValue(mockMedicationResponseData);
    });
  });
});
