/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

import React from "react";
import { getCookies } from "./cookieHandler";

describe("cookieHandler", () => {
    it('should return cookies on invoking getCookies', () => {
        document.cookie = "location='%7B%22name%22:%22location%22,%22uuid%22:%22location_uuid%22%7D'";
        const cookieDecoded = getCookies();
        expect(cookieDecoded).toEqual({ location: "'{\"name\":\"location\",\"uuid\":\"location_uuid\"}'" });
    })
});
