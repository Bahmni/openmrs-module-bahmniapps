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
