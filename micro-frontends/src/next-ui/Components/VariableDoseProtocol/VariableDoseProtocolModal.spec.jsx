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
    dosingInstructions: [{ name: "As directed" }, { name: "Before meals" }],
    frequencies: [{ name: "Once a day" }, { name: "Twice a day" }],
    durationUnits: [{ name: "Days" }, { name: "Weeks" }],
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

const validStage = () => ({
    dose: 5,
    frequency: { label: "Once a day", value: "Once a day" },
    duration: 3,
    durationUnit: { label: "Days", value: "Days" },
    instructions: null,
    additionalInstructions: "",
    rate: 0,
    additives: "",
    showInstructions: true,
});

const defaultHostDataWithValidStages = {
    ...defaultHostData,
    initialValues: { stages: [validStage(), validStage()] },
};

beforeEach(() => {
    jest.clearAllMocks();
    mockSearchDrugs.mockResolvedValue([]);
});

describe("VariableDoseProtocolModal", () => {
    it("should render the modal (open=true is hardcoded, visibility controlled by ng-if)", async () => {
        const { container } = renderModal();
        await waitFor(() => {
            expect(screen.getByText("Order Drug - Variable Dosage Protocol")).toBeTruthy();
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

        await waitFor(() => screen.getByText("Order Drug - Variable Dosage Protocol"));

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

    it("should disable Save when drug and units set but stages not filled", async () => {
        const drug = { uuid: "uuid-1", name: "Paracetamol", dosageForm: null };
        mockSearchDrugs.mockResolvedValue([drug]);
        const { container } = renderModal();

        await waitFor(() => screen.getByText("Order Drug - Variable Dosage Protocol"));

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
            expect(nextButton.disabled).toBe(true);
        });
    });

    it("should enable Save when drug, units, and at least 2 valid stages are set", async () => {
        const drug = { uuid: "uuid-1", name: "Paracetamol", dosageForm: null };
        mockSearchDrugs.mockResolvedValue([drug]);
        const { container } = renderModal(defaultHostDataWithValidStages);

        await waitFor(() => screen.getByText("Order Drug - Variable Dosage Protocol"));

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

    it("should call hostApi.onClose when X button is clicked on a clean form", async () => {
        renderModal();
        await waitFor(() => screen.getByText("Order Drug - Variable Dosage Protocol"));

        const closeButton = document.querySelector(".bx--modal-close");
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it("should call hostApi.onClose when Cancel button is clicked on a clean form", async () => {
        renderModal();
        await waitFor(() => screen.getByText("Order Drug - Variable Dosage Protocol"));

        fireEvent.click(screen.getByText("Cancel"));

        expect(mockOnClose).toHaveBeenCalled();
    });

    it("should show confirmation dialog when X is clicked with a dirty form", async () => {
        const { container } = renderModal();
        await waitFor(() => screen.getByText("Order Drug - Variable Dosage Protocol"));

        openBahmniDropdown(container, "variable-dose-units");
        fireEvent.click(screen.getByText("mg"));

        const closeButton = document.querySelector(".bx--modal-close");
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.getByText("You will lose the details entered. Do you want to continue?")).toBeTruthy();
        });
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    it("should close modal when Yes is clicked in the confirmation dialog", async () => {
        const { container } = renderModal();
        await waitFor(() => screen.getByText("Order Drug - Variable Dosage Protocol"));

        openBahmniDropdown(container, "variable-dose-units");
        fireEvent.click(screen.getByText("mg"));

        const closeButton = document.querySelector(".bx--modal-close");
        fireEvent.click(closeButton);

        await waitFor(() => screen.getByText("You will lose the details entered. Do you want to continue?"));

        fireEvent.click(screen.getByText("Yes"));

        expect(mockOnClose).toHaveBeenCalled();
    });

    it("should dismiss the confirmation dialog and keep the form when No is clicked", async () => {
        const { container } = renderModal();
        await waitFor(() => screen.getByText("Order Drug - Variable Dosage Protocol"));

        openBahmniDropdown(container, "variable-dose-units");
        fireEvent.click(screen.getByText("mg"));

        const closeButton = document.querySelector(".bx--modal-close");
        fireEvent.click(closeButton);

        await waitFor(() => screen.getByText("You will lose the details entered. Do you want to continue?"));

        fireEvent.click(screen.getByText("No"));

        expect(mockOnClose).not.toHaveBeenCalled();
        const confirmModal = document.querySelector(".variable-dose-close-confirmation");
        expect(confirmModal.classList.contains("is-visible")).toBe(false);
    });

    it("should clear units when dosing rule is cleared", async () => {
        const hostDataWithRuleUnits = {
            ...defaultHostData,
            dosingRules: ["mg/kg"],
            dosageRuleUnitsMap: { "mg/kg": ["mg"] },
        };
        const { container } = renderModal(hostDataWithRuleUnits);
        await waitFor(() => screen.getByText("Order Drug - Variable Dosage Protocol"));

        openBahmniDropdown(container, "variable-dose-dosing-rule");
        fireEvent.click(screen.getByText("mg/kg"));

        await waitFor(() => {
            expect(getDropdownInput(container, "variable-dose-units").value).toBe("mg");
        });

        const ruleInput = getDropdownInput(container, "variable-dose-dosing-rule");
        fireEvent.input(ruleInput, { target: { value: "" } });

        await waitFor(() => {
            expect(getDropdownInput(container, "variable-dose-units").value).toBe("");
        });
    });

    it("should not render Dosage Rule select when dosingRules is empty", async () => {
        const { container } = renderModal({ ...defaultHostData, dosingRules: [] });
        await waitFor(() => screen.getByText("Order Drug - Variable Dosage Protocol"));

        expect(getDropdownInput(container, "variable-dose-dosing-rule")).toBeNull();
    });

    it("should render Dosage Rule select when dosingRules has items", async () => {
        const { container } = renderModal({ ...defaultHostData, dosingRules: ["mg/kg", "ml/kg"] });
        await waitFor(() => screen.getByText("Order Drug - Variable Dosage Protocol"));

        expect(getDropdownInput(container, "variable-dose-dosing-rule")).not.toBeNull();

        openBahmniDropdown(container, "variable-dose-dosing-rule");
        await waitFor(() => expect(screen.getByText("mg/kg")).toBeTruthy());
    });

    it("should call searchDrugs with debounced term on drug input change", async () => {
        renderModal();
        await waitFor(() => screen.getByText("Order Drug - Variable Dosage Protocol"));

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

        await waitFor(() => screen.getByText("Order Drug - Variable Dosage Protocol"));

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
        await waitFor(() => screen.getByText("Order Drug - Variable Dosage Protocol"));

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

        await waitFor(() => screen.getByText("Order Drug - Variable Dosage Protocol"));

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

describe("Loading Dose", () => {
    it("loading dose toggle is not shown when not toggled", async () => {
        renderModal();
        await waitFor(() => screen.getByText("Order Drug - Variable Dosage Protocol"));

        expect(screen.queryByLabelText("Loading Dose")).toBeNull();
    });

    it("clicking loading dose toggle shows loading dose fields", async () => {
        const { container } = renderModal();
        await waitFor(() => screen.getByText("Order Drug - Variable Dosage Protocol"));

        const toggle = container.querySelector("#loading-dose-toggle");
        fireEvent.click(toggle);

        await waitFor(() => {
            expect(container.querySelector("#loading-dose-dose")).toBeTruthy();
            expect(container.querySelector("#loading-dose-additional-instructions")).toBeTruthy();
        });
    });

    it("clicking loading dose toggle shows rate and additives when dosing rule is ml/kg", async () => {
        const { container } = renderModal({ ...defaultHostData, dosingRules: ["ml/kg"] });
        await waitFor(() => screen.getByText("Order Drug - Variable Dosage Protocol"));

        openBahmniDropdown(container, "variable-dose-dosing-rule");
        fireEvent.click(screen.getByText("ml/kg"));

        const toggle = container.querySelector("#loading-dose-toggle");
        fireEvent.click(toggle);

        await waitFor(() => {
            expect(container.querySelector("#loading-dose-rate")).toBeTruthy();
            expect(screen.getAllByLabelText("Rate (ml/hr)").length).toBeGreaterThan(0);
        });
    });

    it("toggling loading dose off hides and clears fields", async () => {
        const { container } = renderModal();
        await waitFor(() => screen.getByText("Order Drug - Variable Dosage Protocol"));

        const toggle = container.querySelector("#loading-dose-toggle");
        fireEvent.click(toggle);

        await waitFor(() => {
            expect(container.querySelector("#loading-dose-dose")).toBeTruthy();
        });

        fireEvent.click(toggle);

        await waitFor(() => {
            expect(container.querySelector("#loading-dose-dose")).toBeNull();
        });
    });

    it("onSave is called with loadingDose data when toggle is on", async () => {
        const drug = { uuid: "uuid-1", name: "Paracetamol", dosageForm: null };
        mockSearchDrugs.mockResolvedValue([drug]);
        const { container } = renderModal(defaultHostDataWithValidStages);

        await waitFor(() => screen.getByText("Order Drug - Variable Dosage Protocol"));

        const comboInput = screen.getByPlaceholderText("Type to Search a Drug");
        fireEvent.change(comboInput, { target: { value: "Para" } });
        await waitFor(() => expect(mockSearchDrugs).toHaveBeenCalled());

        await act(async () => {
            const option = await screen.findByText("Paracetamol");
            fireEvent.click(option);
        });

        openBahmniDropdown(container, "variable-dose-units");
        fireEvent.click(screen.getByText("mg"));

        const toggle = container.querySelector("#loading-dose-toggle");
        fireEvent.click(toggle);

        await waitFor(() => container.querySelector("#loading-dose-dose"));

        const doseInput = container.querySelector("#loading-dose-dose input[type='number']") ||
            container.querySelector("#loading-dose-dose");
        if (doseInput) fireEvent.change(doseInput, { target: { value: "5" } });

        await waitFor(() => {
            const nextButton = screen.getByText("Save").closest("button");
            expect(nextButton.disabled).toBe(false);
        });

        fireEvent.click(screen.getByText("Save").closest("button"));

        expect(mockOnSave).toHaveBeenCalledWith(
            expect.objectContaining({
                loadingDose: expect.objectContaining({ dose: "5" }),
                stages: expect.arrayContaining([expect.objectContaining({ stageName: "Stage 1" })]),
            })
        );
    });

    it("onSave is called with loadingDose: null when toggle is off", async () => {
        const drug = { uuid: "uuid-1", name: "Paracetamol", dosageForm: null };
        mockSearchDrugs.mockResolvedValue([drug]);
        const { container } = renderModal(defaultHostDataWithValidStages);

        await waitFor(() => screen.getByText("Order Drug - Variable Dosage Protocol"));

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

        fireEvent.click(screen.getByText("Save").closest("button"));

        expect(mockOnSave).toHaveBeenCalledWith(
            expect.objectContaining({
                loadingDose: null,
                stages: expect.arrayContaining([expect.objectContaining({ stageName: "Stage 1" })]),
            })
        );
    });
});
