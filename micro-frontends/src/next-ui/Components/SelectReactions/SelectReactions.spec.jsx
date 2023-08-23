import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { SelectReactions } from "./SelectReactions";

describe('Select reactions', function () {
    const onChange = jest.fn();
    const selectReaction = (container) => {
        const searchInput = container.querySelector(".bx--search-input");
        fireEvent.change(searchInput, { target: { value: "GI" } });
        const checkbox = screen.getByLabelText("GI Upset");
        fireEvent.click(checkbox);
    }
    it('should render SelectReactions ', function () {
        const { container } = render(<SelectReactions onChange={onChange} />);
        expect(container).toMatchSnapshot();
    });

    it('should render SelectReactions with search bar', function () {
        const { container } = render(<SelectReactions onChange={onChange}/>);
        expect(container.querySelector(".bx--search--xl")).not.toBeNull();
    });
    it('should render Common Reactions', function () {
        render(<SelectReactions onChange={onChange} />);
        expect(screen.getByText("Common Reactions")).toBeTruthy();
    });

    it('should render Checkboxes based on Search text', function () {
        const { container} = render(<SelectReactions onChange={onChange} />);
        const searchInput = container.querySelector(".bx--search-input");
        fireEvent.change(searchInput, { target: { value: "GI" } });
        expect(screen.getByText("GI Upset")).toBeTruthy();
        expect(() => screen.getByText("Fever")).toThrowError();
    });

    it('should show chiclets for selected reactions', function () {
        const { container, getAllByText} = render(<SelectReactions onChange={onChange} />);
        selectReaction(container);
        const tag = container.querySelector(".bx--tag");
        expect(tag).toBeTruthy();
        expect(getAllByText("GI Upset").length).toEqual(2);
    });

    it('should remove chiclets when reaction checkbox is unselected', function () {
        const { container, getAllByText} = render(<SelectReactions onChange={onChange} />);
        selectReaction(container);
        const tag = container.querySelector(".bx--tag");
        const checkbox = screen.getAllByLabelText("GI Upset")[1];
        expect(tag).toBeTruthy();
        expect(checkbox.checked).toEqual(true);
        expect(getAllByText("GI Upset").length).toEqual(2);

        //unselect checkbox
        fireEvent.click(checkbox);
        expect(container.querySelector(".bx--tag")).toBeNull();
        expect(getAllByText("GI Upset").length).toEqual(1);
    });

    it('should unselected checkbox when corresponding Tag is closed', function () {
        const { container, getAllByText} = render(<SelectReactions onChange={onChange} />);
        selectReaction(container);
        const tag = container.querySelector(".bx--tag");
        expect(tag).toBeTruthy();
        expect(getAllByText("GI Upset").length).toEqual(2);

        //remove Tag
        fireEvent.click(container.querySelector(".bx--tag__close-icon"));
        const checkbox = screen.getByLabelText("GI Upset");
        expect(checkbox.checked).toEqual(false);
        expect(getAllByText("GI Upset").length).toEqual(1);
    });
});
