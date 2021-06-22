'use strict';

describe("otCalendarSurgicalBlock", function () {
    var simpleHtml = '<ot-calendar-surgical-block surgical-block="surgicalBlock"' +
        '  blocked-ots-of-the-day="blockedOtsOfTheDay" day-view-start="::dayViewStart" day-view-end="::dayViewEnd"' +
        ' day-view-split="dayViewSplit" filter-params="filterParams"  week-or-day="::weekOrDay" view-date="::viewDate" ></ot-calendar-surgical-block>';
    var $compile, element, mockBackend, scope;

    beforeEach(module('ngHtml2JsPreprocessor'));
    beforeEach(module('bahmni.ot'));
    beforeEach(inject(function (_$compile_, $rootScope, $httpBackend) {
        scope = $rootScope.$new();
        $compile = _$compile_;
        mockBackend = $httpBackend;
    }));

    //This function converts a date into locale specific date
    var toDateString = function (dateValue) {
        //dateValue expected in the format -> 2017-08-18 20:00:00
        return moment(dateValue, "YYYY-MM-DD HH:mm:ss").format();
    };

    var toDate = function (dateValue) {
        //dateValue expected in the format -> 2017-08-18 20:00:00
        return moment(dateValue, "YYYY-MM-DD HH:mm:ss").toDate();
    };

    var surgicalBlock =
        {
            id: 60,
            provider: {uuid: "providerUuid1", display: "Doctor Strange", attributes: []},
            location: {uuid: "3353ccb2-3086-11e7-b60e-0800274a5156", name: "location1"},
            person: {display: "Doctor Strange"},
            surgicalAppointments: [],
            startDatetime: toDateString("2017-05-24 09:00:00"),
            endDatetime: toDateString("2017-05-24 14:00:00")
        };

    describe("DayViewSurgicalBlockDimensions", function () {

        it("should calculate the dimensions of the surgical block", function () {
            scope.surgicalBlock = surgicalBlock;
            scope.dayViewStart = "09:00";
            scope.dayViewEnd = "16:00";
            scope.dayViewSplit = 30;
            scope.weekOrDay = 'day';
            scope.viewDate = "2017-05-24 09:00:00";

            mockBackend.expectGET('../ot/views/calendarSurgicalBlock.html').respond("<div>dummy</div>");
            element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.flush();
            var compiledElementScope = element.isolateScope();
            scope.$digest();
            expect(compiledElementScope.blockDimensions).toEqual({
                height: 1200,
                width: 96,
                top: 0,
                left: 0,
                color: {backgroundColor: 'hsl(0, 100%, 90%)', borderColor: 'hsl(0,100%, 60%)'},
                appointmentHeightPerMin: 3.93
            });
        });

        it("should set the color from the config", function () {
            var surgicalBlock =
                {
                    id: 60,
                    provider: {
                        uuid: "providerUuid1",
                        display: "Doctor Strange",
                        attributes: [{attributeType: {display: "otCalendarColor"}, value: "260"}]
                    },
                    location: {uuid: "3353ccb2-3086-11e7-b60e-0800274a5156", name: "location1"},
                    person: {display: "Doctor Strange"},
                    surgicalAppointments: [],
                    startDatetime: toDateString("2017-05-24 09:00:00"),
                    endDatetime: toDateString("2017-05-24 14:00:00")
                };
            scope.surgicalBlock = surgicalBlock;
            scope.dayViewStart = "09:00";
            scope.dayViewEnd = "16:00";
            scope.dayViewSplit = 30;
            scope.weekOrDay = 'day';
            scope.viewDate = "2017-05-24 09:00:00";

            mockBackend.expectGET('../ot/views/calendarSurgicalBlock.html').respond("<div>dummy</div>");
            element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.flush();
            var compiledElementScope = element.isolateScope();
            scope.$digest();
            expect(compiledElementScope.blockDimensions).toEqual({
                height: 1200,
                width: 96,
                top: 0,
                left: 0,
                color: {backgroundColor: 'hsl(260, 100%, 90%)', borderColor: 'hsl(260,100%, 60%)'},
                appointmentHeightPerMin: 3.93
            });
        });
    });

    it("should emit an event when surgical block is selected", function () {
        var event = {
            stopPropagation: function () {
            }
        };
        scope.surgicalBlock = surgicalBlock;

        mockBackend.expectGET('../ot/views/calendarSurgicalBlock.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        spyOn(compiledElementScope, "$emit");

        compiledElementScope.selectSurgicalBlock(event);
        expect(compiledElementScope.$emit).toHaveBeenCalledWith("event:surgicalBlockSelect", compiledElementScope.surgicalBlock);
    });

    it("should calculate estimated duration, expectedStartDatetime and expectedEndDatetime for a surgical appointment", function () {
        var surgicalBlock =
            {
                id: 60,
                provider: {
                    uuid: "providerUuid1",
                    display: "Doctor Strange",
                    attributes: [{attributeType: {display: "otCalendarColor"}, value: "260"}]
                },
                location: {uuid: "3353ccb2-3086-11e7-b60e-0800274a5156", name: "location1"},
                person: {display: "Doctor Strange"},
                surgicalAppointments: [{
                    "patient": {uuid: "PatientUUID1", display: "IQ100032 - Sri Rama"},
                    "surgicalAppointmentAttributes": [{
                        surgicalAppointmentAttributeType: {
                            uuid: "attributeUUID11",
                            name: "cleaningTime"
                        }, value: "15"
                    }, {
                        surgicalAppointmentAttributeType: {
                            uuid: "attributeUUID12",
                            name: "estTimeMinutes"
                        }, value: "1"
                    }, {
                        surgicalAppointmentAttributeType: {
                            uuid: "attributeUUID13",
                            name: "estTimeHours"
                        }, value: "2"
                    }
                    ]
                },
                    {
                        "patient": {uuid: "patientUUID2", display: "IQ100033 - Lakshmana"},
                        "surgicalAppointmentAttributes": [{
                            surgicalAppointmentAttributeType: {
                                uuid: "attributeUUID21",
                                name: "cleaningTime"
                            }, value: "15"
                        }, {
                            surgicalAppointmentAttributeType: {
                                uuid: "attributeUUID22",
                                name: "estTimeMinutes"
                            }, value: "30"
                        }, {
                            surgicalAppointmentAttributeType: {
                                uuid: "attributeUUID23",
                                name: "estTimeHours"
                            }, value: "1"
                        }
                        ]
                    }],
                startDatetime: "2017-05-24T09:00:00.000+0530",
                endDatetime: "2017-05-24T14:00:00.000+0530"
            };
        scope.surgicalBlock = surgicalBlock;
        scope.dayViewStart = "09:00";
        scope.dayViewEnd = "16:00";
        scope.dayViewSplit = 30;

        mockBackend.expectGET('../ot/views/calendarSurgicalBlock.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.surgicalBlock.surgicalAppointments[0].derivedAttributes.duration).toEqual(136);
        expect(compiledElementScope.surgicalBlock.surgicalAppointments[0].derivedAttributes.expectedStartDatetime).toEqual(new Date("Wed May 24 2017 09:00:00 GMT+0530 (IST)"));
        expect(compiledElementScope.surgicalBlock.surgicalAppointments[0].derivedAttributes.expectedEndDatetime).toEqual(new Date("Wed May 24 2017 11:16:00 GMT+0530 (IST)"));
        expect(compiledElementScope.surgicalBlock.surgicalAppointments[1].derivedAttributes.duration).toEqual(105);
        expect(compiledElementScope.surgicalBlock.surgicalAppointments[1].derivedAttributes.expectedStartDatetime).toEqual(new Date("Wed May 24 2017 11:16:00 GMT+0530 (IST)"));
        expect(compiledElementScope.surgicalBlock.surgicalAppointments[1].derivedAttributes.expectedEndDatetime).toEqual(new Date("Wed May 24 2017 13:01:00 GMT+0530 (IST)"));
    });

    it('should return false if block end time does not exceed the calendar end time', function () {
        scope.surgicalBlock = surgicalBlock;
        scope.dayViewSplit = 30;
        scope.dayViewStart = "09:00";
        scope.dayViewEnd = "16:00";


        mockBackend.expectGET('../ot/views/calendarSurgicalBlock.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.surgicalBlockExceedsCalendar()).toBeFalsy();
    });

    it('should return true if block end time exceeds the calendar end time', function () {
        scope.surgicalBlock = surgicalBlock;
        scope.dayViewSplit = 30;
        scope.dayViewStart = "08:00";
        scope.dayViewEnd = "13:59";

        mockBackend.expectGET('../ot/views/calendarSurgicalBlock.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.surgicalBlockExceedsCalendar()).toBeTruthy();
    });

    describe("WeekViewSurgicalBlockDimensions", function () {

        it("should calculate the width and left dimensions of surgical block when there is only one ot blocked on that day", function () {
            scope.surgicalBlock = surgicalBlock;
            scope.dayViewStart = "09:00";
            scope.dayViewEnd = "16:00";
            scope.dayViewSplit = 30;
            scope.weekOrDay = 'week';
            scope.blockedOtsOfTheDay = ["3353ccb2-3086-11e7-b60e-0800274a5156"];
            scope.viewDate = "2017-05-24 09:00:00";

            mockBackend.expectGET('../ot/views/calendarSurgicalBlock.html').respond("<div>dummy</div>");
            element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.flush();
            var compiledElementScope = element.isolateScope();
            scope.$digest();
            expect(compiledElementScope.blockDimensions).toEqual({
                height: 1200,
                width: 96,
                top: 0,
                left: 1,
                color: {backgroundColor: 'hsl(0, 100%, 90%)', borderColor: 'hsl(0,100%, 60%)'},
                appointmentHeightPerMin: 3.93
            });
        });

        it("should calculate the dimensions of surgical block when it is the second ot out of three ots blocked on that day", function () {
            scope.surgicalBlock = surgicalBlock;
            scope.dayViewStart = "09:00";
            scope.dayViewEnd = "16:00";
            scope.dayViewSplit = 30;
            scope.weekOrDay = 'week';
            scope.blockedOtsOfTheDay = ["3e175fd1-4ce5-11e7-9b35-000c29e530d2", "3353ccb2-3086-11e7-b60e-0800274a5156", "3e1740e5-4ce5-11e7-9b35-000c29e530d2"];
            scope.viewDate = "2017-05-24 09:00:00";

            mockBackend.expectGET('../ot/views/calendarSurgicalBlock.html').respond("<div>dummy</div>");
            element = $compile(simpleHtml)(scope);
            scope.$digest();
            mockBackend.flush();
            var compiledElementScope = element.isolateScope();
            scope.$digest();
            expect(compiledElementScope.blockDimensions).toEqual({
                height: 1200,
                width: 32,
                top: 0,
                left: 33,
                color: {backgroundColor: 'hsl(0, 100%, 90%)', borderColor: 'hsl(0,100%, 60%)'},
                appointmentHeightPerMin: 3.93
            });
        });
    });
});
