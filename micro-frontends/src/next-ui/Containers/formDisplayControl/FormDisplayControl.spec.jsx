import React from "react";
import moment from "moment";
import { render, screen, waitFor } from "@testing-library/react";
import { FormDisplayControl } from "./FormDisplayControl";
import {
  mockFormResponseData,
  mockLatestPublishedForms,
  mockFormResponseDataForPrivilege,
  mockLatestPublishedFormsWithEditPrivileges,
  mockLatestPublishedFormsWithViewPrivileges,
  mockLatestPublishedFormsWithBothViewEditPrivileges,
  mockLatestPublishedFormsWithoutBothViewEditPrivileges,
} from "./FormDisplayControlMockData";
import { defaultDateTimeFormat } from "../../constants";

const mockFetchFormData = jest.fn();
const mockGetLatestPublishedForms = jest.fn();

jest.mock("../../utils/FormDisplayControl/FormUtils", () => ({
  fetchFormData: () => mockFetchFormData(),
  getLatestPublishedForms: () => mockGetLatestPublishedForms(),
}));

jest.mock("../../Components/i18n/I18nProvider", () => ({
  I18nProvider: ({ children }) => <div>{children}</div>,
}));

const mockHostData = {
  patientUuid: "some-patient-uuid",
  showEditForActiveEncounter: true,
  encounterUuid: "some-encounter-uuid",
};

const activeEncounterMockHostDataWithPrivileges = {
  patientUuid: "some-patient-uuid",
  showEditForActiveEncounter: true,
  encounterUuid: "6e52cecd-a095-457f-9515-38cf9178cb50",
  currentUser: {
    privileges: [
      {
        name: "View/Edit Forms",
        retired: false,
      },
    ],
  },
};

describe("FormDisplayControl Component for empty mock data", () => {
  it("should show no-forms-message when form entries are empty", async () => {
    const mockWithPatientHostData = {
      patientUuid: "some-patient-uuid",
      encounterUuid: undefined,
    };
    mockFetchFormData.mockResolvedValueOnce({});

    const { container } = render(
      <FormDisplayControl hostData={mockWithPatientHostData} />
    );

    await waitFor(() => {
      expect(
        screen.getByText("No Form found for this patient....")
      ).toBeTruthy();
      expect(
        container.querySelector(".placeholder-text-forms-control").innerHTML
      ).toEqual("No Form found for this patient....");
    });
  });
});

describe("FormDisplayControl Component", () => {
  it("should render the component", () => {
    const { container } = render(
      <FormDisplayControl hostData={mockHostData} />
    );
    expect(container).toMatchSnapshot();
  });

  it("should show loading message", () => {
    const { container } = render(
      <FormDisplayControl hostData={mockHostData} />
    );
    expect(container.querySelector(".loading-message")).not.toBeNull();
    expect(container.querySelector(".loading-message").innerHTML).toEqual(
      "Loading... Please Wait"
    );
  });
});

describe("FormDisplayControl Component with Accordion and Non-Accordion", () => {
  beforeEach(() => {
    mockFetchFormData.mockResolvedValue(mockFormResponseData);
    mockGetLatestPublishedForms.mockResolvedValue(mockLatestPublishedForms);
  });
  // TODO: fix this test
  //  it("should render the component with form data", async() => {
  //   mockFetchFormData.mockResolvedValueOnce(mockFormResponseData);
  //   const { container } = render(<FormDisplayControl hostData={mockHostData} />);
  //   await waitFor(() => {
  //     expect(container).toMatchSnapshot();
  //   });
  // });

  it("should render accordion form entries when loading is done", async () => {
    const { container } = render(
      <FormDisplayControl hostData={mockHostData} />
    );

    await waitFor(() => {
      expect(container.querySelectorAll(".bx--accordion__title")).toHaveLength(
        1
      );
      expect(
        container.querySelector(".bx--accordion__title").innerHTML
      ).toEqual("Pre Anaesthesia Assessment");
      expect(
        container.querySelector(".row-accordion > .form-name-text > .form-link")
          .innerHTML
      ).toEqual(moment(1693217959000).format(defaultDateTimeFormat));
      expect(
        container.querySelector(".row-accordion > .form-provider-text")
          .innerHTML
      ).toEqual("Doctor One");
    });
  });

  it("should render non-accordion form entries when loading is done", async () => {
    const { container } = render(
      <FormDisplayControl hostData={mockHostData} />
    );

    await waitFor(() => {
      expect(
        container.querySelectorAll(".form-non-accordion-text")
      ).toHaveLength(6);
      expect(
        container.querySelectorAll(".form-non-accordion-text.form-heading")[0]
          .innerHTML
      ).toEqual("Orthopaedic Triage");
      expect(
        container.querySelectorAll(
          ".form-non-accordion-text.form-date-align > a"
        )[0].innerHTML
      ).toEqual(moment(1693277657000).format(defaultDateTimeFormat));
      expect(
        container.querySelectorAll(".form-non-accordion-text")[2].innerHTML
      ).toEqual("Doctor Two");
      expect(
        container.querySelectorAll(".form-non-accordion-text.form-heading")[1]
          .innerHTML
      ).toEqual("Patient Progress Notes and Orders");
      expect(
        container.querySelectorAll(
          ".form-non-accordion-text.form-date-align > a"
        )[1].innerHTML
      ).toEqual(moment(1693277657000).format(defaultDateTimeFormat));
      expect(
        container.querySelectorAll(".form-non-accordion-text")[5].innerHTML
      ).toEqual("Doctor One");
    });
  });

  it("should not see edit button for non-active-encounter entries and when showEditForActiveEncounter is true", async () => {
    const { container } = render(
      <FormDisplayControl hostData={mockHostData} />
    );

    await waitFor(() => {
      expect(container.querySelectorAll(".fa.fa-pencil")).toHaveLength(0);
    });
  });

  it("should see edit button for active-encounter entries and when showEditForActiveEncounter is true", async () => {
    const activeEncounterMockHostData = {
      patientUuid: "some-patient-uuid",
      showEditForActiveEncounter: true,
      encounterUuid: "6e52cecd-a095-457f-9515-38cf9178cb50",
    };
    const { container } = render(
      <FormDisplayControl hostData={activeEncounterMockHostData} />
    );

    await waitFor(() => {
      expect(container.querySelectorAll(".fa.fa-pencil")).toHaveLength(2);
    });
  });

  it("should see edit button for all entries and when showEditForActiveEncounter is false", async () => {
    const activeEncounterMockHostData = {
      patientUuid: "some-patient-uuid",
      showEditForActiveEncounter: false,
      encounterUuid: "6e52cecd-a095-457f-9515-38cf9178cb50",
    };
    const { container } = render(
      <FormDisplayControl hostData={activeEncounterMockHostData} />
    );

    await waitFor(() => {
      expect(container.querySelectorAll(".fa.fa-pencil")).toHaveLength(4);
    });
  });

  it("should see edit button for all entries and when showEditForActiveEncounter is not present", async () => {
    const activeEncounterMockHostData = {
      patientUuid: "some-patient-uuid",
      encounterUuid: "6e52cecd-a095-457f-9515-38cf9178cb50",
    };
    const { container } = render(
      <FormDisplayControl hostData={activeEncounterMockHostData} />
    );

    await waitFor(() => {
      expect(container.querySelectorAll(".fa.fa-pencil")).toHaveLength(4);
    });
  });

  it("should see edit button based on privilege", async () => {
    mockFetchFormData.mockResolvedValue(mockFormResponseDataForPrivilege);
    mockGetLatestPublishedForms.mockResolvedValue(
      mockLatestPublishedFormsWithEditPrivileges
    );

    const { container } = render(
      <FormDisplayControl
        hostData={activeEncounterMockHostDataWithPrivileges}
      />
    );

    await waitFor(() => {
      expect(container.querySelectorAll(".form-link")).toHaveLength(0);
      expect(container.querySelectorAll(".fa.fa-pencil")).toHaveLength(1);
    });
  });

  it("should see view button based on privilege", async () => {
    mockFetchFormData.mockResolvedValue(mockFormResponseDataForPrivilege);
    mockGetLatestPublishedForms.mockResolvedValue(
      mockLatestPublishedFormsWithViewPrivileges
    );

    const { container } = render(
      <FormDisplayControl
        hostData={activeEncounterMockHostDataWithPrivileges}
      />
    );

    await waitFor(() => {
      expect(container.querySelectorAll(".form-link")).toHaveLength(1);
      expect(container.querySelectorAll(".fa.fa-pencil")).toHaveLength(0);
    });
  });

  it("should see view button based on privilege", async () => {
    mockFetchFormData.mockResolvedValue(mockFormResponseDataForPrivilege);
    mockGetLatestPublishedForms.mockResolvedValue(
      mockLatestPublishedFormsWithBothViewEditPrivileges
    );

    const { container } = render(
      <FormDisplayControl
        hostData={activeEncounterMockHostDataWithPrivileges}
      />
    );

    await waitFor(() => {
      expect(container.querySelectorAll(".form-link")).toHaveLength(1);
      expect(container.querySelectorAll(".fa.fa-pencil")).toHaveLength(1);
    });
  });

  it("should see view button based on privilege", async () => {
    mockFetchFormData.mockResolvedValue(mockFormResponseDataForPrivilege);
    mockGetLatestPublishedForms.mockResolvedValue(
      mockLatestPublishedFormsWithoutBothViewEditPrivileges
    );

    const { container } = render(
      <FormDisplayControl
        hostData={activeEncounterMockHostDataWithPrivileges}
      />
    );

    await waitFor(() => {
      expect(container.querySelectorAll(".form-link")).toHaveLength(0);
      expect(container.querySelectorAll(".fa.fa-pencil")).toHaveLength(0);
    });
  });
});
