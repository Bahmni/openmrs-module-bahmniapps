'use strict';

describe('DatePicker', function () {
    var compile, scope, httpBackend;

    beforeEach(module('bahmni.appointments'));

    beforeEach(inject(function ($compile, $httpBackend, $rootScope) {
        compile = $compile;
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        httpBackend.expectGET('../i18n/appointments/locale_en.json').respond({});
        httpBackend.expectGET('/bahmni_config/openmrs/i18n/appointments/locale_en.json').respond({});
        httpBackend.expectGET('../appointments/views/manage/datePicker.html').respond('<div></div>');
    }));

    var createElement = function () {
        var html = '<date-picker view-date="viewDate" last-valid-date="lastValidDate"' +
            ' on-change="toggleChanged" show-buttons="true"></date-picker>';

        var element = compile(angular.element(html))(scope);
        scope.$digest();
        httpBackend.flush();
        return element;
    };

    it('should init view date to the last valid date if undefined', function () {
        scope.viewDate = undefined;
        scope.toggleChanged = jasmine.createSpy('toggleChanged');
        createElement();
        expect(scope.viewDate).toEqual(scope.lastValidDate);
    });

    it('should call function provided to ngChange when data is changed', function () {
        scope.toggleChanged = jasmine.createSpy('toggleChanged');
        var element = createElement();
        var compileElementScope = element.isolateScope();

        compileElementScope.goToNext();
        expect(scope.toggleChanged).toHaveBeenCalled();
    });

    it('should call function provided to ngChange when data is changed and enter key is pressed', function () {
        scope.toggleChanged = jasmine.createSpy('toggleChanged');
        var element = createElement();
        var compileElementScope = element.isolateScope();

        compileElementScope.goToNext();
        var e = $.Event("keydown");
        e.which = 13;
        e.keyCode = 13;
        element.triggerHandler(e);
        expect(scope.toggleChanged).toHaveBeenCalled();
    });

    it('should not call function provided to ngChange when data is not changed', function () {
        scope.toggleChanged = jasmine.createSpy('toggleChanged');
        var element = createElement();

        var e1 = $.Event("focus");
        element.triggerHandler(e1);
        var e2 = $.Event("blur");
        element.triggerHandler(e2);

        expect(scope.viewDate).toEqual(scope.lastValidDate);
    });

    it('should call function provided to ngChange when data is changed and mouse is pressed outside', function () {
        scope.toggleChanged = jasmine.createSpy('toggleChanged');
        var element = createElement();
        var compileElementScope = element.isolateScope();

        compileElementScope.goToNext();
        var e = $.Event("blur");
        element.triggerHandler(e);
        expect(scope.toggleChanged).toHaveBeenCalled();
    });

});
