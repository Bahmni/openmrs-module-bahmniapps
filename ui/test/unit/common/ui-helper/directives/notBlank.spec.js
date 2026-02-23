/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


'use strict';

describe("Non Blank", function() {
    var element, scope, compile;

    beforeEach(module('bahmni.common.uiHelper'));

    beforeEach(inject(function($compile, $rootScope) {
        scope = $rootScope.$new();
        compile = $compile;
    }));

    it("should make the element mandatory if nonBlank directive is present", function () {
        element = angular.element('<input id="testId" non-blank></input>');
        compile(element)(scope);
        scope.$digest();
        expect(element.attr('required')).toBe("required");
    });
});