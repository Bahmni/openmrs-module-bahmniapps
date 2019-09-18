'use strict';

describe('AppointmentsCalendarViewController', function () {
    var controller, scope, spinner, appointmentsService, translate, stateParams, state, interval, appService, appDescriptor;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope, $stateParams, $state, $interval) {
            controller = $controller;
            scope = $rootScope.$new();
            stateParams = $stateParams;
            state = $state;
            spinner = jasmine.createSpyObj('spinner', ['forPromise']);
            spinner.forPromise.and.callFake(function () {
                return {
                    then: function () {
                        return {};
                    }
                };
            });
            appointmentsService = jasmine.createSpyObj('appointmentsService', ['getAllAppointments', 'searchAppointments']);
            translate = jasmine.createSpyObj('$translate', ['instant']);
            translate.instant.and.returnValue("No provider appointments");
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            interval = jasmine.createSpy('$interval', $interval).and.callThrough();
            state.params = {weekView: false, viewDate: null};
        });
    });

    var createController = function () {
        controller('AppointmentsCalendarViewController', {
            $scope: scope,
            spinner: spinner,
            appointmentsService: appointmentsService,
            $translate: translate,
            appService: appService,
            $interval: interval
        });
    };

    beforeEach(function () {
        createController();
    });

    it('should not fetch appointments when doFetchAppointmentsData is set to false', function () {
        state.params = {doFetchAppointmentsData: false};
        appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({}));
        var viewDate = new Date('1970-01-01T11:30:00.000Z');
        scope.getAppointmentsForDate(viewDate);
        expect(appointmentsService.getAllAppointments).not.toHaveBeenCalled();
        expect(spinner.forPromise).not.toHaveBeenCalled();
    });

    it('should set doFetchAppointmentsData to false when weekView is set to false and state is changed to List View', function () {
        state.params = {doFetchAppointmentsData: true};
        appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({}));
        var viewDate = new Date('1970-01-01T11:30:00.000Z');
        scope.getAppointmentsForDate(viewDate);
        scope.$broadcast('$stateChangeStart', {tabName:'list'}, state.params);
        expect(state.params.doFetchAppointmentsData).toBeFalsy();
    });

    it('should get appointments for date', function () {
        var viewDate = new Date('1970-01-01T11:30:00.000Z');
        state.params = {doFetchAppointmentsData: true};
        appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({data: []}));
        scope.getAppointmentsForDate(viewDate).then(function () {
            expect(scope.shouldReload).toBeFalsy();
            expect(stateParams.viewDate).toEqual(viewDate);
        }); 
        expect(appointmentsService.getAllAppointments).toHaveBeenCalledWith({forDate: viewDate});
        expect(spinner.forPromise).toHaveBeenCalled();
    });

    it('should not get appointments for date if weekView is set to true', function () {
        scope.weekView = true;
        var viewDate = new Date('1970-01-01T11:30:00.000Z');
        scope.getAppointmentsForDate(viewDate);
        expect(appointmentsService.getAllAppointments).not.toHaveBeenCalledWith({forDate: viewDate});
        expect(spinner.forPromise).not.toHaveBeenCalled();
    });

    it('should push "No provider appointments" resource when there are appointments with no provider', function () {
        var viewDate = new Date('1970-01-01T11:30:00.000Z');
        appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({data: [{
            "uuid": "7f366f38-9d41-48e0-bffb-9497d55e3097",
            "appointmentNumber": "0000",
            "patient": {
                "identifier": "GAN203008",
                "name": "pramida tumma",
                "uuid": "56d5e8b1-b2b4-44f3-b953-fab5d12fd5ff"
            },
            "service": {
                "appointmentServiceId": 1,
                "name": "hell",
                "description": "description",
                "speciality": {
                    "name": "Cardiology",
                    "uuid": "bdbb1d1e-87c8-11e7-93b0-080027e99513"
                },
                "startTime": "",
                "endTime": "",
                "maxAppointmentsLimit": 12,
                "durationMins": 60,
                "location": {},
                "uuid": "d3f5062e-b92d-4c70-8d22-b199dcb65a2c",
                "color": "#DC143C",
                "creatorName": null
            },"serviceType": {
                "duration": 15,
                "name": "maxillo",
                "uuid": "de849ecd-47ad-4610-8080-20e7724b2df6"
            },
            "provider": null,
            "location": null,
            "startDateTime": 1504665900000,
            "endDateTime": 1504666800000,
            "appointmentKind": "Scheduled",
            "status": "Scheduled",
            "comments": null
        }]}));
        state.params = {doFetchAppointmentsData: true};
        scope.getAppointmentsForDate(viewDate);
        expect(scope.providerAppointments.resources.length).toBe(1);
        expect(scope.providerAppointments.resources[0].id).toBe('No provider appointments');
        expect(scope.providerAppointments.resources[0].title).toBe('No provider appointments');
    });

    it('should construct resources and events for appointments', function () {
        var allAppointments = [
            {
                "uuid": "e53c9655-d56f-4234-b9fd-46bbb74daffa",
                "patient": {
                    "identifier": "GAN200000",
                    "name": "ATest DrugDataOne",
                    "uuid": "d95bf6c9-d1c6-41dc-aecf-1c06bd71386c"
                },
                "service": {
                    "name": "cardiology",
                    "uuid": "2c8ed7e9-f726-49ac-add0-cfc019e7eae7",
                    "color": "#FF8C00"
                },
                "providers": [ {
                    "uuid": "8135e93a-3f12-11e4-adec-0800271c1b75",
                    "name": "Superman",
                    "comments":"available",
                    "response":"ACCEPTED"
                }],
                "startDateTime": 1502442000000,
                "endDateTime": 1502443200000,
                "status": "Scheduled",
                "additionalInfo": {
                    "BED_NUMBER_KEY": "202"
                }
            },
            {
                "uuid": "e53c9655-d56f-4234-b9fd-46bbb74daffa",
                "patient": {
                    "identifier": "GAN200001",
                    "name": "BTest DrugDataTwo",
                    "uuid": "d95bf6c9-d1c6-41dc-aecf-1c06bd71386c"
                },
                "service": {
                    "name": "chemotherapy",
                    "uuid": "324ed7e9-f726-49ac-add0-cfc019e7eae7",
                    "color": "#A9A9A9"
                },
                "providers": [{
                    "uuid": "7155e93a-3f12-11e4-adec-0800271c1b75",
                    "name": "Batman",
                    "comments":"available",
                    "response":"ACCEPTED"
                }],
                "startDateTime": 1502442002000,
                "endDateTime": 1502443200400,
                "status": "CheckedIn"
            }
        ];
        state.params = {doFetchAppointmentsData: true};
        appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({data: allAppointments}));
        var viewDate = new Date('1970-01-01T11:30:00.000Z');
        scope.getAppointmentsForDate(viewDate);

        var resources = scope.providerAppointments.resources;
        var sortedAppointments = _.sortBy(allAppointments, function (appointment) {
            return appointment.patient.identifier.toLowerCase();
        });
        expect(resources.length).toBe(2);
        expect(resources[0]).toEqual({id: sortedAppointments[1].providers[0].name, title: sortedAppointments[1].providers[0].name, provider: sortedAppointments[1].providers[0] });
        expect(resources[1]).toEqual({id: sortedAppointments[0].providers[0].name, title: sortedAppointments[0].providers[0].name, provider: sortedAppointments[0].providers[0] });

        var events = scope.providerAppointments.events;
        expect(events.length).toBe(2);
        expect(events[0].resourceId).toBe(allAppointments[0].providers[0].name);
        expect(events[0].start).toBe(allAppointments[0].startDateTime);
        expect(events[0].end).toBe(allAppointments[0].endDateTime);
        expect(events[0].color).toBe(allAppointments[0].service.color);
        expect(events[0].serviceName).toBe(allAppointments[0].service.name);
        expect(events[0].title).toBe(allAppointments[0].patient.name + " (" + allAppointments[0].patient.identifier + ")");
        expect(events[0].appointments).toEqual([allAppointments[0]]);
        expect(events[0].className).toEqual('appointmentIcons Scheduled bed-accom');

        expect(events[1].resourceId).toBe(allAppointments[1].providers[0].name);
        expect(events[1].start).toBe(allAppointments[1].startDateTime);
        expect(events[1].end).toBe(allAppointments[1].endDateTime);
        expect(events[1].color).toBe(allAppointments[1].service.color);
        expect(events[1].serviceName).toBe(allAppointments[1].service.name);
        expect(events[1].title).toBe(allAppointments[1].patient.name + " (" + allAppointments[1].patient.identifier + ")");
        expect(events[1].appointments).toEqual([allAppointments[1]]);
        expect(events[1].className).toEqual('appointmentIcons CheckedIn');
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
                "providers": [ {
                    "uuid": "8135e93a-3f12-11e4-adec-0800271c1b75",
                    "name": "Superman",
                    "comments":"available",
                    "response":"ACCEPTED"
                }],
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
                "providers": [ {
                    "uuid": "8135e93a-3f12-11e4-adec-0800271c1b75",
                    "name": "Superman",
                    "comments":"available",
                    "response":"ACCEPTED"
                }],
                "startDateTime": 1502442000000,
                "endDateTime": 1502443200000,
                "status": "CheckedIn",
                "additionalInfo": {
                    "BED_NUMBER_KEY": "202"
                }
            }
        ];
        state.params = {doFetchAppointmentsData: true};
        appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({data: allAppointments}));
        var viewDate = new Date('1970-01-01T11:30:00.000Z');
        scope.getAppointmentsForDate(viewDate);
        var resources = scope.providerAppointments.resources;
        expect(resources.length).toBe(1);
        expect(resources[0]).toEqual({id: 'Superman', title: 'Superman', provider: allAppointments[0].providers[0]});
        var events = scope.providerAppointments.events;
        expect(events.length).toBe(1);
        expect(events[0].resourceId).toBe(allAppointments[0].providers[0].name);
        expect(events[0].start).toBe(allAppointments[0].startDateTime);
        expect(events[0].end).toBe(allAppointments[0].endDateTime);
        expect(events[0].color).toBe(allAppointments[0].service.color);
        expect(events[0].serviceName).toBe(allAppointments[0].service.name);
        expect(events[0].className).toEqual('appointmentIcons multiplePatients bed-accom');
        var mergedPatientNames = allAppointments[0].patient.name + " (" + allAppointments[0].patient.identifier + ")" + ', ' +
            allAppointments[1].patient.name + " (" + allAppointments[1].patient.identifier + ")";
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
                "providers": [ {
                    "uuid": "8135e93a-3f12-11e4-adec-0800271c1b75",
                    "name": "Superman",
                    "comments":"available",
                    "response":"ACCEPTED"
                }],
                "startDateTime": 1502442000000,
                "endDateTime": 1502443200000,
                "status": "Scheduled",
                "additionalInfo": {
                    "BED_NUMBER_KEY": "202"
                }
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
                "providers": [ {
                    "uuid": "8135e93a-3f12-11e4-adec-0800271c1b75",
                    "name": "Superman",
                    "comments":"available",
                    "response":"ACCEPTED"
                }],
                "startDateTime": 1502442000000,
                "endDateTime": 1502443200000,
                "status": "CheckedIn"
            }
        ];
        state.params = {doFetchAppointmentsData: true};
        appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({data: allAppointments}));
        var viewDate = new Date('1970-01-01T11:30:00.000Z');
        scope.getAppointmentsForDate(viewDate);
        var resources = scope.providerAppointments.resources;
        expect(resources.length).toBe(1);
        expect(resources[0]).toEqual({id: allAppointments[0].providers[0].name, title: allAppointments[0].providers[0].name, provider: allAppointments[0].providers[0]});
        var events = scope.providerAppointments.events;
        expect(events.length).toBe(2);
        expect(events[0].resourceId).toBe(allAppointments[0].providers[0].name);
        expect(events[0].start).toBe(allAppointments[0].startDateTime);
        expect(events[0].end).toBe(allAppointments[0].endDateTime);
        expect(events[0].color).toBe(allAppointments[0].service.color);
        expect(events[0].serviceName).toBe(allAppointments[0].service.name);
        expect(events[0].title).toBe(allAppointments[0].patient.name + " (" + allAppointments[0].patient.identifier + ")");
        expect(events[0].className).toEqual('appointmentIcons Scheduled bed-accom');
        expect(events[0].appointments).toEqual([allAppointments[0]]);

        expect(events[1].resourceId).toBe(allAppointments[1].providers[0].name);
        expect(events[1].start).toBe(allAppointments[1].startDateTime);
        expect(events[1].end).toBe(allAppointments[1].endDateTime);
        expect(events[1].color).toBe(allAppointments[1].service.color);
        expect(events[1].serviceName).toBe(allAppointments[1].service.name);
        expect(events[1].title).toBe(allAppointments[1].patient.name + " (" + allAppointments[1].patient.identifier + ")");
        expect(events[1].className).toEqual('appointmentIcons CheckedIn');
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
                "providers": [ {
                    "uuid": "8135e93a-3f12-11e4-adec-0800271c1b75",
                    "name": "Superman",
                    "comments":"available",
                    "response":"ACCEPTED"
                }],
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
                "providers": [ {
                    "uuid": "8135e93a-3f12-11e4-adec-0800271c1b75",
                    "name": "Superman",
                    "comments":"available",
                    "response":"ACCEPTED"
                }],
                "startDateTime": 1502442000000,
                "endDateTime": 1502443200000,
                "status": "Scheduled"
            }
        ];
        state.params = {doFetchAppointmentsData: true};
        appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({data: allAppointments}));
        var viewDate = new Date('1970-01-01T11:30:00.000Z');
        scope.getAppointmentsForDate(viewDate);
        expect(scope.providerAppointments.resources.length).toBe(1);
        expect(scope.providerAppointments.events.length).toBe(1);
    });

    it('should return true when there are no appointments for the selected date', function () {
        scope.providerAppointments= {events:[]};
       createController();
       scope.hasNoAppointments();

    });

    it('should not include "No Provider" in resources when there are no appointments with "No Provider"', function () {
        var appointments = [{
            "uuid": "7f366f38-9d41-48e0-bffb-9497d55e3097",
            "appointmentNumber": "0000",
            "patient": {
                "identifier": "GAN203008",
                "name": "pramida tumma",
                "uuid": "56d5e8b1-b2b4-44f3-b953-fab5d12fd5ff"
            },
            "service": {
                "appointmentServiceId": 1,
                "name": "hell",
                "description": "description",
                "speciality": {
                    "name": "Cardiology",
                    "uuid": "bdbb1d1e-87c8-11e7-93b0-080027e99513"
                },
                "startTime": "",
                "endTime": "",
                "maxAppointmentsLimit": 12,
                "durationMins": 60,
                "location": {},
                "uuid": "d3f5062e-b92d-4c70-8d22-b199dcb65a2c",
                "color": "#DC143C",
                "creatorName": null
            },"serviceType": {
                "duration": 15,
                "name": "maxillo",
                "uuid": "de849ecd-47ad-4610-8080-20e7724b2df6"
            },
            "providers": [ {
                "uuid": "8135e93a-3f12-11e4-adec-0800271c1b75",
                "name": "Trevor",
                "comments":"available",
                "response":"ACCEPTED"
            }],
            "location": null,
            "startDateTime": 1504665900000,
            "endDateTime": 1504666800000,
            "appointmentKind": "Scheduled",
            "status": "Scheduled",
            "comments": null
        }];
        state.params = {doFetchAppointmentsData: true};
        appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({data: appointments}));
        createController();
        scope.getAppointmentsForDate("Wed Sep 06 2017 00:00:00 GMT+0530 (IST)");
        // createController();
        expect(scope.providerAppointments.resources.length).toEqual(1);
        expect(scope.providerAppointments.resources[0].provider.name).toEqual("Trevor");
    });

    it('should include "No Provider" in resources appointments when there are appointments with "No Provider"', function () {
        var appointments = [{
                "uuid": "7f366f38-9d41-48e0-bffb-9497d55e3097",
                "appointmentNumber": "0000",
                "patient": {
                    "identifier": "GAN203008",
                    "name": "pramida tumma",
                    "uuid": "56d5e8b1-b2b4-44f3-b953-fab5d12fd5ff"
                },
                "service": {
                    "appointmentServiceId": 1,
                    "name": "hell",
                    "description": "description",
                    "speciality": {
                        "name": "Cardiology",
                        "uuid": "bdbb1d1e-87c8-11e7-93b0-080027e99513"
                    },
                    "startTime": "",
                    "endTime": "",
                    "maxAppointmentsLimit": 12,
                    "durationMins": 60,
                    "location": {},
                    "uuid": "d3f5062e-b92d-4c70-8d22-b199dcb65a2c",
                    "color": "#DC143C",
                    "creatorName": null
                },"serviceType": {
                "duration": 15,
                "name": "maxillo",
                "uuid": "de849ecd-47ad-4610-8080-20e7724b2df6"
            },
                "provider": null,
                "location": null,
                "startDateTime": 1504665900000,
                "endDateTime": 1504666800000,
                "appointmentKind": "Scheduled",
                "status": "Scheduled",
                "comments": null
            }];
        state.params = {doFetchAppointmentsData: true};
        appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({data: appointments}));
        createController();
        scope.getAppointmentsForDate("Wed Sep 06 2017 00:00:00 GMT+0530 (IST)");
        expect(scope.providerAppointments.resources.length).toEqual(1);
        expect(scope.providerAppointments.resources[0].provider.uuid).toEqual("no-provider-uuid");
    });

    it('should get config value for autoRefreshIntervalInSeconds', function () {
        expect(appDescriptor.getConfigValue).toHaveBeenCalledWith('autoRefreshIntervalInSeconds');
    });

    it('should call interval function when autoRefreshIntervalInSeconds is defined', function () {
        appDescriptor.getConfigValue.and.callFake(function (value) {
            if (value === 'autoRefreshIntervalInSeconds') {
                return 10;
            }
            return undefined;
        });

        createController();

        expect(interval).toHaveBeenCalled();
    });

    it('should not call interval function when autoRefreshIntervalInSeconds is an invalid string', function () {
        appDescriptor.getConfigValue.and.callFake(function (value) {
            if (value === 'autoRefreshIntervalInSeconds') {
                return "invalid";
            }
            return undefined;
        });

        createController();

        expect(interval).not.toHaveBeenCalled();
    });

    it('should cancel interval when autoRefreshIntervalInSeconds is defined', function () {
        appDescriptor.getConfigValue.and.callFake(function (value) {
            if (value === 'autoRefreshIntervalInSeconds') {
                return 10;
            }
            return undefined;
        });
        spyOn(interval, 'cancel');
        createController();

        scope.$destroy();

        expect(interval.cancel).toHaveBeenCalled();
    });

    it('should not cancel interval when autoRefreshIntervalInSeconds is undefined', function () {
        appDescriptor.getConfigValue.and.callFake(function (value) {
            if (value === 'autoRefreshIntervalInSeconds') {
                return undefined;
            }
            return undefined;
        });
        spyOn(interval, 'cancel');
        createController();

        scope.$destroy();

        expect(interval.cancel).not.toHaveBeenCalled();
    });

    it('should change the value of weekView from false to true when toggleWeekView is called', function () {
        expect(scope.weekView).toBeFalsy();
        appointmentsService.searchAppointments.and.returnValue(specUtil.simplePromise({}));
        scope.toggleWeekView();
        expect(scope.weekView).toBeTruthy();
    });

    it('should change the value of weekView from true to false when toggleWeekView is called', function () {
        scope.weekView = true;
        scope.toggleWeekView();
        expect(scope.weekView).toBeFalsy();
    });

    it('should call searchAppointments when weekView is toggled from false to true', function () {
        appointmentsService.searchAppointments.and.returnValue(specUtil.simplePromise({}));
        scope.toggleWeekView();
        expect(appointmentsService.searchAppointments).toHaveBeenCalled();
    });

    it('should call getAllAppointments when weekView is toggled from true to false', function () {
        scope.weekView = true;
        appointmentsService.getAllAppointments.and.returnValue(specUtil.simplePromise({}));
        state.params = {doFetchAppointmentsData: true};
        scope.toggleWeekView();
        expect(appointmentsService.getAllAppointments).toHaveBeenCalled();
    });

    it('should get appointments for week when weekView is true', function() {
        scope.weekView = true;
        appointmentsService.searchAppointments.and.returnValue(specUtil.simplePromise({}));
        scope.getAppointmentsForWeek(null, null);
        expect(spinner.forPromise).toHaveBeenCalled();
        expect(appointmentsService.searchAppointments).toHaveBeenCalled();
    });
    it('should not get appointments for week when weekView is false', function() {
        appointmentsService.searchAppointments.and.returnValue(specUtil.simplePromise({}));
        scope.getAppointmentsForWeek(null, null);
        expect(spinner.forPromise).not.toHaveBeenCalled();
        expect(appointmentsService.searchAppointments).not.toHaveBeenCalled();
    });

    it('should update viewDate of state params while fetching appointments for week when weekView is true', function() {
        scope.weekView = true;
        appointmentsService.searchAppointments.and.returnValue(specUtil.simplePromise({}));
        scope.getAppointmentsForWeek(null, null);
        expect(state.params.viewDate).toBe(scope.startDate);
    });
});
