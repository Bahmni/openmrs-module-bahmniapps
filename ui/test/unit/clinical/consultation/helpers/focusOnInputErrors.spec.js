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