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

    it("should call function in ng condition", function() {
        scope.canBeSHown = true;
        scope.isClickEnable = function(){return true;}
        scope.$digest();
        spyOn(scope, 'isClickEnable');
        element.triggerHandler('click');
        expect(scope.isClickEnable).toHaveBeenCalled();
    });

    it("should call function in condition message ", function() {
        compileDirective('<button ng-show="canBeShown" ng-confirm-click="clickFunction()" ng-condition="isClickEnable()" confirm-message="Do you want to continue ?" condition-message="getMessage()">Close Visit</button>');
        scope.canBeSHown = true;
        scope.isClickEnable = function(){return true;}
        spyOn(scope, 'isClickEnable');
        scope.getMessage = function(){return "message";}
        spyOn(scope, 'getMessage');
        element.triggerHandler('click');
        scope.$digest();
        expect(scope.getMessage).toHaveBeenCalled();
    });

});