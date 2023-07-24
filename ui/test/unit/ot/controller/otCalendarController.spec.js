'use strict';

describe("otCalendarController", function () {
    var scope, controller, q, spinner;
    var state = jasmine.createSpyObj('$state', ['go']);
    var locationService = jasmine.createSpyObj('locationService', ['getAllByTag']);
    spinner = jasmine.createSpyObj('spinner', ['forPromise', 'then', 'catch']);
    var surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['getSurgicalBlocksInDateRange', 'getSurgeons', 'getBulkNotes', 'saveNoteForADay']);
    var ngDialog = jasmine.createSpyObj('ngDialog', ['open']);
    var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    var appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
    appDescriptor.getConfigValue.and.returnValue({primarySurgeonsForOT: ["Doctor Strange", "Doctor Malhotra"]});
    appService.getAppDescriptor.and.returnValue(appDescriptor);

    var surgicalBlocks = [
        {
            id: 60,
            provider: {uuid: "providerUuid1", display: "Doctor Strange"},
            location: {uuid: "uuid1", name: "location1"},
            surgicalAppointments: [{id: 48, surgicalAppointmentAttributes: []}],
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

    var weekSurgicalBlocks = [
        {
            id: 60,
            provider: {uuid: "providerUuid1", display: "Doctor Strange"},
            location: {uuid: "uuid1", name: "location1"},
            surgicalAppointments: [{id: 48, surgicalAppointmentAttributes: []}],
            startDatetime: "2020-04-10T09:00:00.000+0530",
            endDatetime: "2020-04-10T11:00:00.000+0530",
            uuid: "surgical-block1-uuid"
        },
        {
            id: 61,
            provider: {uuid: "providerUuid2", display: "Doctor Malhotra"},
            location: {uuid: "uuid2", name: "location2"},
            surgicalAppointments: [],
            startDatetime: "2020-04-11T09:00:00.000+0530",
            endDatetime: "2020-04-11T15:00:00.000+0530",
            uuid: "surgical-block2-uuid"
        }
    ];

    var surgeons = [
        {
            id: 1,
            person: {uuid: "personUuid1", display: "Doctor Strange"},
            attributes: [],
            uuid: "providerUuid1"
        },
        {
            id: 2,
            person: {uuid: "personUuid2", display: "Doctor Malhotra"},
            attributes: [],
            uuid: "providerUuid2"
        }
    ];

    var notes = [
        {
            id: 1,
            noteText: "note1",
            noteType: "OT module",
            noteDate: "2017-02-19T09:00:00.000+0530",
            uuid: "note1-uuid",
            location: "location1"
        }
    ];

    locationService.getAllByTag.and.callFake(function () {
        return {data: {results: [{uuid: "uuid1", name: "location1"}, {uuid: "uuid2", name: "location2"}]}};
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
        scope.notesStartDate = false;
        scope.notesEndDate = false;
        scope.viewDate = moment('2017-02-19').toDate();
        controller('otCalendarController', {
            $scope: scope,
            locationService: locationService,
            $state: state,
            $q: q,
            spinner: spinner,
            surgicalAppointmentService: surgicalAppointmentService,
            appService: appService
        });
        scope.$apply();
    };
    describe('dayView', function () {

        it("should calculate the no. of intervals for the calendar", function () {
            surgicalAppointmentService.getSurgicalBlocksInDateRange.and.callFake(function () {
                return {data: {results: surgicalBlocks}};
            });
            surgicalAppointmentService.getSurgeons.and.callFake(function () {
                return {data: {results: surgeons}};
            });
            surgicalAppointmentService.getBulkNotes.and.callFake(function () {
                return {data: notes}
            });
            createController();

            var intervals = scope.intervals();
            expect(intervals).toEqual(8);
        });

        it('should give the rows for the calendar', function () {
            surgicalAppointmentService.getSurgicalBlocksInDateRange.and.callFake(function () {
                return {data: {results: surgicalBlocks}};
            });
            surgicalAppointmentService.getSurgeons.and.callFake(function () {
                return {data: {results: surgeons}};
            });
            surgicalAppointmentService.getBulkNotes.and.callFake(function () {
                return {data: notes}
            });
            createController();

            var rows = scope.getRowsForCalendar();

            expect(rows.length).toEqual(8);
            expect(rows[0].date).toEqual(moment('2017-02-19 09:00:00').toDate());
            expect(rows[1].date).toEqual(moment('2017-02-19 10:00:00').toDate());
            expect(rows[2].date).toEqual(moment('2017-02-19 11:00:00').toDate());
            expect(rows[7].date).toEqual(moment('2017-02-19 16:00:00').toDate());
        });

        it('should fetch the locations with operation theater tag', function () {
            surgicalAppointmentService.getSurgicalBlocksInDateRange.and.callFake(function () {
                return {data: {results: surgicalBlocks}};
            });
            surgicalAppointmentService.getSurgeons.and.callFake(function () {
                return {data: {results: surgeons}};
            });
            surgicalAppointmentService.getBulkNotes.and.callFake(function () {
                return {data: notes}
            });
            createController();

            expect(locationService.getAllByTag).toHaveBeenCalledWith('Operation Theater');
            expect(scope.locations.length).toEqual(2);
            expect(scope.locations[0]).toEqual({uuid: "uuid1", name: "location1"});
            expect(scope.locations[1]).toEqual({uuid: "uuid2", name: "location2"});
        });

        it('should group the surgical blocks by the location', function () {
            surgicalAppointmentService.getSurgicalBlocksInDateRange.and.callFake(function () {
                return {data: {results: surgicalBlocks}};
            });
            surgicalAppointmentService.getSurgeons.and.callFake(function () {
                return {data: {results: surgeons}};
            });
            surgicalAppointmentService.getBulkNotes.and.callFake(function () {
                return {data: notes}
            });
            scope.weekOrDay = 'day';
            createController();
            expect(surgicalAppointmentService.getSurgicalBlocksInDateRange).toHaveBeenCalledWith(scope.viewDate, moment(scope.viewDate).endOf('day'), false, true);
            expect(scope.surgicalBlocks.length).toEqual(2);
            expect(scope.surgicalBlocks[0][0]).toEqual(surgicalBlocks[0]);
            expect(scope.surgicalBlocks[1][0]).toEqual(surgicalBlocks[1]);
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

    describe('weekView', function () {

        it('should return all week dates', function () {
            surgicalAppointmentService.getSurgicalBlocksInDateRange.and.callFake(function () {
                return {data: {results: weekSurgicalBlocks}};
            });
            scope.weekOrDay = 'week';
            scope.weekStartDate = moment('2020-04-06').toDate();
            createController();

            expect(scope.weekDates.length).toEqual(7);
            expect(scope.weekDates[0]).toEqual(moment('2020-04-06').toDate());
            expect(scope.weekDates[1]).toEqual(moment('2020-04-07').toDate());
            expect(scope.weekDates[2]).toEqual(moment('2020-04-08').toDate());
            expect(scope.weekDates[3]).toEqual(moment('2020-04-09').toDate());
            expect(scope.weekDates[4]).toEqual(moment('2020-04-10').toDate());
            expect(scope.weekDates[5]).toEqual(moment('2020-04-11').toDate());
            expect(scope.weekDates[6]).toEqual(moment('2020-04-12').toDate());
        });

        it('should return blocked ots of week in week view', function () {
            surgicalAppointmentService.getSurgicalBlocksInDateRange.and.callFake(function () {
                return {data: {results: weekSurgicalBlocks}};
            });
            scope.weekOrDay = 'week';
            scope.weekStartDate = moment('2020-04-06').toDate();
            createController();
            expect(scope.blockedOtsOfTheWeek.length).toEqual(7);
            expect(scope.blockedOtsOfTheWeek[0]).toEqual(['uuid1', 'uuid2']);
            expect(scope.blockedOtsOfTheWeek[1]).toEqual(['uuid1', 'uuid2']);
            expect(scope.blockedOtsOfTheWeek[2]).toEqual(['uuid1', 'uuid2']);
            expect(scope.blockedOtsOfTheWeek[3]).toEqual(['uuid1', 'uuid2']);
            expect(scope.blockedOtsOfTheWeek[4]).toEqual(['uuid1', 'uuid2']);
            expect(scope.blockedOtsOfTheWeek[5]).toEqual(["uuid2"]);
            expect(scope.blockedOtsOfTheWeek[6]).toEqual([]);

        });

        it('should group the surgical blocks by the date in week view', function () {
            surgicalAppointmentService.getSurgicalBlocksInDateRange.and.callFake(function () {
                return {data: {results: weekSurgicalBlocks}};
            });
            scope.weekOrDay = 'week';
            scope.weekStartDate = moment('2020-04-06').toDate();
            createController();
            expect(surgicalAppointmentService.getSurgicalBlocksInDateRange).toHaveBeenCalledWith(moment(scope.weekStartDate).startOf('day'), moment(Bahmni.Common.Util.DateUtil.getWeekEndDate(scope.weekStartDate)).endOf('day'), false, true);
            expect(scope.surgicalBlocksByDate.length).toEqual(7);
            expect(scope.surgicalBlocksByDate[4][0]).toEqual(weekSurgicalBlocks[0]);
            expect(scope.surgicalBlocksByDate[5][0]).toEqual(weekSurgicalBlocks[1]);
        });

        it('should return blocked ots of day in week view', function () {
            surgicalAppointmentService.getSurgicalBlocksInDateRange.and.callFake(function () {
                return {data: {results: weekSurgicalBlocks}};
            });
            scope.weekOrDay = 'week';
            scope.weekStartDate = moment('2020-04-06').toDate();
            createController();
            scope.updateBlockedOtsOfTheDay(4);
            expect(scope.blockedOtsOfTheDay.length).toEqual(2);
            expect(scope.blockedOtsOfTheDay).toEqual(["uuid1", "uuid2"]);
        });
    });

    describe('notes', function () {
        it('should set startDate and endDate to selectedDate when showNotesPopup is called', function () {
            surgicalAppointmentService.getSurgicalBlocksInDateRange.and.callFake(function () {
                return {data: {results: weekSurgicalBlocks}};
            });
            scope.weekOrDay = 'week';
            scope.weekStartDate = moment('2020-04-06').toDate();
            surgicalAppointmentService.getSurgeons.and.callFake(function () {
                return {data: {results: surgeons}};
            });
            surgicalAppointmentService.getBulkNotes.and.callFake(function () {
                return {data: notes}
            });
            createController();
            const weekStartDate = moment('2023-07-02').toDate();
            const expectedDate = moment('2023-07-05').toDate();
            scope.showNotesPopup(weekStartDate, 3);
            expect(scope.notesStartDate).toEqual(expectedDate);
            expect(scope.notesEndDate).toEqual(expectedDate);
        });
        it('should set startDate and endDate to selectedDate when we try to edit existing note', function () {
            surgicalAppointmentService.getSurgicalBlocksInDateRange.and.callFake(function () {
                return {data: {results: weekSurgicalBlocks}};
            });
            scope.weekOrDay = 'week';
            scope.weekStartDate = moment('2020-04-06').toDate();
            surgicalAppointmentService.getSurgeons.and.callFake(function () {
                return {data: {results: surgeons}};
            });
            surgicalAppointmentService.getBulkNotes.and.callFake(function () {
                return {data: notes}
            });
            createController();
            const weekStartDate = moment('2023-07-02').toDate();
            const expectedDate = moment('2023-07-05').toDate();
            scope.showNotesPopupEdit(weekStartDate, 3, 'note to show');
            expect(scope.notesStartDate).toEqual(expectedDate);
            expect(scope.notesEndDate).toEqual(expectedDate);
        });
        it('should clear startDate and endDate notes popup is closed', function () {
            surgicalAppointmentService.getSurgicalBlocksInDateRange.and.callFake(function () {
                return {data: {results: weekSurgicalBlocks}};
            });
            scope.weekOrDay = 'week';
            scope.weekStartDate = moment('2020-04-06').toDate();
            surgicalAppointmentService.getSurgeons.and.callFake(function () {
                return {data: {results: surgeons}};
            });
            surgicalAppointmentService.getBulkNotes.and.callFake(function () {
                return {data: notes}
            });
            createController();
            const weekStartDate = moment('2023-07-02').toDate();
            const expectedDate = moment('2023-07-05').toDate();
            scope.showNotesPopupEdit(weekStartDate, 3, 'note to show');
            expect(scope.notesStartDate).toEqual(expectedDate);
            expect(scope.notesEndDate).toEqual(expectedDate);
            scope.closeNotes();
            expect(scope.notesStartDate).toEqual(undefined);
            expect(scope.notesEndDate).toEqual(undefined);
            expect(scope.otNotesField).toEqual('');
        });
        it('should set the notes popup fields and save', function () {
            surgicalAppointmentService.getSurgicalBlocksInDateRange.and.callFake(function () {
                return {data: {results: weekSurgicalBlocks}};
            });
            scope.weekOrDay = 'week';
            scope.weekStartDate = moment('2020-04-06').toDate();
            surgicalAppointmentService.getSurgeons.and.callFake(function () {
                return {data: {results: surgeons}};
            });
            surgicalAppointmentService.getBulkNotes.and.callFake(function () {
                return {data: notes}
            });
            createController();
            const viewDate = moment('2023-07-05').toDate();
            scope.setNotesStartDate(viewDate);
            scope.setNotesEndDate(viewDate);
            scope.setNotes('note to show');
            scope.saveNotes();
            expect(scope.notesStartDate).toEqual(viewDate);
            expect(scope.notesEndDate).toEqual(viewDate);
            expect(scope.otNotesField).toEqual('note to show');
        });
        it('should set error field for empty notes when we try to save empty notes', function () {
            surgicalAppointmentService.getSurgicalBlocksInDateRange.and.callFake(function () {
                return {data: {results: weekSurgicalBlocks}};
            });
            scope.weekOrDay = 'week';
            scope.weekStartDate = moment('2020-04-06').toDate();
            surgicalAppointmentService.getSurgeons.and.callFake(function () {
                return {data: {results: surgeons}};
            });
            surgicalAppointmentService.getBulkNotes.and.callFake(function () {
                return {data: notes}
            });
            createController();
            scope.setNotes('');
            scope.saveNotes();
            expect(scope.emptyNoteError).toEqual(true);
        });
        it('should set error field when start Date is before endDate', function () {
            surgicalAppointmentService.getSurgicalBlocksInDateRange.and.callFake(function () {
                return {data: {results: weekSurgicalBlocks}};
            });
            scope.weekOrDay = 'week';
            scope.weekStartDate = moment('2020-04-06').toDate();
            surgicalAppointmentService.getSurgeons.and.callFake(function () {
                return {data: {results: surgeons}};
            });
            surgicalAppointmentService.getBulkNotes.and.callFake(function () {
                return {data: notes}
            });
            createController();
            scope.setNotesStartDate(moment('2023-07-05').toDate());
            scope.setNotesEndDate(moment('2023-07-02').toDate());
            scope.saveNotes();
            expect(scope.startDateBeforeEndDateError).toEqual(true);
        });
        it('should get styling of last block', function () {
            surgicalAppointmentService.getSurgicalBlocksInDateRange.and.callFake(function () {
                return {data: {results: weekSurgicalBlocks}};
            });
            scope.weekOrDay = 'week';
            scope.weekStartDate = moment('2020-04-06').toDate();
            surgicalAppointmentService.getSurgeons.and.callFake(function () {
                return {data: {results: surgeons}};
            });
            surgicalAppointmentService.getBulkNotes.and.callFake(function () {
                return {data: notes}
            });
            createController();
            const style = scope.styleForBlock(6);
            expect(style).toEqual({ 'border-right': '.5px solid lightgrey'});
        });
    });
});
