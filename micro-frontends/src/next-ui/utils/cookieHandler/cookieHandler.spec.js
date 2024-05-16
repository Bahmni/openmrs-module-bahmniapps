import React from "react";
import { getCookies } from "./cookieHandler";

describe("cookieHandler", () => {
    it('should return cookies on invoking getCookies', () => {
        document.cookie = "location='%7B%22name%22:%22location%22,%22uuid%22:%22location_uuid%22%7D'";
        const cookieDecoded = getCookies();
        expect(cookieDecoded).toEqual({ location: "'{\"name\":\"location\",\"uuid\":\"location_uuid\"}'" });
    })
});
