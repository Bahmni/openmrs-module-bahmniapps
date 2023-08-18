import React from "react";
import { render, screen } from "@testing-library/react";
import SaveAndCloseButtons from "./SaveAndCloseButtons.jsx";

describe("SaveAndCloseButtons", () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    it("should render the component", () => {
        const { container } = render(<SaveAndCloseButtons onSave={onSave} onClose={onClose} isSaveDisabled={false} />);
        expect(container).toMatchSnapshot();
    });

    it("should render the component with disabled save button", () => {
        render(<SaveAndCloseButtons onSave={onSave} onClose={onClose} isSaveDisabled={true} />);
        const saveButton = screen.getByText("Save");
        expect(saveButton.getAttribute("disabled")).not.toBeNull();
    });

    it('should call onSave when save button is clicked', () => {
        render(<SaveAndCloseButtons onSave={onSave} onClose={onClose} isSaveDisabled={false} />);
        const saveButton = screen.getByText("Save");
        saveButton.click();
        expect(onSave).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when cancel button is clicked', () => {
        render(<SaveAndCloseButtons onSave={onSave} onClose={onClose} isSaveDisabled={false} />);
        const cancelButton = screen.getByText("Cancel");
        cancelButton.click();
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
