describe("stringToNumber", function () {
    var element, scope, ngModelCtrl;

    beforeEach(module('bahmni.ot'));

    beforeEach(inject(function($compile, $rootScope) {
        scope = $rootScope.$new();
        element = angular.element('<input type="number" ng-model="cleaningTime" string-to-number min="0" max="59">');
        element = $compile(element)(scope);
        ngModelCtrl = element.controller('ngModel');
        scope.$digest();
    }));

    it("should convert the string into number", function() {
        element.val("15");
        element.triggerHandler("input");

        scope.$digest();

        expect(ngModelCtrl.$modelValue).toEqual(15);
    });

});