/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

describe("getDateWithoutTime", function() {
    it("should return date without time",function(){
        expect(Bahmni.Common.Util.DateTimeFormatter.getDateWithoutTime(new Date('2016', '7', '15', '12','30','25'))).toBe('2016-08-15');
        expect(Bahmni.Common.Util.DateTimeFormatter.getDateWithoutTime(new Date('2016', '11', '15', '12','30','25'))).toBe('2016-12-15');
    });

    it("should return null if date provided is null", function() {
        expect(Bahmni.Common.Util.DateTimeFormatter.getDateWithoutTime(null)).toBe(null);
    });
});