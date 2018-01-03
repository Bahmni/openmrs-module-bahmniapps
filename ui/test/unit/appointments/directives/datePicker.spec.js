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
        var html = '<date-picker view-date="viewDate" on-change="toggleChanged()"></date-picker>';

        var element = compile(angular.element(html))(scope);
        scope.$digest();
        httpBackend.flush();
        return element;
    };

    it('should init view date to today if undefined', function () {
        scope.viewDate = undefined;
        createElement();
        expect(scope.viewDate).toEqual(moment().startOf('day').toDate());
    });

    it('should call function provided to ngChange when data is changed', function () {
        scope.toggleChanged = jasmine.createSpy('toggleChanged');
        var element = createElement();
        var compileElementScope = element.isolateScope();

        compileElementScope.goToNext();
        expect(scope.toggleChanged).toHaveBeenCalled();
    });
});

