'use strict';

describe('ServiceAvailability', function () {
    var compile, scope, httpBackend, appService, appDescriptor;

    beforeEach(module('bahmni.appointments', function ($provide) {
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
        appService.getAppDescriptor.and.returnValue(appDescriptor);
        appDescriptor.getConfigValue.and.returnValue(1);

        $provide.value('appService', appService);
    }));

    beforeEach(inject(function ($compile, $httpBackend, $rootScope) {
        compile = $compile;
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        httpBackend.expectGET('../i18n/appointments/locale_en.json').respond({});
        httpBackend.expectGET('/bahmni_config/openmrs/i18n/appointments/locale_en.json').respond({});
        httpBackend.expectGET('../appointments/views/admin/appointmentServiceAvailability.html').respond('<div></div>');
    }));

    var createElement = function () {
        var html = '<service-availability availability="availability" availability-list="availabilityList" state="state" on-add-availability="toggleAdded()"></service-availability>';

        var element = compile(angular.element(html))(scope);
        scope.$digest();
        httpBackend.flush();
        return element;
    };

    it('should init availability and startOfWeek', function () {
        scope.availabilityList = [];
        expect(scope.availability).toBeUndefined();
        appDescriptor.getConfigValue.and.returnValue(2);
        var element = createElement();
        var compiledElementScope = element.isolateScope();

        expect(compiledElementScope.startOfWeek).toBe(2);
        expect(scope.availability).toEqual({});
    });

    describe('checkState', function () {
        it('isNew should return true if state is 0', function () {
            scope.state = 0;
            var element = createElement();
            var compiledElementScope = element.isolateScope();
            expect(compiledElementScope.isNew()).toBeTruthy();
            expect(compiledElementScope.isReadOnly()).toBeFalsy();
            expect(compiledElementScope.isEdit()).toBeFalsy();
        });

        it('isEdit should return true if state is 1', function () {
            scope.state = 1;
            var element = createElement();
            var compiledElementScope = element.isolateScope();
            expect(compiledElementScope.isEdit()).toBeTruthy();
            expect(compiledElementScope.isNew()).toBeFalsy();
            expect(compiledElementScope.isReadOnly()).toBeFalsy();
        });

        it('isReadOnly should return true if state is 2', function () {
            scope.state = 2;
            var element = createElement();
            var compiledElementScope = element.isolateScope();
            expect(compiledElementScope.isReadOnly()).toBeTruthy();
            expect(compiledElementScope.isNew()).toBeFalsy();
            expect(compiledElementScope.isEdit()).toBeFalsy();
        });
    });

    describe('validateAvailability', function () {
        it('should return true if all fields are valid', function () {
            scope.availability = {
                startTime: new Date().toString(),
                endTime: new Date().toString(),
                days: [{name: 'MONDAY', isSelected: true}]
            };
            scope.availabilityList = [];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.isValid()).toBeTruthy();
        });

        it('should return false if all fields are empty', function () {
            scope.availabilityList = [];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(scope.availability).toEqual({});
            expect(compiledElementScope.isValid()).toBeFalsy();
        });

        it('should return false if startTime is not filled', function () {
            scope.availability = {
                startTime: undefined,
                endTime: new Date().toString(),
                days: [{name: 'MONDAY', isSelected: true}]
            };
            scope.availabilityList = [];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.isValid()).toBeFalsy();
        });

        it('should return false if startTime is not filled', function () {
            scope.availability = {
                startTime: new Date().toString(),
                endTime: undefined,
                days: [{name: 'MONDAY', isSelected: true}]
            };
            scope.availabilityList = [];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.isValid()).toBeFalsy();
        });

        it('should return false if not even one day is selected', function () {
            scope.availability = {
                startTime: new Date().toString(),
                endTime: new Date().toString(),
                days: [{name: 'MONDAY', isSelected: false}]
            };
            scope.availabilityList = [];
            var element = createElement();
            var compiledElementScope = element.isolateScope();

            expect(compiledElementScope.isValid()).toBeFalsy();
        });
    });

    it('should add availability to weeklyAvailability list', function () {
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
        expect(compiledElementScope.availability).toEqual({});
    });

    it('should invoke function assigned to on-add-availability on add', function () {
        scope.toggleAdded = jasmine.createSpy('toggleAdded');
        scope.availabilityList = [];
        var element = createElement();
        var compiledElementScope = element.isolateScope();

        compiledElementScope.add();
        expect(scope.toggleAdded).toHaveBeenCalled();
    });

    it('should delete availability from weeklyAvailability list', function () {
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
        expect(compiledElementScope.availabilityList[0]).toEqual(availability1);
        expect(compiledElementScope.availabilityList[1]).toEqual(availability2);
        compiledElementScope.delete();
        expect(compiledElementScope.availabilityList.length).toBe(1);
        expect(compiledElementScope.availabilityList[0]).toEqual(availability2);
    });

    it('should change state to edit and take backup availability on enableEdit', function () {
        scope.state = 2;
        scope.availability = {
            startTime: new Date().toString(),
            endTime: new Date().toString(),
            days: [{name: 'MONDAY', isSelected: true}]
        };
        scope.availabilityList = [scope.availability];

        var element = createElement();
        var compiledElementScope = element.isolateScope();

        expect(compiledElementScope.state).toBe(2);
        compiledElementScope.enableEdit();
        expect(compiledElementScope.backUpAvailability).toBe(scope.availability);
        expect(compiledElementScope.availability).not.toBe(scope.availability);
        expect(compiledElementScope.availability).toEqual(scope.availability);
        expect(compiledElementScope.state).toBe(1);
    });

    it('should change state to readonly and restore availability on cancel', function () {
        scope.state = 1;
        scope.availability = {
            startTime: new Date().toString(),
            endTime: new Date().toString(),
            days: [{name: 'MONDAY', isSelected: true}]
        };
        scope.availabilityList = [scope.availability];

        var element = createElement();
        var compiledElementScope = element.isolateScope();

        expect(compiledElementScope.state).toBe(1);
        compiledElementScope.cancel();
        expect(compiledElementScope.availability).toBe(compiledElementScope.backUpAvailability);
        expect(compiledElementScope.state).toBe(2);
    });

    it('should update availability on weeklyAvailability list and set its state to read only', function () {
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
        scope.availabilityList = [availability1, availability2];
        var element = createElement();
        var compiledElementScope = element.isolateScope();

        expect(compiledElementScope.availabilityList.length).toBe(2);
        expect(compiledElementScope.availabilityList[0]).toEqual(availability1);
        expect(compiledElementScope.availabilityList[1]).toEqual(availability2);
        compiledElementScope.backUpAvailability = availability1;
        compiledElementScope.availability = {
            days: [{name: 'SUNDAY', isSelected: true}]
        };
        compiledElementScope.update();
        expect(compiledElementScope.availabilityList.length).toBe(2);
        expect(compiledElementScope.availabilityList[0]).toEqual(compiledElementScope.availability);
        expect(compiledElementScope.availabilityList[1]).toEqual(availability2);
        expect(compiledElementScope.state).toBe(2);
    });
});

