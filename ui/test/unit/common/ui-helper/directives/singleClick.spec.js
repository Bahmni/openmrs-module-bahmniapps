'use strict';

describe('single click', function () {
    var scope, $compile, provide, $q;

    beforeEach(module('bahmni.common.uiHelper', function ($provide) {
        provide = $provide;
    }));

    beforeEach(inject(function (_$compile_, $rootScope, _$q_) {
        scope = $rootScope;
        provide.value('$rootScope', $rootScope);
        $compile = _$compile_;
        $q = _$q_;
    }));

    it('should allow the first click', function () {
        var finallyHandler = jasmine.createSpy("finally");
        scope.clickFunction = jasmine.createSpy("clickFunction");
        scope.clickFunction.and.returnValue({'finally': finallyHandler});
        var element = angular.element("<button single-click='clickFunction()'></button>");
        var compiled = $compile(element)(scope);
        scope.$digest();

        compiled.triggerHandler('click');

        expect(element).not.toBeUndefined();
        expect(scope.clickFunction).toHaveBeenCalled();
        expect(finallyHandler).toHaveBeenCalled();
    });

    it('should not allow any click until promise is resolved', function () {
        var deferred = $q.defer();
        scope.clickFunction = jasmine.createSpy("clickFunction");
        scope.clickFunction.and.returnValue(deferred.promise);
        var element = angular.element("<button single-click='clickFunction()'></button>");
        var compiled = $compile(element)(scope);
        scope.$digest();

        compiled.triggerHandler('click');

        expect(element).not.toBeUndefined();
        expect(scope.clickFunction.calls.count()).toEqual(1);
        compiled.triggerHandler('click');
        deferred.resolve();
        scope.$apply();
        expect(scope.clickFunction.calls.count()).toEqual(1);
        compiled.triggerHandler('click');
        expect(scope.clickFunction.calls.count()).toEqual(2);
    });
});