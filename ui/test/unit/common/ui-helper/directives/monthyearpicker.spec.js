'use strict';

describe('monthyearpicker', function () {
    var
        $compile,
        rootScope,
        scope,
        translate;

        translate = jasmine.createSpyObj('$translate', ['instant']);
    beforeEach(module('bahmni.common.uiHelper'), function ($provide) {

        $provide.value('$translate', translate);

    });

    beforeEach(module('pascalprecht.translate'));


    beforeEach(inject(function (_$compile_, $rootScope) {
        $compile = _$compile_;
        rootScope = $rootScope;
        scope = rootScope.$new();
    }));

    function createDirective() {
        var elem, compiledElem;
        scope.modelValue = "2010-09-28";

        var simpleHtml = '<monthyearpicker min-year="2000" max-year="2016" illegal-value="false" model="modelValue"></monthyearpicker>';
        elem = angular.element(simpleHtml);
        compiledElem = $compile(elem)(scope);
        compiledElem.scope().$digest();

        return compiledElem;
    }

    it('should set month and year from the date', function () {
        var el = createDirective();
        var isolatedScope = el.isolateScope();

        isolatedScope.$apply();

        expect(isolatedScope.minYear).toEqual(2000);
        expect(isolatedScope.maxYear).toEqual(2016);
        expect(isolatedScope.model).toEqual("2010-09-28");
        expect(isolatedScope.selectedMonth).toEqual(8);
        expect(isolatedScope.selectedYear).toEqual(2010);
    });

    it('should display twelve months and number of years as per configuration', function () {
        var el = createDirective();
        var isolatedScope = el.isolateScope();

        isolatedScope.$apply();
        expect(isolatedScope.years.length).toEqual(17);
        expect(isolatedScope.monthNames.length).toEqual(1);
    });

    it('should set the date to first of month', function () {
        var el = createDirective();
        var isolatedScope = el.isolateScope();

        isolatedScope.$apply();

        isolatedScope.updateModel();
        expect(isolatedScope.model).toEqual("2010-9-01");
    });

    it('should set illegal month/year false if month and year are undefined', function () {
        var el = createDirective();
        var isolatedScope = el.isolateScope();

        isolatedScope.$apply();

        isolatedScope.updateModel();
        isolatedScope.selectedYear = "undefined";
        isolatedScope.selectedMonth = "undefined";
        expect(isolatedScope.illegalMonth()).toBeFalsy();
        expect(isolatedScope.illegalYear()).toBeFalsy();

    });

    it('should set illegal year true if month is present and year is undefined or null', function () {
        var el = createDirective();
        var isolatedScope = el.isolateScope();

        isolatedScope.$apply();
        isolatedScope.updateModel();

        isolatedScope.selectedYear = undefined;
        isolatedScope.selectedMonth = "06";
        expect(isolatedScope.illegalYear()).toBeTruthy();
        isolatedScope.selectedYear = null;
        expect(isolatedScope.illegalYear()).toBeTruthy();

    });

    it('should set illegal month true if year is present and month is undefined or null', function () {
        var el = createDirective();
        var isolatedScope = el.isolateScope();

        isolatedScope.$apply();
        isolatedScope.updateModel();

        isolatedScope.selectedYear = "2010";
        isolatedScope.selectedMonth = undefined;
        expect(isolatedScope.illegalMonth()).toBeTruthy();
        isolatedScope.selectedMonth = null;
        expect(isolatedScope.illegalMonth()).toBeTruthy();

    });
});