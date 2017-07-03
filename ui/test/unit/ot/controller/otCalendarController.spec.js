'use strict';

describe("otCalendarController", function () {
    var scope, controller, q, spinner, state;
    var locationService = jasmine.createSpyObj('locationService', ['getAllByTag']);
    spinner = jasmine.createSpyObj('spinner', ['forPromise', 'then', 'catch']);
    var surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['getSurgicalBlocksInDateRange']);
    var ngDialog = jasmine.createSpyObj('ngDialog', ['open']);

    var surgicalBlocks = [
        {
            id: 60,
            provider: {uuid: "providerUuid1", display: "Doctor Strange"},
            location: {uuid: "uuid1", name: "location1"},
            surgicalAppointments: [ {id: 48, surgicalAppointmentAttributes: []}],
            startDatetime: "2001-10-04T09:00:00.000+0530",
            endDatetime: "2001-10-04T21:00:00.000+0530",
            uuid: "surgical-block1-uuid"
        },
        {
            id: 61,
            provider: {uuid: "providerUuid2", display: "Doctor Malhotra"},
            location: {uuid: "uuid2", name: "location2"},
            surgicalAppointments: [],
            startDatetime: "2001-10-04T09:00:00.000+0530",
            endDatetime: "2001-10-04T21:00:00.000+0530"
        }
    ];

    locationService.getAllByTag.and.callFake(function () {
        return {data: {results: [{uuid: "uuid1", name: "location1"}, {uuid: "uuid2", name: "location2"}]}};
    });
    surgicalAppointmentService.getSurgicalBlocksInDateRange.and.callFake(function () {
        return {data: {results: surgicalBlocks}};
    });

    beforeEach(function () {
        module('bahmni.ot');
        inject(function ($controller, $rootScope, $q) {
            controller = $controller;
            scope = $rootScope.$new();
            q = $q;
        });
    });

    spinner.forPromise.and.returnValue(specUtil.createFakePromise({}));

    var createController = function () {
        scope.dayViewStart = '09:00';
        scope.dayViewEnd = '16:30';
        scope.dayViewSplit = '60';
        scope.viewDate = moment('2017-02-19').toDate();
        controller('otCalendarController', {
            $scope: scope,
            locationService: locationService,
            $q: q,
            spinner: spinner,
            surgicalAppointmentService: surgicalAppointmentService

        });
        scope.$apply();
    };

    it("should calculate the no. of intervals for the calendar", function () {
        createController();

        var intervals = scope.intervals();
        expect(intervals).toEqual(8);
    });

    it('should give the rows for the calendar', function () {
        createController();

        var rows = scope.getRowsForCalendar();

        expect(rows.length).toEqual(8);
        expect(rows[0].date).toEqual(moment('2017-02-19 09:00:00').toDate());
        expect(rows[1].date).toEqual(moment('2017-02-19 10:00:00').toDate());
        expect(rows[2].date).toEqual(moment('2017-02-19 11:00:00').toDate());
        expect(rows[7].date).toEqual(moment('2017-02-19 16:00:00').toDate());
    });

    it('should fetch the locations with operation theater tag', function () {
        createController();

        expect(locationService.getAllByTag).toHaveBeenCalledWith('Operation Theater');
        expect(scope.locations.length).toEqual(2);
        expect(scope.locations[0]).toEqual({uuid: "uuid1", name: "location1"});
        expect(scope.locations[1]).toEqual({uuid: "uuid2", name: "location2"});
    });

    it('should group the surgical blocks by the location', function () {
        createController();
        expect(surgicalAppointmentService.getSurgicalBlocksInDateRange).toHaveBeenCalledWith(scope.viewDate, moment(scope.viewDate).endOf('day'));
        expect(scope.surgicalBlocksByLocation.length).toEqual(2);
        expect(scope.surgicalBlocksByLocation[0][0]).toEqual(surgicalBlocks[0]);
        expect(scope.surgicalBlocksByLocation[1][0]).toEqual(surgicalBlocks[1]);
    });

    it('should set the day view split as integer', function () {
        createController();
        expect(scope.dayViewSplit).toEqual(60);
        expect(scope.editDisabled).toBeTruthy();
        expect(scope.cancelDisabled).toBeTruthy();
    });

    it('should set the calendarStartDatetime and calendarEndDatetime', function () {
        createController();
        expect(scope.calendarStartDatetime).toEqual(moment('2017-02-19 09:00:00').toDate());
        expect(scope.calendarEndDatetime).toEqual(moment('2017-02-19 16:30:00').toDate());
    });
});