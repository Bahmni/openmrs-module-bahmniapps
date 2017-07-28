'use strict';

describe('ServiceAvailability', function () {
    var compile, scope, httpBackend, event, document;

    beforeEach(module('bahmni.appointments', function ($provide) {
        event = jasmine.createSpyObj('$event', ['stopPropagation']);
        $provide.value('$event', event);
    }));

    beforeEach(inject(function ($compile, $httpBackend, $rootScope, $document) {
        compile = $compile;
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        document = $document;
        httpBackend.expectGET('../i18n/appointments/locale_en.json').respond('<div></div>');
        httpBackend.expectGET('/bahmni_config/openmrs/i18n/appointments/locale_en.json').respond('<div></div>');
        httpBackend.expectGET('../appointments/views/admin/colorPicker.html').respond('<div></div>');
    }));

    var createElement = function () {
        var html = '<color-picker colors="colorsForAppointmentService" selected-color="service.color"></color-picker>';

        var element = compile(angular.element(html))(scope);
        scope.$digest();
        httpBackend.flush();
        return element;
    };

    it('Shold toggle the display of color picker on click the picker multiple times', function () {
        scope.colorsForAppointmentService = ["#DC143C", "#00008B", "#008B8B"];
        scope.selectedColor = "#DC143C";
        scope.showColorPicker = false;
        var element = createElement();
        var compiledElementScope = element.isolateScope();

        compiledElementScope.showTheColorPicker(event);
        expect(compiledElementScope.showColorPicker).toBeTruthy();
        expect(event.stopPropagation).toHaveBeenCalled();

        compiledElementScope.showTheColorPicker(event);
        expect(compiledElementScope.showColorPicker).toBeFalsy();
        expect(event.stopPropagation).toHaveBeenCalled();

        compiledElementScope.showTheColorPicker(event);
        expect(compiledElementScope.showColorPicker).toBeTruthy();
        expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('setColor should set the selectedColor field and close the color picker', function () {
        scope.colorsForAppointmentService = ["#DC143C", "#00008B", "#008B8B"];
        scope.selectedColor = "#DC143C";
        scope.showColorPicker = true;
        var element = createElement();
        var compiledElementScope = element.isolateScope();

        var pickedColorFromThePicker = "#00008B";
        compiledElementScope.setColor(pickedColorFromThePicker, event);
        expect(compiledElementScope.selectedColor).toBe(pickedColorFromThePicker);
        expect(compiledElementScope.showColorPicker).toBeFalsy();
        expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should close the color picker on clicking outside the picker, if the colorPicker is popped up', function () {
        scope.colorsForAppointmentService = ["#DC143C", "#00008B", "#008B8B"];
        scope.selectedColor = "#DC143C";
        scope.showColorPicker = true;
        var element = createElement();
        var compiledElementScope = element.isolateScope();
        spyOn(compiledElementScope, '$digest').and.callThrough();
        document.triggerHandler('click');
        expect(compiledElementScope.showColorPicker).toBeFalsy();
        expect(compiledElementScope.$digest).toHaveBeenCalled();
    });
});
