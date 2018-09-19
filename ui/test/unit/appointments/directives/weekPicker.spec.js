'use strict';

describe('WeekPicker', function () {
    var compile, scope, httpBackend;

    beforeEach(module('bahmni.appointments'));

    beforeEach(inject(function ($compile, $httpBackend, $rootScope) {
        compile = $compile;
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        httpBackend.expectGET('../i18n/appointments/locale_en.json').respond({});
        httpBackend.expectGET('/bahmni_config/openmrs/i18n/appointments/locale_en.json').respond({});
        httpBackend.expectGET('../appointments/views/manage/weekPicker.html').respond('<div></div>');
    }));

    var createElement = function () {
        var html = '<week-picker view-date="viewDate" on-change="toggleChanged" week-start="weekStart" show-buttons="true"></week-picker>';

        var element = compile(angular.element(html))(scope);
        scope.$digest();
        httpBackend.flush();
        return element;
    };

    it('should init view date to today if undefined', function () {
        scope.viewDate = undefined;
        scope.toggleChanged = jasmine.createSpy('toggleChanged');
        createElement();
        expect(scope.viewDate).toEqual(moment().startOf('day').toDate());
    });

    it('should call function provided to ngChange when data is changed with week start day as Monday', function () {
        scope.weekStart = 1;
        scope.toggleChanged = jasmine.createSpy('toggleChanged');
        scope.viewDate = moment("2017-02-01").toDate();
       createElement();
        expect(scope.toggleChanged.calls.mostRecent().args[0])
            .toEqual(moment("2017-01-30").toDate());
        expect(scope.toggleChanged.calls.mostRecent().args[1])
            .toEqual(moment("2017-02-05").endOf('day').toDate());
    });

    it('should call function provided to ngChange when data is changed with week start day as Sunday', function () {
        scope.weekStart = 7;
        scope.toggleChanged = jasmine.createSpy('toggleChanged');
        scope.viewDate = moment("2017-02-01").toDate();
        createElement();
        expect(scope.toggleChanged.calls.mostRecent().args[0])
            .toEqual(moment("2017-01-29").toDate());
        expect(scope.toggleChanged.calls.mostRecent().args[1])
            .toEqual(moment("2017-02-04").endOf('day').toDate());
    });


    it('should set the view date to next week when goToNextWeek is clicked', function () {
        scope.toggleChanged = jasmine.createSpy('toggleChanged');
        var element = createElement();
        var compiledElementScope = element.isolateScope();

        compiledElementScope.viewDate = moment("2017-02-01").toDate();
        compiledElementScope.goToNextWeek();
        expect(compiledElementScope.viewDate).toEqual(moment("2017-02-08").toDate());
    });

    it('should set the view date to previous week when goToPreviousWeek is clicked', function () {
        scope.toggleChanged = jasmine.createSpy('toggleChanged');
        var element = createElement();
        var compiledElementScope = element.isolateScope();

        compiledElementScope.viewDate = moment("2017-02-01").toDate();
        compiledElementScope.goToPreviousWeek();
        expect(compiledElementScope.viewDate).toEqual(moment("2017-01-25").toDate());
    });


});

