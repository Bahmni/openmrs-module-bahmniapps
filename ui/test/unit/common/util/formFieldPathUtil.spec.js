describe("FormFieldPathUtil", function() {
    it("should formName and version for given formFielPath", function() {
        let formNameAndVersion = Bahmni.Common.Util.FormFieldPathUtil.getFormNameAndVersion("Test Form.v1/1-1");
        expect(formNameAndVersion.formName).toBe("Test Form");
        expect(formNameAndVersion.formVersion).toBe("v1");
    })
})