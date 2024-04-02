import React from "react";
import { render } from "@testing-library/react";
import { ViewAllergiesAndReactions } from './ViewAllergiesAndReactions';

describe("ViewAllergiesAndReactions", () => {
    const allergiesMock = [
        {
            allergen: "Bee",
            reactions: ["Hives", "Itching", "Fever"],
            severity: "severe",
            provider: "Dr. John Doe",
            datetime: "23 Mar 2024 3:15 pm"
        },
        {
            allergen: "Peanuts",
            reactions: ["Dizziness", "Fever"],
            severity: "mild",
            note: "Onset Date: 2023-10-01",
            provider: "Dr. Jane",
            datetime: "01 Oct 2023 10:00 am"
        }
    ]
    it('should render ViewAllergiesAndReactions component', () => {
        const {container} = render(<ViewAllergiesAndReactions allergies={allergiesMock}/>);
        expect(container).toMatchSnapshot();
    });
});