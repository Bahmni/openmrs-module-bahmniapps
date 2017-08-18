'use strict'

describe ('appointmentsSummaryController', function () {
    var controller, scope, appointmentsService, spinner, appService, appDescriptor;

    beforeEach(function () {
        module('bahmni.appointments');
        inject(function ($controller, $rootScope, _spinner_) {
            controller = $controller;
            scope = $rootScope.$new();
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
            appointmentsService = jasmine.createSpyObj('appointmentsService', ['getAppointmentsSummary']);
            appService.getAppDescriptor.and.returnValue(appDescriptor);
            appDescriptor.getConfigValue.and.returnValue({'week': 'week'});
            spinner = jasmine.createSpyObj('spinner', ['forPromise', 'then', 'catch']);
            appointmentsService.getAppointmentsSummary.and.returnValue(specUtil.simplePromise({}));
            spinner.forPromise.and.callFake(function () {
                return {
                    then: function () {
                        return {};
                    }
                };
            });

        });
    });

    var createController = function () {
       controller('AppointmentsSummaryController', {
           $scope: scope,
           appService: appService,
           appointmentsService: appointmentsService,
           spinner: spinner
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

        var viewDate = moment().startOf('week');
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

});