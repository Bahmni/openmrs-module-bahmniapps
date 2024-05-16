import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { FormDisplayControl } from "./FormDisplayControl";
import { mockFormResponseData, mockLatestPublishedForms, mockEncounterData } from "./FormDisplayControlMockData";
import { fetchFormData, getLatestPublishedForms } from '../../utils/FormDisplayControl/FormUtils';
import { formatDate } from "../../utils/utils";
import {defaultDateTimeFormat} from "../../constants";
import { I18nProvider } from '../../Components/i18n/I18nProvider';

const mockFetchFormData = jest.fn();
const mockGetLatestPublishedForms = jest.fn();
const mockOpenEditObservationForm = jest.fn();
const mockHostApi = {
  handleEditSave: jest.fn(),
};
const mockFindByEncounterUuid = jest.fn();
const mockBuildFormMap = jest.fn();

jest.mock("../../utils/FormDisplayControl/FormUtils", () => ({
  fetchFormData: () => mockFetchFormData(),
  getLatestPublishedForms: () => mockGetLatestPublishedForms(),
  openEditObservationForm: () => mockOpenEditObservationForm(),
}));

jest.mock('../../utils/FormDisplayControl/FormUtils');

jest.mock("../../Components/i18n/I18nProvider", () => ({
  I18nProvider: ({ children }) => <div>{children}</div>
}));

jest.mock("../../utils/FormDisplayControl/FormView", () => ({
  findByEncounterUuid: () => mockFindByEncounterUuid(),
  buildFormMap: () => mockBuildFormMap()
}));

jest.mock("../../utils/FormDisplayControl/BuildFormView")

const mockHostData = {
  patientUuid: 'some-patient-uuid',
  showEditForActiveEncounter: true,
  encounterUuid: 'some-encounter-uuid'
};

describe('FormDisplayControl Component for empty mock data', () => {
  it('should show no-forms-message when form entries are empty', async () => {
    const mockWithPatientHostData = {
      patientUuid: 'some-patient-uuid',
      encounterUuid: undefined
    };
    mockFetchFormData.mockResolvedValueOnce({});

    const { container } = render(<FormDisplayControl hostData={mockWithPatientHostData} />);

    await waitFor(() => {
      expect(screen.getByText('No Form found for this patient....')).toBeTruthy();
      expect(container.querySelector(".placeholder-text-forms-control").innerHTML).toEqual('No Form found for this patient....');
    });
  });
});

describe('FormDisplayControl Component', () => {

  it("should render the component", () => {
    const { container } = render(<FormDisplayControl hostData={mockHostData} />);
    expect(container).toMatchSnapshot();
  });

  it('should show loading message', () => {
    const { container } = render(<FormDisplayControl hostData={mockHostData} />);
    expect(container.querySelector('.loading-message')).not.toBeNull();
    expect(container.querySelector('.loading-message').innerHTML).toEqual('Loading... Please Wait');
  });

});

describe('FormDisplayControl Component with Accordion and Non-Accordion', () => {

  beforeEach(() => {
    mockFetchFormData.mockResolvedValue(mockFormResponseData);
    mockGetLatestPublishedForms.mockResolvedValue(mockLatestPublishedForms);
    mockOpenEditObservationForm.mockResolvedValue({});
    mockFindByEncounterUuid.mockResolvedValue(mockEncounterData);
    mockBuildFormMap.mockResolvedValue([{value: [{groupMembers: []}]}]);
  });

   it("should render the component with form data", async() => {
    const { container } = render(<FormDisplayControl hostData={mockHostData} />);
    await waitFor(() => {
      expect(container).toMatchSnapshot();
    });
  });

  it('should render accordion form entries when loading is done', async () => {
    const { container } = render(<FormDisplayControl hostData={mockHostData} />);

    await waitFor(() => {
      expect(container.querySelectorAll(".bx--accordion__title")).toHaveLength(1);
      expect(container.querySelector(".bx--accordion__title").innerHTML).toEqual('Pre Anaesthesia Assessment');
      expect(container.querySelector(".row-accordion > .form-name-text > .form-link").innerHTML).toEqual(formatDate(1693217959000));
      expect(container.querySelector(".row-accordion > .form-provider-text").innerHTML).toEqual('Doctor One');

    });
  });

  it('should render non-accordion form entries when loading is done', async () => {
    const { container } = render(<FormDisplayControl hostData={mockHostData} />);

    await waitFor(() => {
      expect(container.querySelectorAll(".form-non-accordion-text")).toHaveLength(6);
      expect(container.querySelectorAll(".form-non-accordion-text.form-heading")[0].innerHTML).toEqual('Orthopaedic Triage');
      expect(container.querySelectorAll(".form-non-accordion-text.form-date-align > a")[0].innerHTML).toEqual(formatDate(1693277657000));
      expect(container.querySelectorAll(".form-non-accordion-text")[2].innerHTML).toEqual('Doctor Two');
      expect(container.querySelectorAll(".form-non-accordion-text.form-heading")[1].innerHTML).toEqual('Patient Progress Notes and Orders');
      expect(container.querySelectorAll(".form-non-accordion-text.form-date-align > a")[1].innerHTML).toEqual(formatDate(1693277657000));
      expect(container.querySelectorAll(".form-non-accordion-text")[5].innerHTML).toEqual('Doctor One');
    });

  });

  it('should not see edit button for non-active-encounter entries and when showEditForActiveEncounter is true', async () => {
    const { container } = render(<FormDisplayControl hostData={mockHostData} />);

    await waitFor(() => {
      expect(container.querySelectorAll(".fa.fa-pencil")).toHaveLength(0);
    });
  });

  it('should see edit button for active-encounter entries and when showEditForActiveEncounter is true', async () => {
    const activeEncounterMockHostData = {
      patientUuid: 'some-patient-uuid',
      showEditForActiveEncounter: true,
      encounterUuid: '6e52cecd-a095-457f-9515-38cf9178cb50'
    };
    const { container } = render(<FormDisplayControl hostData={activeEncounterMockHostData} />);

    await waitFor(() => {
      expect(container.querySelectorAll(".fa.fa-pencil")).toHaveLength(2);
    });
  });

  it('should see edit button for all entries and when showEditForActiveEncounter is false', async () => {
    const activeEncounterMockHostData = {
      patientUuid: 'some-patient-uuid',
      showEditForActiveEncounter: false,
      encounterUuid: '6e52cecd-a095-457f-9515-38cf9178cb50'
    };
    const { container } = render(<FormDisplayControl hostData={activeEncounterMockHostData} />);

    await waitFor(() => {
      expect(container.querySelectorAll(".fa.fa-pencil")).toHaveLength(4);
    });
  });

  it('should see edit button for all entries and when showEditForActiveEncounter is not present', async () => {
    const activeEncounterMockHostData = {
      patientUuid: 'some-patient-uuid',
      encounterUuid: '6e52cecd-a095-457f-9515-38cf9178cb50'
    };
    const { container } = render(<FormDisplayControl hostData={activeEncounterMockHostData} hostApi={mockHostApi}/>);

    await waitFor(() => {
      expect(container.querySelectorAll(".fa.fa-pencil")).toHaveLength(4);
    });
  });

  it('displays loading state initially', async () => {
    render(
      <I18nProvider>
        <FormDisplayControl hostData={mockHostData} hostApi={mockHostApi} />
      </I18nProvider>
    );
    expect(screen.getByText('Loading... Please Wait')).toBeTruthy();
  });

  it('displays no form message if no forms are found', async () => {
    mockFetchFormData.mockResolvedValueOnce({});
    mockGetLatestPublishedForms.mockResolvedValue([]);
    render(
      <I18nProvider>
        <FormDisplayControl hostData={mockHostData} hostApi={mockHostApi} />
      </I18nProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('No Form found for this patient....')).toBeTruthy();
    });
  });

  it('displays forms when data is available', async () => {
    render(
      <I18nProvider>
        <FormDisplayControl hostData={mockHostData} hostApi={mockHostApi} />
      </I18nProvider>
    );
    await waitFor(() => {
      expect(screen.getByText('Orthopaedic Triage')).toBeTruthy();
      expect(screen.getByText('Doctor Two')).toBeTruthy();
    });
  });

  it('opens and close view observation form', async () => {
    const {container} = render(
      <I18nProvider>
        <FormDisplayControl hostData={mockHostData} hostApi={mockHostApi} />
      </I18nProvider>
    );

    await waitFor(() => {
      const formLink = screen.getByText(formatDate(1693217959000));
      fireEvent.click(formLink);
    });

    await waitFor(() => {
      expect(container.getElementsByClassName('view-observation-form-modal').length).toBe(1);
    });

    await waitFor(() => {
      const closeButton = container.querySelector("[class='bx--modal-close__icon']");
      fireEvent.click(closeButton);
    });

    await waitFor(() => {
      expect(container.getElementsByClassName('view-observation-form-modal').length).toBe(0);
    });
  });

  it('opens and close edit observation form', async () => {
    const activeEncounterMockHostData = {
      patientUuid: 'some-patient-uuid',
      encounterUuid: '6e52cecd-a095-457f-9515-38cf9178cb50'
    };
    const { container } = render(<FormDisplayControl hostData={activeEncounterMockHostData} hostApi={mockHostApi}/>);

    await waitFor(() => {
      const saveButton = container.getElementsByClassName("fa fa-pencil")[0]
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(container.getElementsByClassName('edit-observation-form-modal')).toBeTruthy();
    });

    await waitFor(() => {
      const closeButton = container.querySelector("[class='bx--modal-close__icon']");
      fireEvent.click(closeButton);
    });

    await waitFor(() => {
      expect(container.getElementsByClassName('edit-observation-form-modal').length).toBe(0);
    });
  });
});
