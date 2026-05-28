/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

"use strict";

describe("init", function () {
    var bahmniCookieStore;

    beforeEach(function () {
        module('bahmni.common.util');
        inject(function ($bahmniCookieStore) {
            bahmniCookieStore = $bahmniCookieStore;
        });
    });

    it("should get the value as `null` when nothing is stored in cookie against the key", function () {
        var cookieForGrantProvider = bahmniCookieStore.get("key");

        expect(cookieForGrantProvider).toEqual(null);
    });

    it("should get the actual value from cookie store", function () {
        bahmniCookieStore.put("key", {name: "value"}, {path: '/'});
        var cookieForGrantProvider = bahmniCookieStore.get("key");

        expect(cookieForGrantProvider).toEqual({name: 'value'});
    });

});