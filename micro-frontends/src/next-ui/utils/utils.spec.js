import moment from "moment";
import { formatDate } from "./utils";
import { defaultDateTimeFormat } from "../constants";

describe("formatDate function", function () {
    it("should format a valid date using the default format", () => {
        const inputDate = "2024-05-02T10:30:00Z";
        const expectedOutput = moment(inputDate).format(defaultDateTimeFormat);
        
        const result = formatDate(inputDate);
        
        expect(result).toBe(expectedOutput);
    });

    it("should format a valid date using a custom format", () => {
        const inputDate = "2024-05-02T10:30:00Z";
        const customFormat = "DD/MM/YYYY HH:mm:ss";
        const expectedOutput = moment(inputDate).format(customFormat);
        
        const result = formatDate(inputDate, customFormat);
        
        expect(result).toBe(expectedOutput);
    });

    it("should return the input if the value is null or undefined", () => {
        expect(formatDate(null)).toBeNull();
        expect(formatDate(undefined)).toBeUndefined();
    });

    it("should handle an empty string input", () => {
        expect(formatDate("")).toBe("");
    });
});
