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