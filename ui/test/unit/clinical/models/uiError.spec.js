'use strict';

describe("UiErrorSpec", function () {

    var uiErrorSpec = Bahmni.Clinical.Error;

    it("maps error messages from the source error object", function () {
        var expectedErrorMessage = "One or more drugs you are trying to order are already active. Please change the start date of the conflicting drug or remove them from the new prescription.";
        var error = {data: {
            error: {
                message: "Cannot have more than one active order for the same orderable and care setting at same time"
            }
        }};
        expect(expectedErrorMessage).toBe(uiErrorSpec.translate(error));
    });

    it("returns original message if no mapping found", function () {
        var expectedErrorMessage = "Message not found in mapping";
        var error = {data: {
            error: {
                message: "Message not found in mapping"
            }
        }};
        expect(expectedErrorMessage).toBe(uiErrorSpec.translate(error));
    });

    it("returns original message if no mapping found", function () {
        var expectedErrorMessage = "Message not found in mapping";
        var error = {data: {
            error: {
                message: "Message not found in mapping"
            }
        }};

        expect(expectedErrorMessage).toBe(uiErrorSpec.translate(error));
    });

    it("returns null if cannot parse object", function () {
        var error = {that: "Does not follow the typical error message structure"};
        expect(uiErrorSpec.translate(error)).toBeFalsy();
    });

    it("should not fail for falsy objects", function () {
        uiErrorSpec.translate(null);
    });
});