/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


describe("assignHeight", function () {
    var element, scope, compile;

    beforeEach(module('bahmni.common.uiHelper'));

    beforeEach(inject(function($rootScope, $compile) {
        scope = $rootScope.$new();
        compile = $compile
    }));

    it("should take the height of the element if the key is defined", function() {
        element = angular.element('<div assign-height key="contentHeight"></div>');
        element = compile(element)(scope);
        scope.$digest();

        expect(scope.contentHeight).toEqual({height: 0});
    })

    it("should be undefined if the key is undefined", function() {
        element = angular.element('<div assign-height></div>');
        element = compile(element)(scope);
        scope.$digest();

        expect(scope.contentHeight).toBeUndefined();
    })
});
