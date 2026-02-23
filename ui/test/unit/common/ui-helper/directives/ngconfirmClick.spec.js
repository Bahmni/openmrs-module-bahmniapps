/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */


describe("ngConfirmClick", function () {
    var element, scope;

    beforeEach(module('bahmni.common.uiHelper'));

    beforeEach(inject(function($rootScope) {
        scope = $rootScope.$new();

        compileDirective();
    }));

    function compileDirective(tpl) {
        if (!tpl) tpl = '<button ng-show="canBeShown" ng-confirm-click="clickFunction()" ng-condition="isClickEnable()"' +
        ' confirm-message="Do you want to continue ?">';

        inject(function($compile) {
             element = $compile(tpl)(scope);
        });
        scope.$digest();
    }


    it("should hide the elements if the condition to show is false", function() {
        scope.canBeShown = false;
        scope.$digest();

        expect(element.hasClass('ng-hide')).toBe(true);
    });

    it("should show the elements if the condition to show is true", function() {
        scope.canBeShown = true;
        scope.$digest();

        expect(element.hasClass('ng-hide')).toBe(false);
    });

});