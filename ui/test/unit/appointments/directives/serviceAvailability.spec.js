'use strict';

describe('ServiceAvailability', function () {
    var compile, scope, httpBackend;

    beforeEach(module('bahmni.appointments'));

    beforeEach(inject(function ($compile, $httpBackend, $rootScope) {
        compile = $compile;
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        httpBackend.expectGET('../i18n/appointments/locale_en.json').respond({});
        httpBackend.expectGET('/bahmni_config/openmrs/i18n/appointments/locale_en.json').respond({});
        httpBackend.expectGET('../appointments/views/admin/appointmentServiceAvailability.html').respond('<div></div>');
    }));

    var createElement = function () {
        var html = '<service-availability availability="availability" availability-list="availabilityList" state="state"></service-availability>';

        var element = compile(angular.element(html))(scope);
        scope.$digest();
        httpBackend.flush();
        return element;
    };

    it('should init index of the availability', function () {
        scope.state = 2;
        scope.availability = {
            startTime: new Date().toString(),
            endTime: new Date().toString(),
            days: [{name: 'MONDAY', isSelected: true}]
        };
        scope.availabilityList = [];
        scope.availabilityList.push(scope.availability);

        var element = createElement();
        var compiledElementScope = element.isolateScope();

        expect(compiledElementScope.index).toBe(0);
    });

    iit('should add availability to weeklyAvailability list', function () {
        scope.availability = {
            startTime: new Date().toString(),
            endTime: new Date().toString(),
            days: [{name: 'MONDAY', isSelected: true}]
        };
        scope.availabilityList = [];
        var element = createElement();
        var compiledElementScope = element.isolateScope();
        expect(compiledElementScope.availabilityList.length).toBe(0);
        compiledElementScope.add();
        expect(compiledElementScope.availabilityList.length).toBe(1);
        expect(compiledElementScope.availabilityList[0]).toEqual(scope.availability);
        expect(scope.availability).toBe({});
    });

    iit('should delete availability from weeklyAvailability list', function () {
        var availability1 = {
            startTime: new Date().toString(),
            endTime: new Date().toString(),
            days: [{name: 'MONDAY', isSelected: true}]
        };
        var availability2 = {
            startTime: new Date().toString(),
            endTime: new Date().toString(),
            days: [{name: 'TUESDAY', isSelected: true}]
        };

        scope.availability = availability1;
        scope.availabilityList = [];
        scope.availabilityList.push(scope.availability);
        scope.availabilityList.push(availability2);

        var element = createElement();
        var compiledElementScope = element.isolateScope();
        expect(compiledElementScope.availabilityList.length).toBe(2);
        expect(compiledElementScope.availabilityList[0]).toEqual(scope.availability);
        expect(compiledElementScope.availabilityList[1]).toEqual(availability2);
        compiledElementScope.delete();
        expect(compiledElementScope.availabilityList.length).toBe(1);
        expect(compiledElementScope.availabilityList[0]).toEqual(availability2);
    });
});

