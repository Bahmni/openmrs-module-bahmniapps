describe("bmShowTest", function () {
 var element, scope;

beforeEach(module('bahmni.common.uiHelper'));

 beforeEach(inject(function($rootScope, $compile) {
    scope = $rootScope.$new();

    element = angular.element('<div bm-show="condition">Hello</div>');

    element = $compile(element)(scope);
  }));

  it("should hide the elements if the condition is false", function() {
    scope.condition = false;
    scope.$digest();

    expect(element.hasClass('ng-hide')).toBe(true);
  })

  it("should show the elements if the condition is true", function() {
    scope.condition = true;
    scope.$digest();

    expect(element.hasClass('ng-hide')).toBe(false);
  })
})