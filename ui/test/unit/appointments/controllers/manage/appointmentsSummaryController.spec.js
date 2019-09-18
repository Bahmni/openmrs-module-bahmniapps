'use strict';

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
            state = jasmine.createSpyObj('state', ['href', 'go']);
            state.params = {};
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

    it('should initialize to viewDate in stateParams if provided', function () {
        var date = moment("2017-08-20").toDate();
        state.params = {
            viewDate: date
        };
        createController();
        expect(scope.viewDate).toEqual(date);
    });

    it('should construct dates array for current week on initialization', function () {
        createController();
        var startDate = moment().startOf('week').format('YYYY-MM-DD');
        var endDate = moment(startDate).add(7, 'days');
        scope.getAppointmentsSummaryForAWeek(startDate, endDate);
        expect(scope.weekDatesInfo[0].date).toEqual(moment().startOf('week').format('YYYY-MM-DD'));
        expect(scope.weekDatesInfo[1].date).toEqual(moment(Bahmni.Common.Util.DateUtil.addDays(scope.weekDatesInfo[0].date, 1)).format('YYYY-MM-DD'));
        expect(scope.weekDatesInfo[2].date).toEqual(moment(Bahmni.Common.Util.DateUtil.addDays(scope.weekDatesInfo[0].date, 2)).format('YYYY-MM-DD'));
        expect(scope.weekDatesInfo[3].date).toEqual(moment(Bahmni.Common.Util.DateUtil.addDays(scope.weekDatesInfo[0].date, 3)).format('YYYY-MM-DD'));
        expect(scope.weekDatesInfo[4].date).toEqual(moment(Bahmni.Common.Util.DateUtil.addDays(scope.weekDatesInfo[0].date, 4)).format('YYYY-MM-DD'));
        expect(scope.weekDatesInfo[5].date).toEqual(moment(Bahmni.Common.Util.DateUtil.addDays(scope.weekDatesInfo[0].date, 5)).format('YYYY-MM-DD'));
        expect(scope.weekDatesInfo[6].date).toEqual(moment(Bahmni.Common.Util.DateUtil.addDays(scope.weekDatesInfo[0].date, 6)).format('YYYY-MM-DD'));
    });

    it('should go to list view on clicking of appointment count', function () {
        createController();
        var date = moment("2017-02-01").toDate();
        scope.goToListView(date);
        var params = {viewDate: date,
            filterParams: {statusList: _.without(Bahmni.Appointments.Constants.appointmentStatusList, "Cancelled")}};
        expect(state.go).toHaveBeenCalledWith('home.manage.appointments.list', params);
    });

    it('should set service uuids and date when services and date are passed', function () {
        createController();
        var appointment = {
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
        };

        var date = moment("2017-02-01").toDate();
        scope.goToListView(date, appointment.appointmentService);
        var params = {viewDate: date,
            filterParams: {statusList: _.without(Bahmni.Appointments.Constants.appointmentStatusList, "Cancelled"),  serviceUuids : [ 'c526c72a-ae6a-446c-9337-42d1119bcb94' ]}};
        expect(state.go).toHaveBeenCalledWith('home.manage.appointments.list', params);
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
                },
                "2017-08-18": {
                    "allAppointmentsCount": 1,
                    "missedAppointmentsCount": 2,
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
            }, "appointmentCountMap": {
                "2017-08-16": {
                    "allAppointmentsCount": 1,
                    "missedAppointmentsCount": 2,
                    "appointmentDate": 1502821800000,
                    "appointmentServiceUuid": "c526c72a-ae6a-446c-9337-42d1119bcb95"
                },
                "2017-08-19": {
                    "allAppointmentsCount": 1,
                    "missedAppointmentsCount": 3,
                    "appointmentDate": 1502821800000,
                    "appointmentServiceUuid": "c526c72a-ae6a-446c-9337-42d1119bcb95"
                }
            }
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
            }, "appointmentCountMap": {
                "2017-08-14": {
                    "allAppointmentsCount": 3,
                    "missedAppointmentsCount": 2,
                    "appointmentDate": 1502821800000,
                    "appointmentServiceUuid": "c526c72a-ae6a-446c-9337-42d1119bcb96"
                },
                "2017-08-18": {
                    "allAppointmentsCount": 14,
                    "missedAppointmentsCount": 2,
                    "appointmentDate": 1502821800000,
                    "appointmentServiceUuid": "c526c72a-ae6a-446c-9337-42d1119bcb96"
                }
            }
        }];
        appointmentsService.getAppointmentsSummary.and.returnValue(specUtil.simplePromise({data: appointments}));
        createController();
        var startDate = moment("2017-08-13").toDate();
        var endDate = moment("2017-08-20").toDate();
        scope.getAppointmentsSummaryForAWeek(startDate, endDate);
        expect(scope.appointments).toEqual(appointments);
        expect(scope.weekDatesInfo.length).toEqual(7);
        expect(scope.weekDatesInfo[0]).toEqual({date: '2017-08-13', total: {all: 0, missed: 0}});
        expect(scope.weekDatesInfo[1]).toEqual({date: '2017-08-14', total: {all: 3, missed: 2}});
        expect(scope.weekDatesInfo[2]).toEqual({date: '2017-08-15', total: {all: 0, missed: 0}});
        expect(scope.weekDatesInfo[3]).toEqual({date: '2017-08-16', total: {all: 2, missed: 2}});
        expect(scope.weekDatesInfo[4]).toEqual({date: '2017-08-17', total: {all: 0, missed: 0}});
        expect(scope.weekDatesInfo[5]).toEqual({date: '2017-08-18', total: {all: 15, missed: 4}});
        expect(scope.weekDatesInfo[6]).toEqual({date: '2017-08-19', total: {all: 1, missed: 3}});
    });

    it('should set to true if it is current date', function () {
        var date = moment().toDate();
        createController();
        expect(scope.isCurrentDate(date)).toBeTruthy();
    });

    it('should set to false if it is not current date', function () {
        var date = moment('2017-04-02').toDate();
        createController();
        expect(scope.isCurrentDate(date)).toBeFalsy();
    });
});