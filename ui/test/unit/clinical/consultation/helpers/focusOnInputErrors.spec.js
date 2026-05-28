/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

describe('focusOnInputErrors', function () {
    var
        compile,
        rootScope,
        scope,
        element,
        timeout,
        simpleHtml = '<concept-set-group patient="patient" consultation="consultation" observations="consultation.observations" focus-on-input-errors>' +
                        '<input value="" >' +
                        '<input value="1" class="illegalValue">' +
                        '<input value="2" class="illegalValue">'
                    '</concept-set-group>';

    beforeEach(module('bahmni.common.uiHelper'), function () {
    });

    beforeEach(inject(function ($compile, $rootScope, $timeout) {
        compile = $compile;
        rootScope = $rootScope;
        timeout = $timeout;
        scope = rootScope.$new();
        element = compile(simpleHtml)(scope);
        scope.$digest();

    }));

    it('should focus only on the first errored element', function () {
        spyOn($.fn, 'focus');
        scope.$parent.$broadcast("event:errorsOnForm");
        timeout.flush();
        expect($.fn.focus).toHaveBeenCalled();
    });
});