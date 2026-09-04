'use strict';

describe("directive: duration", function () {

    var element, $compile, $rootScope, scope, contextChangeHandler;

    beforeEach(module('bahmni.common.conceptSet'));

    beforeEach(module(function ($provide) {
        contextChangeHandler = jasmine.createSpyObj('contextChangeHandler', ['add']);
        $provide.value('contextChangeHandler', contextChangeHandler);
    }));

    beforeEach(inject(['$compile', '$rootScope', function (compile, rootScope) {
        $compile = compile;
        $rootScope = rootScope;
    }]));

    var compileDuration = function (html) {
        scope = $rootScope.$new();
        element = angular.element(html);
        $compile(element)(scope);
        scope.$apply();
    };

    afterEach(function () {
        if (scope) {
            scope.$destroy();
        }
    });

    it("should call onChange callback when value changes", function () {
        var onChangeSpy = jasmine.createSpy('onChange');
        scope = $rootScope.$new();
        scope.hours = 60;
        scope.onChange = onChangeSpy;

        element = angular.element('<duration ng-model="hours" on-change="onChange()"></duration>');
        $compile(element)(scope);
        scope.$apply();

        var isolateScope = element.isolateScope();
        isolateScope.measureValue = 2;
        isolateScope.unitValue = 30;
        scope.$apply();

        expect(onChangeSpy).toHaveBeenCalled();
    });

    it("should call onChange callback when unit changes", function () {
        var onChangeSpy = jasmine.createSpy('onChange');
        scope = $rootScope.$new();
        scope.hours = 60;
        scope.onChange = onChangeSpy;

        element = angular.element('<duration ng-model="hours" on-change="onChange()"></duration>');
        $compile(element)(scope);
        scope.$apply();

        var isolateScope = element.isolateScope();
        // hours=60 renders as 1 Hour, so switch the unit to Days for a real change
        isolateScope.unitValue = 24 * 60;
        scope.$apply();

        expect(onChangeSpy).toHaveBeenCalled();
    });

    it("should call onChange when value is cleared", function () {
        var onChangeSpy = jasmine.createSpy('onChange');
        scope = $rootScope.$new();
        scope.hours = 60;
        scope.onChange = onChangeSpy;

        element = angular.element('<duration ng-model="hours" on-change="onChange()"></duration>');
        $compile(element)(scope);
        scope.$apply();

        var isolateScope = element.isolateScope();
        isolateScope.measureValue = undefined;
        isolateScope.unitValue = undefined;
        scope.$apply();

        expect(onChangeSpy).toHaveBeenCalled();
    });

    it("should not fail when onChange is not provided", function () {
        scope = $rootScope.$new();
        scope.hours = 60;

        element = angular.element('<duration ng-model="hours"></duration>');
        $compile(element)(scope);
        scope.$apply();

        var isolateScope = element.isolateScope();
        expect(function () {
            isolateScope.measureValue = 2;
            isolateScope.unitValue = 30;
            scope.$apply();
        }).not.toThrow();
    });

    it("should not call onChange on first render, with no user interaction", function () {
        var onChangeSpy = jasmine.createSpy('onChange');
        scope = $rootScope.$new();
        scope.hours = 60;
        scope.onChange = onChangeSpy;

        element = angular.element('<duration ng-model="hours" on-change="onChange()"></duration>');
        $compile(element)(scope);
        scope.$apply();
        scope.$apply();

        expect(onChangeSpy).not.toHaveBeenCalled();
    });

    it("should not call onChange on first render when the model starts empty", function () {
        var onChangeSpy = jasmine.createSpy('onChange');
        scope = $rootScope.$new();
        scope.onChange = onChangeSpy;

        element = angular.element('<duration ng-model="hours" on-change="onChange()"></duration>');
        $compile(element)(scope);
        scope.$apply();
        scope.$apply();

        expect(onChangeSpy).not.toHaveBeenCalled();
    });
});
