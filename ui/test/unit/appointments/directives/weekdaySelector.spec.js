'use strict';

describe('WeekdaySelector', function () {
    var compile, scope, httpBackend;

    beforeEach(module('bahmni.appointments'));

    beforeEach(inject(function ($compile, $httpBackend, $rootScope) {
        compile = $compile;
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        httpBackend.expectGET('../i18n/appointments/locale_en.json').respond({});
        httpBackend.expectGET('/bahmni_config/openmrs/i18n/appointments/locale_en.json').respond({});
    }));

    var createElement = function () {
        var html = '<weekday-selector ng-model="days" week-starts-index="startOfWeek" ng-disabled="disabled" ng-change="toggleChanged()"></weekday-selector>';

        var element = compile(angular.element(html))(scope);
        scope.$digest();
        httpBackend.flush();
        return element;
    };

    it('should assign days to ngmodel', function () {
        expect(scope.days).toBeUndefined();
        createElement();

        expect(scope.days).not.toBeUndefined();
        expect(scope.days).toBe(0);
    });

    it('should display first two letters of day name', function () {
        scope.startOfWeek = 2;
        var element = createElement();
        expect($(element).find('#day-0').text()).toEqual('Mo');
        expect($(element).find('#day-1').text()).toEqual('Tu');
        expect($(element).find('#day-6').text()).toEqual('Su');
    });

    it('should check if nth bit is set', function () {
        scope.days = 4;
        var element = createElement();
        var compiledScope = element.isolateScope();
        expect(compiledScope.isBitSet(0)).toBeFalsy();
        expect(compiledScope.isBitSet(1)).toBeFalsy();
        expect(compiledScope.isBitSet(2)).toBeTruthy();
    });

    it('should toggle nth bit of days value when nth day is clicked', function () {
        scope.startOfWeek = 1;
        var element = createElement();
        var monDay = $(element).find('#day-1');
        expect(monDay.hasClass('is-selected')).toBeFalsy();
        expect(scope.days).toBe(0);
        monDay.click();
        expect(monDay.hasClass('is-selected')).toBeTruthy();
        expect(scope.days).toBe(2);
        monDay.click();
        expect(scope.days).toBe(0);
        expect(monDay.hasClass('is-selected')).toBeFalsy();
    });

    it('should not toggle nth bit if ngDisabled is true', function () {
        scope.disabled = true;
        var element = createElement();
        var monDay = $(element).find('#day-1');
        expect(scope.days).toBe(0);
        monDay.click();
        expect(scope.days).toBe(0);
    });

    it('should call function provided to ngChange when data is changed', function () {
        scope.toggleChanged = jasmine.createSpy('toggleChanged');
        var element = createElement();

        var sunDay = $(element).find('#day-0');
        sunDay.click();
        expect(scope.toggleChanged).toHaveBeenCalled();
    });
});
