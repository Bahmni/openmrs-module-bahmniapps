'use strict';

xdescribe("otCalendarController", function () {
    var scope, controller, translate;
    var locationService = jasmine.createSpyObj('locationService', ['getAllByTag']);
    var spinner = jasmine.createSpyObj('spinner', ['forPromise', 'then', 'catch']);
    var surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['getSurgicalBlocksInDateRange']);
    var state = jasmine.createSpyObj('state', ['go']);
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
        inject(function ($controller, $rootScope, $q, $translate) {
            controller = $controller;
            scope = $rootScope.$new();
            translate = $translate;
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
            translate: translate,
            surgicalAppointmentService: surgicalAppointmentService,
            $state: state,
            ngDialog: ngDialog
        });
        scope.$apply();
    };

    xit("should calculate the no. of intervals for the calendar", function () {
        createController();

        var intervals = scope.intervals();
        expect(intervals).toEqual(8);
    });

});