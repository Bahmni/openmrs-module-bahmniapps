import React from "react";
import { render, screen } from "@testing-library/react";
import { Accordion } from "./Accordion";

describe("Accordion", () => {
    const mockHeader = <span>Test Header</span>;
    const mockChildren = <div>Test Content</div>;

    it("should render the component with header", () => {
        const { container } = render(
            <Accordion header={mockHeader} defaultOpen={false}>
                {mockChildren}
            </Accordion>
        );
        expect(container).toMatchSnapshot();
    });

    it("should render header content", () => {
        render(
            <Accordion header={mockHeader} defaultOpen={false}>
                {mockChildren}
            </Accordion>
        );
        expect(screen.getByText("Test Header")).toBeTruthy();
        expect(screen.queryByText("Test Content")).toBeFalsy();
    });

    it("should show content when defaultOpen is true", () => {
        render(
            <Accordion header={mockHeader} defaultOpen={true} className={"accordion"}>
                {mockChildren}
            </Accordion>
        );
        expect(screen.getByText("Test Content")).toBeTruthy();
    });

    it("should toggle content when header is clicked", () => {
        const { container } = render(
            <Accordion header={mockHeader}>
                {mockChildren}
            </Accordion>
        );

        const header = container.querySelector(".accordion-header");
        header.click();
        expect(container).toMatchSnapshot();
    });
});
