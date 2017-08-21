'use strict'

describe ('appointmentsSummaryController', function () {
    var controller, scope, appointmentsService, spinner, appService, appDescriptor, state, window;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope) {
            controller = $controller;
            scope = $rootScope.$new();
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            appointmentsService = jasmine.createSpyObj('appointmentsService', ['getAppointmentsSummary']);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            appDescriptor.getConfigValue.and.returnValue({'week': 'week'});
            spinner = jasmine.createSpyObj('spinner', ['forPromise', 'then', 'catch']);
            state = jasmine.createSpyObj('state', ['href']);
            window = jasmine.createSpyObj('window', ['open']);
            appointmentsService.getAppointmentsSummary.and.returnValue(specUtil.simplePromise({response : "hello"}));

        });
    });

    var createController = function () {
       controller('AppointmentsSummaryController', {
           $scope: scope,
           appService: appService,
           appointmentsService: appointmentsService,
           spinner: spinner,
           $state: state,
           $window: window
       });
    };

    it('should initialize the week to current week and date to todays date', function () {
        createController();
        expect(scope.weekStartDate).toEqual(new Date(moment().startOf('week')));
        expect(scope.weekEndDate).toEqual(new Date(moment().endOf('week').endOf('day')));
        expect(scope.viewDate).toEqual(new Date(moment().startOf('day').toDate()));
    });

    it('should construct dates array for current week on initialization', function () {
        createController();
        expect(scope.weekDatesInfo[0].date).toEqual(moment().startOf('week').format('YYYY-MM-DD'));
        expect(scope.weekDatesInfo[1].date).toEqual(moment(Bahmni.Common.Util.DateUtil.addDays(scope.weekDatesInfo[0].date, 1)).format('YYYY-MM-DD'));
        expect(scope.weekDatesInfo[2].date).toEqual(moment(Bahmni.Common.Util.DateUtil.addDays(scope.weekDatesInfo[0].date, 2)).format('YYYY-MM-DD'));
        expect(scope.weekDatesInfo[3].date).toEqual(moment(Bahmni.Common.Util.DateUtil.addDays(scope.weekDatesInfo[0].date, 3)).format('YYYY-MM-DD'));
        expect(scope.weekDatesInfo[4].date).toEqual(moment(Bahmni.Common.Util.DateUtil.addDays(scope.weekDatesInfo[0].date, 4)).format('YYYY-MM-DD'));
        expect(scope.weekDatesInfo[5].date).toEqual(moment(Bahmni.Common.Util.DateUtil.addDays(scope.weekDatesInfo[0].date, 5)).format('YYYY-MM-DD'));
        expect(scope.weekDatesInfo[6].date).toEqual(moment(Bahmni.Common.Util.DateUtil.addDays(scope.weekDatesInfo[0].date, 6)).format('YYYY-MM-DD'));
    });

    it('should Get all the appointments summary for current week on initialization', function () {
        createController();
        expect(appointmentsService.getAppointmentsSummary).toHaveBeenCalledWith({startDate: new Date(moment().startOf('week')),
        endDate: new Date(moment().endOf('week').endOf('day'))});
        expect(spinner.forPromise).toHaveBeenCalled();
    });

    it('should go to list view on clicking of appointment count', function () {
        createController();
        var date = moment("2017-02-01").toDate();
        scope.goToListView(date);
        expect(state.href).toHaveBeenCalledWith('home.manage.appointments.list', { viewDate : date, view : 'list' });
    });

    it('should open list view in new tab on clicking of appointment count', function () {
        state.href.and.returnValue('url');
        createController();
        var date = moment("2017-02-01").toDate();
        scope.goToListView(date);
        expect(window.open).toHaveBeenCalledWith('url', '_blank');
    });

   it('should set the appointments to the response data', function () {
        var appointments = [{
            "appointmentService": {
                "appointmentServiceId": 1,
                "name": "service1",
                "description": null,
                "uuid": "c526c72a-ae6a-446c-9337-42d1119bcb94",
                "color": "#008000",
                "creatorName": null
            },
            "appointmentCountMap": {
                "2017-08-16": {
                    "allAppointmentsCount": 1,
                    "missedAppointmentsCount": 0,
                    "appointmentDate": 1502821800000,
                    "appointmentServiceUuid": "c526c72a-ae6a-446c-9337-42d1119bcb94"
                }
            }
        }, {
            "appointmentService": {
                "appointmentServiceId": 2,
                "name": "service test",
                "uuid": "230e77c7-8924-45ad-9b4c-d4090c4ade71",
                "color": "#008000",
                "creatorName": null
            }, "appointmentCountMap": {}
        }, {
            "appointmentService": {
                "appointmentServiceId": 3,
                "name": "Dermatology",
                "description": null,

                "startTime": "09:00:00",
                "endTime": "12:00:00",
                "uuid": "75c006aa-d3dd-4848-9735-03aee74ae27e",
                "color": "#008000",
                "creatorName": null
            }, "appointmentCountMap": {}
        }];
        appointmentsService.getAppointmentsSummary.and.returnValue(specUtil.simplePromise({data: appointments}));
        createController();
        expect(scope.appointments).toEqual(appointments);
        expect(scope.weekDatesInfo.length).toEqual(7);
        expect(scope.weekDatesInfo[0]).toEqual({date: '2017-08-20', total: {all: 0, missed: 0}});
        expect(scope.weekDatesInfo[1]).toEqual({date: '2017-08-21', total: {all: 0, missed: 0}});
        expect(scope.weekDatesInfo[2]).toEqual({date: '2017-08-22', total: {all: 0, missed: 0}});
        expect(scope.weekDatesInfo[3]).toEqual({date: '2017-08-23', total: {all: 0, missed: 0}});
        expect(scope.weekDatesInfo[4]).toEqual({date: '2017-08-24', total: {all: 0, missed: 0}});
        expect(scope.weekDatesInfo[5]).toEqual({date: '2017-08-25', total: {all: 0, missed: 0}});
        expect(scope.weekDatesInfo[6]).toEqual({date: '2017-08-26', total: {all: 0, missed: 0}});
    });
});