import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { VariableDoseProtocolModal } from "./VariableDoseProtocolModal";
import { I18nProvider } from "../i18n/I18nProvider";

jest.mock("../i18n/utils");

const mockOnClose = jest.fn();
const mockOnSave = jest.fn();
const mockSearchDrugs = jest.fn();

const defaultHostData = {
    doseUnits: [{ name: "mg" }, { name: "ml" }],
    routes: [{ name: "Oral" }, { name: "IV" }],
    dosingRules: [],
    drugFormDefaults: {},
};

const defaultHostApi = {
    onClose: mockOnClose,
    onSave: mockOnSave,
    searchDrugs: mockSearchDrugs,
};

function renderModal(hostData = defaultHostData, hostApi = defaultHostApi) {
    return render(
        <I18nProvider>
            <VariableDoseProtocolModal hostData={hostData} hostApi={hostApi} />
        </I18nProvider>
    );
}

function getDropdownInput(container, id) {
    return container.querySelector(`[id="${id}"]`);
}

function openBahmniDropdown(container, id) {
    const input = getDropdownInput(container, id);
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.click(input);
}

beforeEach(() => {
    jest.clearAllMocks();
    mockSearchDrugs.mockResolvedValue([]);
});

describe("VariableDoseProtocolModal", () => {
    it("should render the modal (open=true is hardcoded, visibility controlled by ng-if)", async () => {
        const { container } = renderModal();
        await waitFor(() => {
            expect(screen.getByText("Order Drug - Variable Dose Protocol")).toBeTruthy();
            expect(container).toMatchSnapshot();
        });
    });

    it("should disable Next button when no drug is selected", async () => {
        renderModal();
        await waitFor(() => {
            const nextButton = screen.getByText("Save").closest("button");
            expect(nextButton.disabled).toBe(true);
        });
    });

    it("should disable Next button when drug is selected but units not selected", async () => {
        const drug = { uuid: "uuid-1", name: "Paracetamol", dosageForm: null };
        mockSearchDrugs.mockResolvedValue([drug]);
        renderModal();

        await waitFor(() => screen.getByText("Order Drug - Variable Dose Protocol"));

        const comboInput = screen.getByPlaceholderText("Type to Search a Drug");
        fireEvent.change(comboInput, { target: { value: "Para" } });
        await waitFor(() => expect(mockSearchDrugs).toHaveBeenCalled());

        await act(async () => {
            const option = await screen.findByText("Paracetamol");
            fireEvent.click(option);
        });

        await waitFor(() => {
            const nextButton = screen.getByText("Save").closest("button");
            expect(nextButton.disabled).toBe(true);
        });
    });

    it("should enable Next button when drug, units, and start date are all set", async () => {
        const drug = { uuid: "uuid-1", name: "Paracetamol", dosageForm: null };
        mockSearchDrugs.mockResolvedValue([drug]);
        const { container } = renderModal();

        await waitFor(() => screen.getByText("Order Drug - Variable Dose Protocol"));

        const comboInput = screen.getByPlaceholderText("Type to Search a Drug");
        fireEvent.change(comboInput, { target: { value: "Para" } });
        await waitFor(() => expect(mockSearchDrugs).toHaveBeenCalled());

        await act(async () => {
            const option = await screen.findByText("Paracetamol");
            fireEvent.click(option);
        });

        openBahmniDropdown(container, "variable-dose-units");
        fireEvent.click(screen.getByText("mg"));

        await waitFor(() => {
            const nextButton = screen.getByText("Save").closest("button");
            expect(nextButton.disabled).toBe(false);
        });
    });

    it("should call hostApi.onClose when X button is clicked", async () => {
        renderModal();
        await waitFor(() => screen.getByText("Order Drug - Variable Dose Protocol"));

        const closeButton = document.querySelector(".bx--modal-close");
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it("should call hostApi.onClose when Cancel button is clicked", async () => {
        renderModal();
        await waitFor(() => screen.getByText("Order Drug - Variable Dose Protocol"));

        fireEvent.click(screen.getByText("Cancel"));

        expect(mockOnClose).toHaveBeenCalled();
    });

    it("should not render Dosage Rule select when dosingRules is empty", async () => {
        const { container } = renderModal({ ...defaultHostData, dosingRules: [] });
        await waitFor(() => screen.getByText("Order Drug - Variable Dose Protocol"));

        expect(getDropdownInput(container, "variable-dose-dosing-rule")).toBeNull();
    });

    it("should render Dosage Rule select when dosingRules has items", async () => {
        const { container } = renderModal({ ...defaultHostData, dosingRules: ["mg/kg", "ml/kg"] });
        await waitFor(() => screen.getByText("Order Drug - Variable Dose Protocol"));

        expect(getDropdownInput(container, "variable-dose-dosing-rule")).not.toBeNull();

        openBahmniDropdown(container, "variable-dose-dosing-rule");
        await waitFor(() => expect(screen.getByText("mg/kg")).toBeTruthy());
    });

    it("should call searchDrugs with debounced term on drug input change", async () => {
        renderModal();
        await waitFor(() => screen.getByText("Order Drug - Variable Dose Protocol"));

        const comboInput = screen.getByPlaceholderText("Type to Search a Drug");
        fireEvent.change(comboInput, { target: { value: "Amox" } });

        await waitFor(() => {
            expect(mockSearchDrugs).toHaveBeenCalledWith("Amox");
        });
    });

    it("should pre-select unit and route from drugFormDefaults when a matching drug is selected", async () => {
        const drug = {
            uuid: "uuid-2",
            name: "Amoxicillin",
            dosageForm: { display: "Tablet", uuid: "df-uuid-1" },
        };
        mockSearchDrugs.mockResolvedValue([drug]);
        const hostDataWithDefaults = {
            ...defaultHostData,
            drugFormDefaults: {
                Tablet: { doseUnits: "mg", route: "Oral" },
            },
        };
        const { container } = renderModal(hostDataWithDefaults);

        await waitFor(() => screen.getByText("Order Drug - Variable Dose Protocol"));

        const comboInput = screen.getByPlaceholderText("Type to Search a Drug");
        fireEvent.change(comboInput, { target: { value: "Amox" } });
        await waitFor(() => expect(mockSearchDrugs).toHaveBeenCalled());

        await act(async () => {
            const option = await screen.findByText("Amoxicillin");
            fireEvent.click(option);
        });

        await waitFor(() => {
            expect(getDropdownInput(container, "variable-dose-units").value).toBe("mg");
            expect(getDropdownInput(container, "variable-dose-route").value).toBe("Oral");
        });
    });

    it("should auto-populate units when a dosing rule with a single mapped unit is selected", async () => {
        const hostDataWithRuleUnits = {
            ...defaultHostData,
            dosingRules: ["mg/kg", "ml/kg"],
            dosageRuleUnitsMap: { "mg/kg": ["mg"], "ml/kg": ["ml", "cc"] },
        };
        const { container } = renderModal(hostDataWithRuleUnits);
        await waitFor(() => screen.getByText("Order Drug - Variable Dose Protocol"));

        openBahmniDropdown(container, "variable-dose-dosing-rule");
        fireEvent.click(screen.getByText("mg/kg"));

        await waitFor(() => {
            expect(getDropdownInput(container, "variable-dose-units").value).toBe("mg");
        });

        const ruleInput = getDropdownInput(container, "variable-dose-dosing-rule");
        fireEvent.change(ruleInput, { target: { value: "ml" } });
        fireEvent.click(screen.getByText("ml/kg"));
        await waitFor(() => {
            expect(getDropdownInput(container, "variable-dose-units").value).toBe("mg");
        });
    });

    it("should leave unit and route unselected when drug has no matching drugFormDefaults entry", async () => {
        const drug = {
            uuid: "uuid-3",
            name: "Ibuprofen",
            dosageForm: { display: "Capsule", uuid: "df-uuid-2" },
        };
        mockSearchDrugs.mockResolvedValue([drug]);
        const { container } = renderModal({ ...defaultHostData, drugFormDefaults: {} });

        await waitFor(() => screen.getByText("Order Drug - Variable Dose Protocol"));

        const comboInput = screen.getByPlaceholderText("Type to Search a Drug");
        fireEvent.change(comboInput, { target: { value: "Ibu" } });
        await waitFor(() => expect(mockSearchDrugs).toHaveBeenCalled());

        await act(async () => {
            const option = await screen.findByText("Ibuprofen");
            fireEvent.click(option);
        });

        await waitFor(() => {
            expect(getDropdownInput(container, "variable-dose-units").value).toBe("");
            expect(getDropdownInput(container, "variable-dose-route").value).toBe("");
        });
    });
});
