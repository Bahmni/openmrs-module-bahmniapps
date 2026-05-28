/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

describe("FormFieldPathUtil", function() {
    it("should formName and version for given formFielPath", function() {
        let formNameAndVersion = Bahmni.Common.Util.FormFieldPathUtil.getFormNameAndVersion("Test Form.v1/1-1");
        expect(formNameAndVersion.formName).toBe("Test Form");
        expect(formNameAndVersion.formVersion).toBe("v1");
    })
})