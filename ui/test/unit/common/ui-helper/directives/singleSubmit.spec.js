'use strict';

describe('single submit', function () {
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

    it('should allow the first submit', function () {
        var finallyHandler = jasmine.createSpy("finally");
        scope.submitFunction = jasmine.createSpy("submitFunction");
        scope.submitFunction.and.returnValue({'finally': finallyHandler});
        var element = angular.element("<button single-submit='submitFunction()'></button>");
        var compiled = $compile(element)(scope);
        scope.$digest();

        compiled.triggerHandler('submit');

        expect(element).not.toBeUndefined();
        expect(scope.submitFunction).toHaveBeenCalled();
        expect(finallyHandler).toHaveBeenCalled();
    });

    it('should not allow any submit until promise is resolved', function () {
        var deferred = $q.defer();
        scope.submitFunction = jasmine.createSpy("submitFunction");
        scope.submitFunction.and.returnValue(deferred.promise);
        var element = angular.element("<button single-submit='submitFunction()'></button>");
        var compiled = $compile(element)(scope);
        scope.$digest();

        compiled.triggerHandler('submit');

        expect(element).not.toBeUndefined();
        expect(scope.submitFunction.calls.count()).toEqual(1);
        compiled.triggerHandler('submit');
        deferred.resolve();
        scope.$apply();
        expect(scope.submitFunction.calls.count()).toEqual(1);
        compiled.triggerHandler('submit');
        expect(scope.submitFunction.calls.count()).toEqual(2);
    });
});