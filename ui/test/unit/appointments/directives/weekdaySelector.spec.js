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
        var element = createElement();
        var compiledScope = element.isolateScope();

        expect(scope.days).not.toBeUndefined();
        expect(scope.days).toEqual(compiledScope.constDays);
    });

    it('should display first two letters of day name', function () {
        scope.startOfWeek = 2;
        var element = createElement();
        expect($(element).find('#day-0').text()).toEqual('MONDAY');
        expect($(element).find('#day-1').text()).toEqual('TUESDAY');
        expect($(element).find('#day-6').text()).toEqual('SUNDAY');
    });

    it('should toggle isSelected of a day when clicked', function () {
        scope.startOfWeek = 1;
        var element = createElement();
        var monDay = $(element).find('#day-1');
        expect(monDay.hasClass('is-selected')).toBeFalsy();
        expect(scope.days[1].isSelected).toBeFalsy();
        monDay.click();
        expect(monDay.hasClass('is-selected')).toBeTruthy();
        expect(scope.days[1].isSelected).toBeTruthy();
        monDay.click();
        expect(monDay.hasClass('is-selected')).toBeFalsy();
        expect(scope.days[1].isSelected).toBeFalsy();
    });

    it('should not toggle isSelected of a day if ngDisabled is true', function () {
        scope.disabled = true;
        var element = createElement();
        var monDay = $(element).find('#day-1');
        expect(scope.days[1].isSelected).toBeFalsy();
        monDay.click();
        expect(scope.days[1].isSelected).toBeFalsy();
    });

    it('should call function provided to ngChange when data is changed', function () {
        scope.toggleChanged = jasmine.createSpy('toggleChanged');
        var element = createElement();

        var sunDay = $(element).find('#day-0');
        sunDay.click();
        expect(scope.toggleChanged).toHaveBeenCalled();
    });
});
