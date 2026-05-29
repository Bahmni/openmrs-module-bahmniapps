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
import { IntlProvider } from "react-intl";

const NO_KNOWN_ALLERGY_CODE = "no-known-allergy-uuid";

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
        const {container} = render(
            <IntlProvider locale="en">
                <ViewAllergiesAndReactions allergies={allergiesMock} noKnownAllergyUuid={NO_KNOWN_ALLERGY_CODE}/>
            </IntlProvider>
        );
        expect(container).toMatchSnapshot();
    });
});