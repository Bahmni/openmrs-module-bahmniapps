import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { AddAllergy } from "./AddAllergy";

const mockAllergensData = [
  { name: "Eggs", kind: "Food", uuid: "162301AAAAAA" },
  { name: "Peanuts", kind: "Food", uuid: "162302AAAAAA" },
  { name: "Seafood", kind: "Food", uuid: "162303AAAAAA" },
  { name: "Bee", kind: "Environment", uuid: "162304AAAAAA" },
  { name: "Serum", kind: "Biological", uuid: "162305AAAAAA" },
  { name: "Penicillin", kind: "Medication", uuid: "162306AAAAAA" },
  { name: "Narcotic agent", kind: "Medication", uuid: "162307AAAAAA" },
];

const mockReactionsData = {
  "101AA": { name: "GI Upset" },
  "102AA": { name: "Fever" },
  "103AA": { name: "Headache" },
  "104AA": { name: "Nausea" },
  "105AA": { name: "Cough" },
};

describe("AddAllergy", () => {
  const onClose = jest.fn();
  const searchAllergen = () => {
    const searchInput = screen.getByRole("searchbox");
    fireEvent.change(searchInput, { target: { value: "pea" } });
  };
  const selectAllergen = () => {
    const selectAllergen = screen.getByText("Reaction(s)");
    fireEvent.click(selectAllergen);
  };
  const selectReaction = (container) => {
    const severity = container.querySelectorAll(".bx--checkbox")[0];
    fireEvent.click(severity);
    expect(severity.checked).toEqual(true);
  };

  const selectSeverity = (container) => {
    const selectSeverity = container.querySelectorAll(".bx--radio-button")[0];
    fireEvent.click(selectSeverity);
    expect(selectSeverity.checked).toEqual(true);
  };
  it("should render the component", () => {
    const { container } = render(
      <AddAllergy
        onClose={onClose}
        allergens={mockAllergensData}
        reaction={mockReactionsData}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it("should call onClose when close button is clicked", () => {
    const { container } = render(
      <AddAllergy
        onClose={onClose}
        allergens={mockAllergensData}
        reaction={mockReactionsData}
      />
    );
    fireEvent.click(container.querySelector(".close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should show Search Allergen when allergen is empty", () => {
    const { getByTestId } = render(
      <AddAllergy
        onClose={onClose}
        allergens={mockAllergensData}
        reaction={mockReactionsData}
      />
    );
    expect(getByTestId("search-allergen")).not.toBeNull();
  });

  it("should show Allergen List when Search is done", () => {
    render(
      <AddAllergy
        onClose={onClose}
        allergens={mockAllergensData}
        reaction={mockReactionsData}
      />
    );
    searchAllergen();
    expect(screen.getByText("Peanuts")).not.toBeNull();
    expect(screen.getByText("Reaction(s)")).not.toBeNull();
  });

  it("should show select reactions when allergen is selected", () => {
    render(
      <AddAllergy
        onClose={onClose}
        allergens={mockAllergensData}
        reaction={mockReactionsData}
      />
    );
    searchAllergen();
    expect(screen.getByTestId("search-allergen")).not.toBeNull();
    expect(screen.getByText("Reaction(s)")).not.toBeNull();

    //select allergen
    selectAllergen();

    expect(() => screen.getByTestId("search-allergen")).toThrowError();
    expect(screen.getByTestId("select-reactions")).not.toBeNull();
  });

  it("should show search Allergen ocClick of back button", () => {
    render(
      <AddAllergy
        onClose={onClose}
        allergens={mockAllergensData}
        reaction={mockReactionsData}
      />
    );
    searchAllergen();
    selectAllergen();
    expect(() => screen.getByTestId("search-allergen")).toThrowError();
    expect(screen.getByTestId("select-reactions")).not.toBeNull();
    fireEvent.click(screen.getByText("Back to Allergies"));
    expect(screen.getByTestId("search-allergen")).not.toBeNull();
    expect(() => screen.getByTestId("select-reactions")).toThrowError();
  });

  it("should render severity after allergen is selected", () => {
    render(
      <AddAllergy
        onClose={onClose}
        allergens={mockAllergensData}
        reaction={mockReactionsData}
      />
    );
    searchAllergen();

    //select allergen
    selectAllergen();

    expect(screen.getByText("Severity")).not.toBeNull();
  });

  it("should enable save button when reactions are selected", () => {
    const { container } = render(
      <AddAllergy
        onClose={onClose}
        allergens={mockAllergensData}
        reaction={mockReactionsData}
      />
    );
    searchAllergen();
    selectAllergen();
    //select reaction
    expect(screen.getByText("Save").getAttribute("disabled")).not.toBeNull();
    selectReaction(container);
    expect(screen.getByText("Save").getAttribute("disabled")).toBeNull();
  });

  it("should update severity when severity is changed", () => {
    const { container } = render(
      <AddAllergy
        onClose={onClose}
        allergens={mockAllergensData}
        reaction={mockReactionsData}
      />
    );
    searchAllergen();
    selectAllergen();
    selectSeverity(container);
  });

  it("should render notes", () => {
    const { container } = render(
      <AddAllergy
        onClose={onClose}
        allergens={mockAllergensData}
        reaction={mockReactionsData}
      />
    );
    searchAllergen();
    selectAllergen();

    const textArea = container.querySelector(".bx--text-area");
    expect(textArea.placeholder).toBe(
      "Additional comments such as onset date etc."
    );
  });
});
