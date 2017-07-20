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
        var html = '<weekday-selector ng-model="days" week-starts-index="startOfWeek" ng-change="toggleChanged()"></weekday-selector>';

        var element = compile(angular.element(html))(scope);
        scope.$digest();
        httpBackend.flush();
        return element;
    };

    it('should assign days to ngmodel', function () {
        var element = createElement();
        var compiledElementScope = element.isolateScope();

        expect(scope.days).not.toBeUndefined();
        expect(scope.days.length).toBe(7);
        expect(scope.days).toEqual(compiledElementScope.constDays);
    });

    it('should take 1 as weekStartsIndex by default', function () {
        scope.startOfWeek = undefined;
        var element = createElement();
        var compiledElementScope = element.isolateScope();

        expect(compiledElementScope.weekStartsIndex).toBe(1);
    });

    it('should display first two letters of day name', function () {
        var element = createElement();
        expect($(element).find('#day-0').text()).toEqual('Su');
        expect($(element).find('#day-1').text()).toEqual('Mo');
        expect($(element).find('#day-6').text()).toEqual('Sa');
    });

    it('should toggle isSelected of a day when clicked', function () {
        var element = createElement();
        var monDay = $(element).find('#day-1');
        expect(scope.days[1].isSelected).toBeFalsy();
        monDay.click();
        expect(scope.days[1].isSelected).toBeTruthy();
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
