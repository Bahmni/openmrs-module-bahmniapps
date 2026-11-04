import React from "react";
import {render, screen} from "@testing-library/react";
import {ViewOrders} from "./ViewOrders";

describe("ViewOrders", () => {
    const mockOrders = [
        {
            name: "Order 1",
            createdBy: "Dr. Smith",
            createdAt: "2024-01-01T10:00:00.000Z",
            updatedAt: "2024-01-20T11:00:00.000Z",
            orderStatus: "REQUESTED",
            statusUpdatedBy: "Status updated by Nurse A",
            owner: "Dr. David",
            ownerUpdatedBy: "Owner updated by Admin",
            notes: "Test notes",
            notesUpdatedBy: "Notes updated by Dr. Nelson"
        },
        {
            name: "Order 2",
            createdBy: "Dr. Johnson",
            createdAt: "2024-01-02T10:00:00.000Z",
            updatedAt: "",
            orderStatus: "COMPLETED",
            statusUpdatedBy: "Status updated by Nurse B",
            owner: "Dr. John",
            ownerUpdatedBy: "Owner updated by Admin",
            notes: "Another test note",
            notesUpdatedBy: "Notes updated by Dr. Paul"
        }
    ];

    it("should render container with with correct details", () => {
        const {container} = render(<ViewOrders orders={mockOrders}/>);
        expect(container.querySelector(".orders-view-container")).toBeTruthy();

        expect(screen.getByText("Order 1")).toBeTruthy();
        expect(screen.getByText("Order 2")).toBeTruthy();

        expect(screen.getByText("Dr. Smith")).toBeTruthy();
        expect(screen.getByText("Dr. Johnson")).toBeTruthy();

        expect(screen.getByText(/01 Jan 2024/)).toBeTruthy();

        const accordions = container.querySelectorAll(".accordion");
        expect(accordions.length).toBe(3);
        expect(screen.getByText("Acknowledged")).toBeTruthy();
    });

    it("should render empty container when no orders", () => {
        const {container} = render(<ViewOrders orders={[]}/>);
        expect(container.querySelector(".orders-view-container")).toBeTruthy();
        expect(container.querySelector(".order-item")).toBeFalsy();
    });

    it("should render null when orders is undefined", () => {
        const {container} = render(<ViewOrders orders={undefined}/>);
        expect(container.querySelector(".orders-view-container")).toBeTruthy();
    });
});
