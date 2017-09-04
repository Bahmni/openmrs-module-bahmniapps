'use strict';

describe('AppointmentsCalendarViewController', function () {
    var controller, scope, spinner, appointmentsService, appointmentsContext, translate, stateParams;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope, $stateParams) {
            controller = $controller;
            scope = $rootScope.$new();
            stateParams = $stateParams;
            spinner = jasmine.createSpyObj('spinner', ['forPromise']);
            spinner.forPromise.and.callFake(function () {
                return {
                    then: function () {
                        return {};
                    }
                };
            });
            appointmentsService = jasmine.createSpyObj('appointmentsService', ['getAllAppointments']);
            appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({data: []}));
            appointmentsContext = {appointments: []};
            translate = jasmine.createSpyObj('$translate', ['instant']);
            translate.instant.and.returnValue("No provider appointments");
        });
    });

    var createController = function () {
        controller('AppointmentsCalendarViewController', {
            $scope: scope,
            spinner: spinner,
            appointmentsService: appointmentsService,
            appointmentsContext: appointmentsContext,
            $translate: translate
        });
    };

    beforeEach(function () {
        createController();
    });

    it('should get appointments for date', function () {
        var viewDate = new Date('1970-01-01T11:30:00.000Z');
        scope.getAppointmentsForDate(viewDate).then(function () {
            expect(scope.shouldReload).toBeFalsy();
            expect(stateParams.viewDate).toEqual(viewDate);
        });
        expect(appointmentsService.getAllAppointments).toHaveBeenCalledWith({forDate: viewDate});
        expect(spinner.forPromise).toHaveBeenCalled();
    });

    it('should push [No provider] resource by default', function () {
        var viewDate = new Date('1970-01-01T11:30:00.000Z');
        appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({data: []}));
        scope.getAppointmentsForDate(viewDate);
        expect(scope.providerAppointments.resources.length).toBe(1);
        expect(scope.providerAppointments.resources[0].id).toBe('[No Provider]');
        expect(scope.providerAppointments.resources[0].title).toBe('No provider appointments');
    });

    it('should construct resources and events for appointments', function () {
        var allAppointments = [
            {
                "uuid": "e53c9655-d56f-4234-b9fd-46bbb74daffa",
                "patient": {
                    "identifier": "GAN200000",
                    "name": "Test DrugDataOne",
                    "uuid": "d95bf6c9-d1c6-41dc-aecf-1c06bd71386c"
                },
                "service": {
                    "name": "cardiology",
                    "uuid": "2c8ed7e9-f726-49ac-add0-cfc019e7eae7",
                    "color": "#FF8C00"
                },
                "provider": {
                    "name": "Superman",
                    "uuid": "8135e93a-3f12-11e4-adec-0800271c1b75"
                },
                "startDateTime": 1502442000000,
                "endDateTime": 1502443200000,
                "status": "Scheduled"
            },
            {
                "uuid": "e53c9655-d56f-4234-b9fd-46bbb74daffa",
                "patient": {
                    "identifier": "GAN200000",
                    "name": "Test DrugDataTwo",
                    "uuid": "d95bf6c9-d1c6-41dc-aecf-1c06bd71386c"
                },
                "service": {
                    "name": "chemotherapy",
                    "uuid": "324ed7e9-f726-49ac-add0-cfc019e7eae7",
                    "color": "#A9A9A9"
                },
                "provider": {
                    "name": "Batman",
                    "uuid": "7155e93a-3f12-11e4-adec-0800271c1b75"
                },
                "startDateTime": 1502442002000,
                "endDateTime": 1502443200400,
                "status": "CheckedIn"
            }
        ];
        appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({data: allAppointments}));
        var viewDate = new Date('1970-01-01T11:30:00.000Z');
        scope.getAppointmentsForDate(viewDate);

        var resources = scope.providerAppointments.resources;
        var sortedAppointments = _.sortBy(allAppointments, 'provider.name');
        expect(resources.length).toBe(3);
        expect(resources[0]).toEqual({id: sortedAppointments[0].provider.name, title: sortedAppointments[0].provider.name, provider: sortedAppointments[0].provider });
        expect(resources[1]).toEqual({id: sortedAppointments[1].provider.name, title: sortedAppointments[1].provider.name, provider: sortedAppointments[1].provider});
        expect(resources[2]).toEqual({id: '[No Provider]', title: 'No provider appointments'});

        var events = scope.providerAppointments.events;
        expect(events.length).toBe(2);
        expect(events[0].resourceId).toBe(allAppointments[0].provider.name);
        expect(events[0].start).toBe(allAppointments[0].startDateTime);
        expect(events[0].end).toBe(allAppointments[0].endDateTime);
        expect(events[0].color).toBe(allAppointments[0].service.color);
        expect(events[0].serviceName).toBe(allAppointments[0].service.name);
        expect(events[0].title).toBe(allAppointments[0].patient.name + "(" + allAppointments[0].patient.identifier + ")");
        expect(events[0].appointments).toEqual([allAppointments[0]]);

        expect(events[1].resourceId).toBe(allAppointments[1].provider.name);
        expect(events[1].start).toBe(allAppointments[1].startDateTime);
        expect(events[1].end).toBe(allAppointments[1].endDateTime);
        expect(events[1].color).toBe(allAppointments[1].service.color);
        expect(events[1].serviceName).toBe(allAppointments[1].service.name);
        expect(events[1].title).toBe(allAppointments[1].patient.name + "(" + allAppointments[1].patient.identifier + ")");
        expect(events[1].appointments).toEqual([allAppointments[1]]);
    });

    it('should append to existing event if they are of same slot & provider & service', function () {
        var allAppointments = [
            {
                "uuid": "e53c9655-d56f-4234-b9fd-46bbb74daffa",
                "patient": {
                    "identifier": "GAN200000",
                    "name": "Test DrugDataOne",
                    "uuid": "d95bf6c9-d1c6-41dc-aecf-1c06bd71386c"
                },
                "service": {
                    "name": "cardiology",
                    "uuid": "2c8ed7e9-f726-49ac-add0-cfc019e7eae7",
                    "color": "#FF8C00"
                },
                "provider": {
                    "name": "Superman",
                    "uuid": "8135e93a-3f12-11e4-adec-0800271c1b75"
                },
                "startDateTime": 1502442000000,
                "endDateTime": 1502443200000,
                "status": "Scheduled"
            },
            {
                "uuid": "a4569655-d56f-4234-b9fd-46bbb74daffa",
                "patient": {
                    "identifier": "GAN200020",
                    "name": "Test DrugDataTwo",
                    "uuid": "d95bf6c9-d1c6-41dc-aecf-1c06bd71386c"
                },
                "service": {
                    "name": "cardiology",
                    "uuid": "2c8ed7e9-f726-49ac-add0-cfc019e7eae7",
                    "color": "#FF8C00"
                },
                "provider": {
                    "name": "Superman",
                    "uuid": "8135e93a-3f12-11e4-adec-0800271c1b75"
                },
                "startDateTime": 1502442000000,
                "endDateTime": 1502443200000,
                "status": "CheckedIn"
            }
        ];
        appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({data: allAppointments}));
        var viewDate = new Date('1970-01-01T11:30:00.000Z');
        scope.getAppointmentsForDate(viewDate);
        var resources = scope.providerAppointments.resources;
        expect(resources.length).toBe(2);
        expect(resources[0]).toEqual({id: allAppointments[0].provider.name, title: allAppointments[0].provider.name, provider: allAppointments[0].provider});
        expect(resources[1]).toEqual({id: '[No Provider]', title: 'No provider appointments'});
        var events = scope.providerAppointments.events;
        expect(events.length).toBe(1);
        expect(events[0].resourceId).toBe(allAppointments[0].provider.name);
        expect(events[0].start).toBe(allAppointments[0].startDateTime);
        expect(events[0].end).toBe(allAppointments[0].endDateTime);
        expect(events[0].color).toBe(allAppointments[0].service.color);
        expect(events[0].serviceName).toBe(allAppointments[0].service.name);
        var mergedPatientNames = allAppointments[0].patient.name + "(" + allAppointments[0].patient.identifier + ")" + ', ' +
            allAppointments[1].patient.name + "(" + allAppointments[1].patient.identifier + ")";
        expect(events[0].title).toBe(mergedPatientNames);
        expect(events[0].appointments).toEqual(allAppointments);
    });

    it('should not append to existing event if they are of same slot & provider & but not service', function () {
        var allAppointments = [
            {
                "uuid": "e53c9655-d56f-4234-b9fd-46bbb74daffa",
                "patient": {
                    "identifier": "GAN200000",
                    "name": "Test DrugDataOne",
                    "uuid": "d95bf6c9-d1c6-41dc-aecf-1c06bd71386c"
                },
                "service": {
                    "name": "cardiology",
                    "uuid": "2c8ed7e9-f726-49ac-add0-cfc019e7eae7",
                    "color": "#FF8C00"
                },
                "provider": {
                    "name": "Superman",
                    "uuid": "8135e93a-3f12-11e4-adec-0800271c1b75"
                },
                "startDateTime": 1502442000000,
                "endDateTime": 1502443200000,
                "status": "Scheduled"
            },
            {
                "uuid": "a4569655-d56f-4234-b9fd-46bbb74daffa",
                "patient": {
                    "identifier": "GAN200020",
                    "name": "Test DrugDataTwo",
                    "uuid": "d95bf6c9-d1c6-41dc-aecf-1c06bd71386c"
                },
                "service": {
                    "name": "chemotherapy",
                    "uuid": "324ed7e9-f726-49ac-add0-cfc019e7eae7",
                    "color": "#A9A9A9"
                },
                "provider": {
                    "name": "Superman",
                    "uuid": "8135e93a-3f12-11e4-adec-0800271c1b75"
                },
                "startDateTime": 1502442000000,
                "endDateTime": 1502443200000,
                "status": "CheckedIn"
            }
        ];
        appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({data: allAppointments}));
        var viewDate = new Date('1970-01-01T11:30:00.000Z');
        scope.getAppointmentsForDate(viewDate);
        var resources = scope.providerAppointments.resources;
        expect(resources.length).toBe(2);
        expect(resources[0]).toEqual({id: allAppointments[0].provider.name, title: allAppointments[0].provider.name, provider: allAppointments[0].provider});
        expect(resources[1]).toEqual({id: '[No Provider]', title: 'No provider appointments'});
        var events = scope.providerAppointments.events;
        expect(events.length).toBe(2);
        expect(events[0].resourceId).toBe(allAppointments[0].provider.name);
        expect(events[0].start).toBe(allAppointments[0].startDateTime);
        expect(events[0].end).toBe(allAppointments[0].endDateTime);
        expect(events[0].color).toBe(allAppointments[0].service.color);
        expect(events[0].serviceName).toBe(allAppointments[0].service.name);
        expect(events[0].title).toBe(allAppointments[0].patient.name + "(" + allAppointments[0].patient.identifier + ")");
        expect(events[0].appointments).toEqual([allAppointments[0]]);

        expect(events[1].resourceId).toBe(allAppointments[1].provider.name);
        expect(events[1].start).toBe(allAppointments[1].startDateTime);
        expect(events[1].end).toBe(allAppointments[1].endDateTime);
        expect(events[1].color).toBe(allAppointments[1].service.color);
        expect(events[1].serviceName).toBe(allAppointments[1].service.name);
        expect(events[1].title).toBe(allAppointments[1].patient.name + "(" + allAppointments[1].patient.identifier + ")");
        expect(events[1].appointments).toEqual([allAppointments[1]]);
    });

    it('should filter out the cancelled appointments', function () {
        var allAppointments = [
            {
                "uuid": "e53c9655-d56f-4234-b9fd-46bbb74daffa",
                "patient": {
                    "identifier": "GAN200000",
                    "name": "Test DrugDataOne",
                    "uuid": "d95bf6c9-d1c6-41dc-aecf-1c06bd71386c"
                },
                "service": {
                    "name": "cardiology",
                    "uuid": "2c8ed7e9-f726-49ac-add0-cfc019e7eae7",
                    "color": "#FF8C00"
                },
                "provider": {
                    "name": "Superman",
                    "uuid": "8135e93a-3f12-11e4-adec-0800271c1b75"
                },
                "startDateTime": 1502442000000,
                "endDateTime": 1502443200000,
                "status": "Cancelled"
            },
            {
                "uuid": "e53c9655-d56f-4234-b9fd-46bbb74daffa",
                "patient": {
                    "identifier": "GAN200000",
                    "name": "Test DrugDataOne",
                    "uuid": "d95bf6c9-d1c6-41dc-aecf-1c06bd71386c"
                },
                "service": {
                    "name": "cardiology",
                    "uuid": "2c8ed7e9-f726-49ac-add0-cfc019e7eae7",
                    "color": "#FF8C00"
                },
                "provider": {
                    "name": "Superman",
                    "uuid": "8135e93a-3f12-11e4-adec-0800271c1b75"
                },
                "startDateTime": 1502442000000,
                "endDateTime": 1502443200000,
                "status": "Scheduled"
            }
        ];
        appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({data: allAppointments}));
        var viewDate = new Date('1970-01-01T11:30:00.000Z');
        scope.getAppointmentsForDate(viewDate);
        expect(scope.providerAppointments.resources.length).toBe(2);
        expect(scope.providerAppointments.events.length).toBe(1);
    });
});
