'use strict';

describe('ServiceTypes', function () {
    var compile, scope, httpBackend, serviceTypeName;

    serviceTypeName = jasmine.createSpyObj('serviceTypeName', ['$setValidity']);

    beforeEach(module('bahmni.appointments'));

    beforeEach(inject(function ($compile, $httpBackend, $rootScope) {
        compile = $compile;
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        httpBackend.expectGET('../i18n/appointments/locale_en.json').respond({});
        httpBackend.expectGET('/bahmni_config/openmrs/i18n/appointments/locale_en.json').respond({});
        httpBackend.expectGET('../appointments/views/admin/serviceTypes.html').respond('<div></div>');
        scope.service = {
            name: 'Ortho',
            description: 'for Ortho appointments',
            startTime: new Date().toString(),
            endTime: new Date().toString(),
            serviceTypes: []
        };
        var element = createElement();
        scope = element.isolateScope();
        scope.serviceTypesForm = {serviceTypeName: serviceTypeName};
    }));

    var createElement = function () {
        var html = '<service-types service="service"></service-types>';
        var element = compile(angular.element(html))(scope);
        scope.$digest();
        httpBackend.flush();
        return element;
    };

    it("should validate to false if duplicate service type name is added", function () {
        var serviceType = {name: 'Type1', duration: 15};
        scope.addServiceType(serviceType);
        var duplicateServiceType = {name: 'Type1', duration: 15};
        scope.addServiceType(duplicateServiceType);
        expect(serviceTypeName.$setValidity).toHaveBeenCalledWith('uniqueServiceTypeName', false);
    });

    it("should validate to true if unique service type is added", function () {
        var serviceType = {name: 'Type1', duration: 15};
        scope.addServiceType(serviceType);
        var duplicateServiceType = {name: 'Type1', duration: 30};
        scope.addServiceType(duplicateServiceType);
        expect(serviceTypeName.$setValidity).toHaveBeenCalledWith('uniqueServiceTypeName', true);
    });

    it("should clear the service type name and duration after adding a serviceType", function () {
        scope.serviceType.name = 'Type1';
        scope.serviceType.duration = 30;
        scope.addServiceType(scope.serviceType);
        expect(scope.serviceType.name).toBeUndefined();
        expect(scope.serviceType.duration).toBeUndefined();
    });

    it("should add service type name and duration to service", function () {
        scope.serviceType.name = 'Type1';
        scope.updateServiceTypeDuration();
        scope.addServiceType(scope.serviceType);
        scope.serviceType.name = 'Type2';
        scope.serviceType.duration = 30;
        scope.updateServiceTypeDuration();
        scope.addServiceType(scope.serviceType);
        scope.serviceType.name = 'Type3';
        scope.serviceType.duration = null;
        scope.updateServiceTypeDuration();
        scope.addServiceType(scope.serviceType);
        expect(scope.service.serviceTypes[0].name).toEqual('Type1');
        expect(scope.service.serviceTypes[0].duration).toEqual(Bahmni.Appointments.Constants.defaultServiceTypeDuration);
        expect(scope.service.serviceTypes[1].name).toEqual('Type2');
        expect(scope.service.serviceTypes[1].duration).toEqual(30);
        expect(scope.service.serviceTypes[2].name).toEqual('Type3');
        expect(scope.service.serviceTypes[2].duration).toEqual(15);
    });

    it('should clear the serviceType duration on clearing the serviceType name', function () {
        scope.serviceType.name = "";
        scope.updateServiceTypeDuration();
        expect(scope.serviceType.duration).toBeUndefined();
    });

    it('should set the serviceType duration to default duration when entering the serviceType name', function () {
        scope.serviceType.name = "type1";
        scope.updateServiceTypeDuration();
        expect(scope.serviceType.duration).toBe(Bahmni.Appointments.Constants.defaultServiceTypeDuration);
        scope.serviceType.duration = 20;
        scope.serviceType.name = "type2";
        expect(scope.serviceType.duration).toBe(20);
    });
});
