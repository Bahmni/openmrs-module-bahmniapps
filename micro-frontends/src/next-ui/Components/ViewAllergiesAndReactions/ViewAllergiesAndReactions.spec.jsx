import React from "react";
import { render } from "@testing-library/react";
import { ViewAllergiesAndReactions } from './ViewAllergiesAndReactions';
import {NO_KNOWN_ALLERGY_CODE} from "../../constants";

describe("ViewAllergiesAndReactions", () => {
    const allergiesMock = [
        {
            allergen: "Bee",
            allergenCode: "bee-code-123",
            reactions: ["Hives", "Itching", "Fever"],
            severity: "severe",
            provider: "Dr. John Doe"
        },
        {
            allergen: "Peanuts",
            allergenCode: "peanuts-code-456",
            reactions: ["Dizziness", "Fever"],
            severity: "mild",
            note: "Onset Date: 2023-10-01",
            provider: "Dr. Jane"
        },
        {
            allergen: "No Known Allergy",
            allergenCode: NO_KNOWN_ALLERGY_CODE,
            reactions: [],
            severity: undefined,
            note: undefined,
            provider: "Dr. John Doe"
        }
    ];

    it('should render ViewAllergiesAndReactions component', () => {
        const {container} = render(<ViewAllergiesAndReactions allergies={allergiesMock}/>);
        expect(container).toMatchSnapshot();
    });
});