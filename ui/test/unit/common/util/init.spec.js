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