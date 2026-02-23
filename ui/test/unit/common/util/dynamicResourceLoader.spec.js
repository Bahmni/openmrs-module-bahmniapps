/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

describe('DynamicResourceLoader', function () {
    validate_name = jasmine.createSpyObj('validate_name', ['method']);
    var dynamicResourceLoader = Bahmni.Common.Util.DynamicResourceLoader;

    it("include js", function () {
        var msg = dynamicResourceLoader.includeJs("https://www.example.com/scripts/a.js");
        var x  = document.body.getElementsByTagName("script");
        expect(x[x.length-1].getAttribute("src")).toBe("https://www.example.com/scripts/a.js");
    });

    it("include css", function () {
        var msg = dynamicResourceLoader.includeCss("https://www.example.com/scripts/a.css");
        var x  = document.head.getElementsByTagName("link");
        expect(x[x.length-1].getAttribute("href")).toBe("https://www.example.com/scripts/a.css");
        expect(x[x.length-1].getAttribute("rel")).toBe("stylesheet");
        expect(x[x.length-1].getAttribute("type")).toBe("text/css");
    });
});