import React from "react";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {SavePopup} from "./SavePopup";
import {I18nProvider} from "../i18n/I18nProvider";

const mockSaveNote = jest.fn();
const mockUpdateNoteForADay = jest.fn();

jest.mock("../i18n/utils");
jest.mock("./utils", () => ({
    saveNote: () => mockSaveNote(),
    updateNoteForADay: () => mockUpdateNoteForADay(),
}));

describe("SavePopup", () => {
    it("should render with Add Note when noteId is empty", async () => {
        const {container, getByText} = render(
            <I18nProvider>
                <SavePopup hostData={{
                    notes: '',
                    isDayView: false,
                    noteId: undefined,
                    noteDate: new Date()
                }}/>
            </I18nProvider>
        );
        await waitFor(() => {
            expect(getByText("Add Note")).toBeTruthy();
            expect(container).toMatchSnapshot();
        });
    });
    it("should render with Update Note when noteId is defined", async () => {
        const {container, getByText} = render(
            <I18nProvider>
                <SavePopup hostData={{
                    notes: 'notes for the day',
                    isDayView: false,
                    noteId: 10,
                    noteDate: new Date()
                }}/>
            </I18nProvider>
        );
        await waitFor(() => {
            expect(getByText("Update Note")).toBeTruthy();
            expect(container).toMatchSnapshot();
        });
    });

    it("should show error when trying to save with note as empty", async () => {
        const {getByText} = render(
            <I18nProvider>
                <SavePopup hostData={{
                    notes: '',
                    isDayView: false,
                    noteId: undefined,
                    noteDate: new Date()
                }}/>
            </I18nProvider>
        );
        await waitFor(() => {
            screen.getByText("Add Note").click();
        });
        expect(() => screen.getByText("Note cannot be empty")).toThrow();
        const saveButton = getByText("Save");
        expect(saveButton).toBeTruthy();
        saveButton.click();
        expect(screen.getByText("Note cannot be empty")).toBeTruthy();
    });
    it("should call save when all data is valid", async () => {
        const {container, getByText} = render(
            <I18nProvider>
                <SavePopup hostData={{
                    notes: '',
                    isDayView: false,
                    noteId: undefined,
                    noteDate: new Date()
                }}/>
            </I18nProvider>
        );
        mockSaveNote.mockResolvedValue(() => {})
        await waitFor(() => {
            screen.getByText("Add Note").click();
        });
        const textBox = container.querySelector('.bx--text-area');
        fireEvent.change(textBox, {target: {value: 'notes for the day'}});
        const saveButton = getByText("Save");
        saveButton.click();
        await waitFor(() => {
            expect(mockSaveNote).toHaveBeenCalled();
        });
    });

    it("should call save when all data is valid in Day View", async () => {
        const {container, getByText} = render(
            <I18nProvider>
                <SavePopup hostData={{
                    notes: '',
                    isDayView: true,
                    noteId: undefined,
                    noteDate: new Date()
                }}/>
            </I18nProvider>
        );
        mockSaveNote.mockResolvedValue(() => {})
        await waitFor(() => {
            screen.getByText("Add Note").click();
        });
        const textBox = container.querySelector('.bx--text-area');
        fireEvent.change(textBox, {target: {value: 'notes for the day'}});
        const saveButton = getByText("Save");
        saveButton.click();
        await waitFor(() => {
            expect(mockSaveNote).toHaveBeenCalled();
        });
    });

    it("should call edit when noteId is present", async () => {
        const {container, getByText} = render(
            <I18nProvider>
                <SavePopup hostData={{
                    notes: 'notes for the day',
                    isDayView: false,
                    noteId: 10,
                    noteDate: new Date()
                }}/>
            </I18nProvider>
        );
        mockUpdateNoteForADay.mockResolvedValue(() => {})
        await waitFor(() => {
            screen.getByText("Update Note").click();
        });
        const textBox = container.querySelector('.bx--text-area');
        fireEvent.change(textBox, {target: {value: 'notes for the day'}});
        const saveButton = getByText("Update");
        saveButton.click();
        await waitFor(() => {
            expect(mockUpdateNoteForADay).toHaveBeenCalled();
        });
    });
});