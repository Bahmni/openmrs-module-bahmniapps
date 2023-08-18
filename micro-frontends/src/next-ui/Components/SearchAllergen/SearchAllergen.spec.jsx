import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { SearchAllergen } from "./SearchAllergen.jsx";

describe('SearchAllergen', function () {
    const onChange = jest.fn();
    it('should render SearchAllergen ', function () {
        const { container } = render(<SearchAllergen onChange={onChange}/>);
        expect(container).toMatchSnapshot();
    });

    it('should render SearchAllergen with search bar', function () {
        const { container } = render(<SearchAllergen onChange={onChange}/>);
        expect(container.querySelector(".bx--search--xl")).not.toBeNull();
    });
    it('should show allergens based on the key typed', function () {
        const { container } = render(<SearchAllergen onChange={onChange}/>);
        const searchInput = container.querySelector(".bx--search-input");
        fireEvent.change(searchInput, { target: { value: "pea" } });
        const tag = container.querySelector(".bx--tag");
        expect(tag).not.toBeNull();
        expect(screen.getByText("Peanuts")).not.toBeNull();
        expect(tag.textContent).toEqual("Food");
        expect(() => screen.getByText("Milk")).toThrowError();
    });
    it('should show no allergens found when search result is empty', function () {
        const { container } = render(<SearchAllergen onChange={onChange}/>);
        const searchInput = container.querySelector(".bx--search-input");
        fireEvent.change(searchInput, { target: { value: "xyz" } });
        expect(screen.getByText("No Allergen found")).not.toBeNull();
    });
    it('should not show No Allergen message when the search query is empty', function () {
        const { container } = render(<SearchAllergen onChange={onChange}/>);
        const searchInput = container.querySelector(".bx--search-input");
        fireEvent.change(searchInput, { target: { value: "xyz" } });
        expect(screen.getByText("No Allergen found")).not.toBeNull();

        //clear search query
        fireEvent.change(searchInput, { target: { value: "" } });
        expect(() => screen.getByText("No Allergen found")).toThrowError();
    });
    it('should not show No Allergen message when we clear the search query', function () {
        const { container } = render(<SearchAllergen onChange={onChange}/>);
        const searchInput = container.querySelector(".bx--search-input");
        fireEvent.change(searchInput, { target: { value: "xyz" } });
        expect(screen.getByText("No Allergen found")).not.toBeNull();

        //clear search query
        const searchBarCloseIcon = container.querySelector(".bx--search-close");
        fireEvent.click(searchBarCloseIcon);
        expect(() => screen.getByText("No Allergen found")).toThrowError();
    });
});
