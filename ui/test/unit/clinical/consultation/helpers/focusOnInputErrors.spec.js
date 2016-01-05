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
        spyOn(element.children()[1], 'focus');
        scope.$parent.$broadcast("event:errorsOnForm");
        timeout.flush();
        expect(element.children()[1].focus).toHaveBeenCalled();
    });

    it('should not focus on the second errored element', function () {
        spyOn(element.children()[2], 'focus');
        scope.$parent.$broadcast("event:errorsOnForm");
        timeout.flush();
        expect(element.children()[2].focus).not.toHaveBeenCalled();

    });

    it('should not focus on an element if not errored', function () {
        spyOn(element.children()[0], 'focus');
        scope.$parent.$broadcast("event:errorsOnForm");
        timeout.flush();
        expect(element.children()[0].focus).not.toHaveBeenCalled();
    });

    it('should focus only on the div with button for invalid coded answers', function () {
        simpleHtml = '<concept-set-group patient="patient" consultation="consultation" observations="consultation.observations" focus-on-input-errors>' +
            '<input value="" >' +
            '<div class="illegalValue"><button-select></button-select> </div>'
        '</concept-set-group>';
        element = compile(simpleHtml)(scope);
        spyOn(element.children()[1], 'focus');
        scope.$parent.$broadcast("event:errorsOnForm");
        timeout.flush();
        expect(element.children()[1].focus).toHaveBeenCalled();
    });

});