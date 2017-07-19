'use strict';

describe("AppointmentServiceController", function () {
    var controller, scope, q, state, appointmentsServiceService, locationService, messagingService,
        locations, specialityService, specialities, ngDialog, appointmentServices, appService, appDescriptor;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope, $q) {
            controller = $controller;
            scope = $rootScope.$new();
            q = $q;
        });
    });

    beforeEach(function () {
        appointmentsServiceService = jasmine.createSpyObj('appointmentsServiceService', ['save', 'getAllServices']);
        appointmentsServiceService.save.and.returnValue(specUtil.simplePromise({}));
        appointmentServices = [{name: "Oncology", description: "Cancer treatment"}];
        appointmentsServiceService.getAllServices.and.returnValue(specUtil.simplePromise({data: appointmentServices}));
        locationService = jasmine.createSpyObj('locationService', ['getAllByTag']);
        locations = [
            {display: "OPD1", uuid: 1},
            {display: "Registration", uuid: 2}
        ];
        locationService.getAllByTag.and.returnValue(specUtil.simplePromise({data: {results: locations}}));
        messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
        messagingService.showMessage.and.returnValue({});
        specialityService = jasmine.createSpyObj('specialityService', ['getAllSpecialities']);
        specialities = [{name: 'Cardiology', uuid: '81da9590-3f10-11e4-2908-0800271c1b75'}];
        specialityService.getAllSpecialities.and.returnValue(specUtil.simplePromise({data: specialities}));
        ngDialog = jasmine.createSpyObj('ngDialog', ['close', 'openConfirm']);
        state = jasmine.createSpyObj('$state', ['go']);
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
        appService.getAppDescriptor.and.returnValue(appDescriptor);
        appDescriptor.getConfigValue.and.returnValue(true);
    });

    var createController = function () {
        return controller('AppointmentServiceController', {
            $scope: scope,
            $q: q,
            $state: state,
            appointmentsServiceService: appointmentsServiceService,
            locationService: locationService,
            messagingService: messagingService,
            specialityService: specialityService,
            ngDialog: ngDialog,
            appService: appService
        }
      );
    };

    describe('initialization', function () {
        it('should fetch all appointment locations on initialization', function () {
            expect(scope.locations).toBeUndefined();
            createController();
            expect(locationService.getAllByTag).toHaveBeenCalledWith('Appointment Location');
            expect(scope.locations).toBe(locations);
        });

        it('should show error message if fetch appointment locations has failed', function () {
            var locationsPromise = specUtil.simplePromise();
            locationsPromise.then = function (successFn, errorFn) {
                errorFn({status: 404});
                return locationsPromise;
            };
            locationService.getAllByTag.and.returnValue(locationsPromise);
            createController();
            expect(scope.locations).toBeUndefined();
            expect(messagingService.showMessage).toHaveBeenCalledWith('error', 'MESSAGE_GET_LOCATIONS_ERROR');
        });

        it('should not fetch specialities if not configured', function () {
            appDescriptor.getConfigValue.and.returnValue(false);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            expect(scope.specialities).toBeUndefined();
            createController();
            expect(specialityService.getAllSpecialities).not.toHaveBeenCalled();
            expect(scope.specialities).toBeUndefined();
        });

        it('should fetch all specialities on initialization if configured', function () {
            expect(scope.specialities).toBeUndefined();
            createController();
            expect(specialityService.getAllSpecialities).toHaveBeenCalled();
            expect(scope.specialities).toBe(specialities);
        });

        it('should show error message if fetch specialities has failed', function () {
            var specialitiesPromise = specUtil.simplePromise();
            specialitiesPromise.then = function (successFn, errorFn) {
                errorFn({status: 404});
                return specialitiesPromise;
            };
            specialityService.getAllSpecialities.and.returnValue(specialitiesPromise);
            createController();
            expect(scope.specialities).toBeUndefined();
            expect(messagingService.showMessage).toHaveBeenCalledWith('error', 'MESSAGE_GET_SPECIALITIES_ERROR');
        });

        it('should fetch all services on initialization', function () {
            expect(scope.services).toBeUndefined();
            createController();
            expect(appointmentsServiceService.getAllServices).toHaveBeenCalled();
            expect(scope.services).toBe(appointmentServices);
        });
    });

    describe('validateServiceName', function () {
        var name;
        beforeEach(function () {
            createController();
            name = jasmine.createSpyObj('name', ['$setValidity']);
            scope.createServiceForm = {name: name};
        });
        it('should validate to true if service name is unique', function () {
            scope.service = {name: 'Cardiology'};
            scope.services = {name: 'Endocrinology'};
            scope.validateServiceName();
            expect(name.$setValidity).toHaveBeenCalledWith('uniqueServiceName', true);
        });

        it('should validate to false if service name is already exists', function () {
            scope.service = {name: 'Cardiology'};
            scope.services = [{name: 'Cardiology'}];
            scope.validateServiceName();
            expect(name.$setValidity).toHaveBeenCalledWith('uniqueServiceName', false);
        });

        it('should validate to true if service name is empty', function () {
            scope.service = {name: undefined};
            scope.services = {name: 'Endocrinology'};
            scope.validateServiceName();
            expect(name.$setValidity).toHaveBeenCalledWith('uniqueServiceName', true);
        });
    });

    describe('save', function () {
        beforeEach(function () {
            createController();
            scope.createServiceForm = {$invalid: false};
        });

        it('should save all appointment service details', function () {
            scope.service = {
                name: 'Chemotherapy',
                description: 'For cancer',
                startTime: new Date().toString(),
                endTime: new Date().toString(),
                weeklyAvailability: [{
                    startTime: new Date().toString(),
                    endTime: new Date().toString(),
                    days: [{name: 'MONDAY', isSelected: true}]
                }]
            };
            var service = Bahmni.Appointments.AppointmentService.createFromUIObject(scope.service);
            scope.save();
            expect(appointmentsServiceService.save).toHaveBeenCalledWith(service);
            expect(messagingService.showMessage).toHaveBeenCalledWith('info', 'APPOINTMENT_SERVICE_SAVE_SUCCESS');
        });

        it('should go to service list page after save', function () {
            var startDateTime = new Date('Thu Jan 01 1970 09:45:00 GMT+0530 (IST)');
            var endDateTime = new Date('Thu Jan 01 1970 18:30:00 GMT+0530 (IST)');
            scope.service = {
                name: 'Chemotherapy',
                description: 'For cancer',
                startTime: startDateTime,
                endTime: endDateTime
            };
            var service = Bahmni.Appointments.AppointmentService.createFromUIObject(scope.service);
            scope.save();
            expect(appointmentsServiceService.save).toHaveBeenCalledWith(service);
            expect(messagingService.showMessage).toHaveBeenCalledWith('info', 'APPOINTMENT_SERVICE_SAVE_SUCCESS');
            expect(state.go).toHaveBeenCalledWith('home.admin.service');
        });

        it('should show error message if form is invalid', function () {
            scope.createServiceForm = {$invalid: true};
            scope.save();
            expect(appointmentsServiceService.save).not.toHaveBeenCalled();
            expect(messagingService.showMessage).toHaveBeenCalledWith('error', 'INVALID_SERVICE_FORM_ERROR_MESSAGE');
            expect(state.go).not.toHaveBeenCalled();
        });
    });

    describe('confirmationDialogOnStateChange', function () {
        beforeEach(function () {
            state.name = 'home.service';
            createController();
        });

        it('should not open confirmation dialog if form is empty', function () {
            scope.service = {weeklyAvailability: []};
            scope.$broadcast("$stateChangeStart");
            expect(ngDialog.openConfirm).not.toHaveBeenCalled();
        });

        it('should open confirmation dialog if form is filled', function () {
            scope.service = {
                name: 'Pathology',
                description: 'For viral diseases'
            };
            scope.$broadcast("$stateChangeStart");
            expect(ngDialog.openConfirm).toHaveBeenCalledWith({
                template: 'views/admin/appointmentServiceSaveConfirmation.html',
                scope: scope,
                closeByEscape: true
            });
        });

        it('should stay in current state if Cancel is selected', function () {
            expect(state.name).toEqual('home.service');
            scope.cancelTransition();
            expect(state.name).toEqual('home.service');
            expect(ngDialog.close).toHaveBeenCalled();
        });

        it("should not save and go to target state if Don't save is selected", function () {
            var toState = {name: "home.manage"};
            var toParams = {config: 'default'};
            expect(state.name).toEqual("home.service");
            scope.save = jasmine.createSpy('save');
            scope.toStateConfig = {toState: toState, toParams: toParams};
            scope.continueWithoutSaving();
            expect(state.go).toHaveBeenCalledWith(toState, toParams);
            expect(ngDialog.close).toHaveBeenCalled();
        });
    });
});
