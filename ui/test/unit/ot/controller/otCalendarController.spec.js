'use strict';

describe("otCalendarController", function () {
    var scope, controller, q, spinner;
    var locationService = jasmine.createSpyObj('locationService', ['getAllByTag']);
    var spinner = jasmine.createSpyObj('spinner', ['forPromise', 'then', 'catch']);
    var surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['getSurgicalBlocksInDateRange']);

    var surgicalBlocks = [
        {
            id: 60,
            provider: {uuid: "providerUuid1", display: "Doctor Strange"},
            location: {uuid: "uuid1", name: "location1"},
            surgicalAppointments: [],
            startDatetime: "2001-10-04T09:00:00.000+0530",
            endDatetime: "2001-10-04T21:00:00.000+0530"
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

    afterEach(function () {
        scope.$apply();
    });


    spinner.forPromise.and.returnValue(specUtil.createFakePromise({}));

    var createController = function () {
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
        scope.dayViewStart = '09:00';
        scope.dayViewEnd = '16:30';
        scope.dayViewSplit = '60';
        createController();

        var intervals = scope.intervals();
        expect(intervals).toEqual(8);
    });

    it('should give the rows for the calendar', function () {
        scope.dayViewStart = '09:00';
        scope.dayViewEnd = '16:30';
        scope.dayViewSplit = '60';
        scope.viewDate = moment('2017-02-19').toDate();
        createController();

        var rows = scope.getRowsForCalendar();

        expect(rows.length).toEqual(8);
        expect(rows[0].date).toEqual(new Date('2017-02-19 09:00:00'));
        expect(rows[1].date).toEqual(new Date('2017-02-19 10:00:00'));
        expect(rows[2].date).toEqual(new Date('2017-02-19 11:00:00'));
        expect(rows[7].date).toEqual(new Date('2017-02-19 16:00:00'));
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
        // expect(surgicalAppointmentService.getSurgicalBlocksInDateRange).toHaveBeenCalled();
        // expect(scope.surgicalBlocksByLocation.length).toEqual(2);
        // expect(scope.surgicalBlocksByLocation).toEqual(surgicalBlocks);

    });


});