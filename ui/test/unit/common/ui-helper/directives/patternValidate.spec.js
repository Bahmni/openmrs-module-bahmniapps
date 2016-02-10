'use strict';

describe("Pattern Validate", function() {
    var element, scope, compile,timeout;

    beforeEach(module('bahmni.common.uiHelper'));

    beforeEach(inject(function($compile, $rootScope, $timeout) {
        scope = $rootScope.$new();
        compile = $compile;
        timeout = $timeout
        element = angular.element('<input id="testId" pattern-validate></input>');

    }));

    it("should apply the pattern and title to the element if it is part of field validation", function () {
        scope.fieldValidation = {testId: {pattern: "[0-9]{3}", errorMessage: "Should contain 3 numbers"}};
        compile(element)(scope);
        timeout.flush();

        expect(element.attr('pattern')).toBe("[0-9]{3}");
        expect(element.attr('title')).toBe("Should contain 3 numbers");
    });

    it("should not apply the pattern and title to the element if it is not part of field validation", function () {
        scope.fieldValidation = {};
        compile(element)(scope);
        timeout.flush();

        expect(element.attr('pattern')).not.toBe("[0-9]{3}");
        expect(element.attr('title')).not.toBe("Should contain 3 numbers");
    });

    it("should not apply the pattern and title to the element if field validation is not present in scope", function () {
        compile(element)(scope);
        timeout.flush();
        
        expect(element.attr('pattern')).not.toBe("[0-9]{3}");
        expect(element.attr('title')).not.toBe("Should contain 3 numbers");
    });

});