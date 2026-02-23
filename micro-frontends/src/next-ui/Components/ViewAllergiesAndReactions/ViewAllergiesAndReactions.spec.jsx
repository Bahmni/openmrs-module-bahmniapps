/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import React from "react";
import { render } from "@testing-library/react";
import { ViewAllergiesAndReactions } from './ViewAllergiesAndReactions';

describe("ViewAllergiesAndReactions", () => {
    const allergiesMock = [
        {
            allergen: "Bee",
            reactions: ["Hives", "Itching", "Fever"],
            severity: "severe",
            provider: "Dr. John Doe"
        },
        {
            allergen: "Peanuts",
            reactions: ["Dizziness", "Fever"],
            severity: "mild",
            note: "Onset Date: 2023-10-01",
            provider: "Dr. Jane"
        }
    ]
    it('should render ViewAllergiesAndReactions component', () => {
        const {container} = render(<ViewAllergiesAndReactions allergies={allergiesMock}/>);
        expect(container).toMatchSnapshot();
    });
});