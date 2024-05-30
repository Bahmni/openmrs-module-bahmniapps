import React from "react";
import {render, screen, waitFor} from "@testing-library/react";
import { DeletePopup } from "./DeletePopup";
import {I18nProvider} from "../i18n/I18nProvider";

const mockDeletePopup = jest.fn();

jest.mock('../i18n/utils');
jest.mock("./utils", () => ({
    deleteOtNote : () => mockDeletePopup(),
}));
describe("DeletePopup", () => {
    it("should render", async () => {
        const {container, getByText} = render(<I18nProvider><DeletePopup hostData={{noteId: 10}}/></I18nProvider>);
        await waitFor(() => {
            expect(getByText("Delete Note")).toBeTruthy();
            expect(container).toMatchSnapshot();
        });
    });
    it("should call deleteOtNote on submit", async () => {
        const {getByText}= render(<I18nProvider><DeletePopup hostData={{noteId: 10}}/></I18nProvider>);
        await waitFor(() => {
            expect(getByText("Delete Note")).toBeTruthy();
        });
        mockDeletePopup.mockResolvedValue(() => {})
        screen.getByText("Yes").click();
        expect(mockDeletePopup).toHaveBeenCalled();
    });
});