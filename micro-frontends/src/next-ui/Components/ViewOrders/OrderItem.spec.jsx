import React from "react";
import { render, screen } from "@testing-library/react";
import { OrderItem, OrderItemContainer } from "./OrderItem";

describe("OrderItem", () => {
    const mockProps = {
        name: "Test Name",
        value: "Test Value",
        updatedBy: "Test User on 01 Jan 2024"
    };

    it("should render the component", () => {
        const { container } = render(<OrderItem {...mockProps} />);
        expect(container).toMatchSnapshot();
    });

    it("should display name and value", () => {
        const {container} = render(<OrderItem {...mockProps} />);
        expect(screen.getByText("Test Name")).toBeTruthy();
        expect(screen.getByText("Test Value")).toBeTruthy();
        expect(screen.queryByText("Test User on 01 Jan 2024")).toBeFalsy();
        const chevronIcon = container.querySelector(".order-item-chevron svg");
        expect(chevronIcon).toBeTruthy();
    });

    it("should display name and value without updatedBy", () => {
        const {container} = render(<OrderItem {...mockProps} updatedBy={undefined} />);
        expect(screen.getByText("Test Name")).toBeTruthy();
        expect(screen.getByText("Test Value")).toBeTruthy();
        const chevronIcon = container.querySelector(".order-item-chevron svg");
        expect(chevronIcon).toBeFalsy();
    });

    it("should toggle updatedBy details when clicked", () => {
        const { container } = render(<OrderItem {...mockProps} />);

        expect(screen.queryByText("Test User on 01 Jan 2024")).toBeFalsy();

        const header = container.querySelector(".order-item-header");
        header.click();

        expect(screen.getByText("Test User on 01 Jan 2024")).toBeTruthy();
    });
});

describe("OrderItemContainer", () => {
    const mockProps = {
        updatedAt: "01 Jan 2024 10:00 AM",
        orderStatus: "COMPLETED",
        statusUpdatedBy: "Status updated by User A",
        updatedBy: "Updated by User A",
        owner: "Owner Name",
        ownerUpdatedBy: "Owner updated by User B",
        notes: "Test notes",
        notesUpdatedBy: "Notes updated by User C"
    };

    it("should render the component", () => {
        const { container } = render(<OrderItemContainer {...mockProps} />);
        expect(container).toMatchSnapshot();
    });

    it("should display order values", () => {
        const { container } = render(<OrderItemContainer {...mockProps} />);
        expect(screen.getByText("Completed")).toBeTruthy();
        expect(screen.getByText("Owner Name")).toBeTruthy();
        expect(screen.getByText("Test notes")).toBeTruthy();
        expect(screen.getByText("Status")).toBeTruthy();
        expect(screen.getByText("Owner")).toBeTruthy();
        expect(screen.getByText("Notes")).toBeTruthy();
        expect(container.querySelector(".accordion")).toBeTruthy();
        expect(screen.getByText("01 Jan 2024 10:00 AM")).toBeTruthy();
    });

    it("should display New for null orderStatus", () => {
        render(<OrderItemContainer {...mockProps} orderStatus={null} />);
        expect(screen.getByText("New")).toBeTruthy();
    });

    it("should display New for DRAFT orderStatus", () => {
        render(<OrderItemContainer {...mockProps} orderStatus="DRAFT" />);
        expect(screen.getByText("New")).toBeTruthy();
    });

    it("should display New for UNKNOWN orderStatus (backward compat)", () => {
        render(<OrderItemContainer {...mockProps} orderStatus="UNKNOWN" />);
        expect(screen.getByText("New")).toBeTruthy();
    });

it("should display Acknowledged for REQUESTED orderStatus", () => {
        render(<OrderItemContainer {...mockProps} orderStatus="REQUESTED" />);
        expect(screen.getByText("Acknowledged")).toBeTruthy();
    });

    it("should display In Progress for ACCEPTED orderStatus", () => {
        render(<OrderItemContainer {...mockProps} orderStatus="ACCEPTED" />);
        expect(screen.getByText("In Progress")).toBeTruthy();
    });

    it("should display Completed for COMPLETED orderStatus", () => {
        render(<OrderItemContainer {...mockProps} orderStatus="COMPLETED" />);
        expect(screen.getByText("Completed")).toBeTruthy();
    });
});
