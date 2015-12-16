'use strict';

describe('focusOnInputErrors', function () {
    var
        compile,
        rootScope,
        scope,
        element,
        simpleHtml = '<concept-set-group patient="patient" consultation="consultation" observations="consultation.observations" focus-on-input-errors>' +
                        '<input value="" >' +
                        '<input value="" class="illegalValue">' +
                        '<input value="" class="illegalValue">' +
                    '</concept-set-group>';

    beforeEach(module('bahmni.common.uiHelper'), function () {
    });

    beforeEach(inject(function ($compile, $rootScope) {
        compile = $compile;
        rootScope = $rootScope;
        scope = rootScope.$new();
        element = compile(simpleHtml)(scope);
        scope.$digest();

    }));

    it('should focus only on the first errored element', function () {
        spyOn(element.children()[1], 'focus');
        scope.$parent.$broadcast("event:errorsOnForm");
        expect(element.children()[1].focus).toHaveBeenCalled();

    });

    it('should not focus on the second errored element', function () {
        spyOn(element.children()[2], 'focus');
        scope.$parent.$broadcast("event:errorsOnForm");
        expect(element.children()[2].focus).not.toHaveBeenCalled();

    });

    it('should not focus on an element if not errored', function () {
        spyOn(element.children()[0], 'focus');
        scope.$parent.$broadcast("event:errorsOnForm");
        expect(element.children()[0].focus).not.toHaveBeenCalled();
    });

});