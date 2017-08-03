'use strict';

describe('ServiceTypes', function () {
    var compile, scope, httpBackend, serviceTypeName, ngDialog, messagingService, appointmentsService;

    serviceTypeName = jasmine.createSpyObj('serviceTypeName', ['$setValidity']);

    beforeEach(module('bahmni.appointments', function ($provide) {
        ngDialog = jasmine.createSpyObj('ngDialog', ['openConfirm', 'close']);
        messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
        appointmentsService = jasmine.createSpyObj('appointmentsService', ['getAppointmentsForServiceType']);
        $provide.value('ngDialog', ngDialog);
        $provide.value('messagingService', messagingService);
        $provide.value('appointmentsService', appointmentsService);
    }));

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

    it("should be able to add new service type with same name and duration as that of a voided service type", function () {
        scope.service.serviceTypes = [{name: "Type1", duration: 30}, {name: "Type2", duration: 15, voided: true}];
        scope.serviceType.name = 'Type2';
        scope.serviceType.duration = 15;
        scope.updateServiceTypeDuration();
        scope.addServiceType(scope.serviceType);
        expect(scope.service.serviceTypes[0].name).toEqual('Type1');
        expect(scope.service.serviceTypes[0].duration).toEqual(30);
        expect(scope.service.serviceTypes[1].name).toEqual('Type2');
        expect(scope.service.serviceTypes[1].duration).toEqual(15);
        expect(scope.service.serviceTypes[1].voided).toBeTruthy();
        expect(scope.service.serviceTypes[2].name).toEqual('Type2');
        expect(scope.service.serviceTypes[2].duration).toEqual(15);
    });


    it('should clear the serviceType duration on clearing the serviceType name', function () {
        scope.serviceType.name = "";
        scope.updateServiceTypeDuration();
        expect(scope.serviceType.duration).toBeUndefined();
        expect(serviceTypeName.$setValidity).toHaveBeenCalledWith('uniqueServiceTypeName', true);
    });

    it('should set the serviceType duration to default duration when entering the serviceType name', function () {
        scope.serviceType.name = "type1";
        scope.updateServiceTypeDuration();
        expect(scope.serviceType.duration).toBe(Bahmni.Appointments.Constants.defaultServiceTypeDuration);
        scope.serviceType.duration = 20;
        scope.serviceType.name = "type2";
        expect(scope.serviceType.duration).toBe(20);
    });

    it('should open the confirmation dialog when trying to delete an unsaved service type', function () {
        var serviceType = {uuid: undefined, name: "type1", duration: 30};
        scope.service.serviceTypes = [serviceType];

        scope.deleteServiceType(serviceType);

        expect(ngDialog.openConfirm).toHaveBeenCalledWith({
            template: 'views/admin/serviceTypeDeleteConfirmation.html',
            scope: scope,
            data: {serviceType: serviceType},
            closeByEscape: true
        });
        expect(appointmentsService.getAppointmentsForServiceType).not.toHaveBeenCalled();
        expect(messagingService.showMessage).not.toHaveBeenCalled();
    });

    it('should check for any future appointments against the saved service type trying to delete and throw an error if there are future non-cancelled appointment', function () {
        var serviceTypeUuid = "serviceTypeUuid";
        var serviceType = {uuid: serviceTypeUuid, name: "type1", duration: 30};
        scope.serviceType = serviceType;
        var appointments = [{uuid: "appointmentUuid", serviceType: serviceType}];
        appointmentsService.getAppointmentsForServiceType.and.returnValue(specUtil.simplePromise({data: appointments}));

        scope.deleteServiceType(serviceType);

        expect(appointmentsService.getAppointmentsForServiceType).toHaveBeenCalledWith(serviceTypeUuid);
        expect(messagingService.showMessage).toHaveBeenCalledWith('error', "APPOINTMENT_SERVICE_TYPE_DELETE_CONFIRMATION_DIALOG_MESSAGE_KEY");
    });

    it('should check for any future appointments against the saved service type trying to delete and open confirmation dialog if there are no future non-cancelled appointment', function () {
        var serviceTypeUuid = "serviceTypeUuid";
        var serviceType = {uuid: serviceTypeUuid, name: "type1", duration: 30};
        scope.serviceType = serviceType;
        var appointments = [];
        appointmentsService.getAppointmentsForServiceType.and.returnValue(specUtil.simplePromise({data: appointments}));

        scope.deleteServiceType(serviceType);

        expect(appointmentsService.getAppointmentsForServiceType).toHaveBeenCalledWith(serviceTypeUuid);
        expect(messagingService.showMessage).not.toHaveBeenCalled();
        expect(ngDialog.openConfirm).toHaveBeenCalledWith({
            template: 'views/admin/serviceTypeDeleteConfirmation.html',
            scope: scope,
            data: {serviceType: serviceType},
            closeByEscape: true
        });
    });

    it('should close the dialog when delete transition is cancelled', function () {
        scope.serviceType = {name: "type1", duration: 30};

        scope.cancelTransition();

        expect(ngDialog.close).toHaveBeenCalled();
    });

    it('should delete the unsaved service type from the service type list on Delete confirmation', function () {
        var savedServiceType = {uuid: "serviceType1Uuid", name: "type1", duration: 30};
        var unsavedServiceType = {name: "type2", duration: 30};

        scope.service.serviceTypes = [savedServiceType, unsavedServiceType];

        scope.deleteServiceTypeOnConfirmation(unsavedServiceType);

        expect(scope.service.serviceTypes.length).toBe(1);
        expect(scope.service.serviceTypes[0]).toBe(savedServiceType);
        expect(ngDialog.close).toHaveBeenCalled();
    });

    it('should add void info to the saved service type on Delete confirmation', function () {
        var savedServiceType = {uuid: "serviceType1Uuid", name: "type1", duration: 30};
        var unsavedServiceType = {name: "type2", duration: 30};

        scope.service.serviceTypes = [savedServiceType, unsavedServiceType];

        scope.deleteServiceTypeOnConfirmation(savedServiceType);

        expect(scope.service.serviceTypes.length).toBe(2);
        expect(scope.service.serviceTypes[0]).toBe(savedServiceType);
        expect(scope.service.serviceTypes[1]).toBe(unsavedServiceType);
        expect(scope.service.serviceTypes[0].voided).toBeTruthy();
        expect(ngDialog.close).toHaveBeenCalled();
    });
});
