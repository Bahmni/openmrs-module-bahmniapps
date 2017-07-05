'use strict';

describe("AppointmentsServiceController", function () {
    var controller, scope, q, state, appointmentsServiceService, locationService, messagingService,
        locations, specialityService, specialities, ngDialog;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope, $q) {
            controller = $controller;
            scope = $rootScope.$new();
            q = $q;
            appointmentsServiceService = jasmine.createSpyObj('appointmentsServiceService', ['save']);
            appointmentsServiceService.save.and.returnValue(specUtil.simplePromise({}));
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
        });
    });

    var createController = function () {
        return controller('AppointmentsServiceController', {
            $scope: scope,
            $q: q,
            $state: state,
            appointmentsServiceService: appointmentsServiceService,
            locationService: locationService,
            messagingService: messagingService,
            specialityService: specialityService,
            ngDialog: ngDialog
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

        it('should fetch all specialities on initialization', function () {
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
    });

    it('should save all appointment service details', function () {
        createController();
        scope.service = {
            name: 'Chemotherapy',
            description: 'For cancer',
            startTime: 'Thu Jan 01 1970 09:45:00 GMT+0530 (IST)',
            endTime: 'Thu Jan 01 1970 18:30:00 GMT+0530 (IST)'
        };
        var service = Bahmni.Appointments.Service.create(scope.service);
        scope.save();
        expect(service.startTime).toBe('09:45:00');
        expect(service.endTime).toBe('18:30:00');
        expect(appointmentsServiceService.save).toHaveBeenCalledWith(service);
        expect(messagingService.showMessage).toHaveBeenCalledWith('info', 'APPOINTMENT_SERVICE_LABEL_SAVED');
    });

    describe('confirmationDialogOnStateChange', function () {
        beforeEach(function () {
            state = jasmine.createSpyObj('$state', ['go']);
            state.name = 'home.service';
            createController();
        });

        it('should not open confirmation dialog if form is empty', function () {
            scope.service = {};
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
                template: 'views/appointmentServiceSaveConfirmation.html',
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
