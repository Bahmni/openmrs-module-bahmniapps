'use strict';

describe("otCalendarSurgicalBlock", function () {
    var simpleHtml = '<ot-calendar-surgical-block surgical-block="surgicalBlock"' +
        ' grid-offset="gridOffset" calendar-start-datetime="calendarStartDatetime"' +
        ' calendar-end-datetime="calendarEndDatetime" day-view-split="dayViewSplit" filter-params="filterParams"></ot-calendar-surgical-block>';
    var $compile, element, mockBackend, scope;

    beforeEach(module('ngHtml2JsPreprocessor'));
    beforeEach(module('bahmni.ot'));
    beforeEach(inject(function (_$compile_, $rootScope, $httpBackend) {
        scope = $rootScope.$new();
        $compile = _$compile_;
        mockBackend = $httpBackend;
    }));

    //This function converts a date into locale specific date
    var toDateString = function(dateValue){
        //dateValue expected in the format -> 2017-08-18 20:00:00
        return moment(dateValue,"YYYY-MM-DD HH:mm:ss").format();
    };

    var toDate = function(dateValue){
        //dateValue expected in the format -> 2017-08-18 20:00:00
        return moment(dateValue,"YYYY-MM-DD HH:mm:ss").toDate();
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


    it("should calculate the dimensions of the surgical block", function () {
        scope.surgicalBlock = surgicalBlock;
        scope.calendarStartDatetime = toDate('2017-05-24 09:00:00');
        scope.calendarEndDatetime = toDate('2017-05-24 16:00:00');
        scope.dayViewSplit = 30;

        mockBackend.expectGET('../ot/views/calendarSurgicalBlock.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.blockDimensions).toEqual( {height : 1200, top : 0, color : {backgroundColor : 'hsl(0, 100%, 90%)', borderColor : 'hsl(0,100%, 60%)' }, appointmentHeightPerMin : 3.93 });
    });

    it("should set the color from the config", function () {
        var surgicalBlock =
        {
            id: 60,
            provider: {uuid: "providerUuid1", display: "Doctor Strange", attributes: [ {attributeType: {display: "otCalendarColor"}, value: "260"}]},
            location: {uuid: "3353ccb2-3086-11e7-b60e-0800274a5156", name: "location1"},
            person: {display: "Doctor Strange"},
            surgicalAppointments: [],
            startDatetime: toDateString("2017-05-24 09:00:00"),
            endDatetime: toDateString("2017-05-24 14:00:00")
        };
        scope.surgicalBlock = surgicalBlock;
        scope.calendarStartDatetime = toDate('2017-05-24 09:00:00');
        scope.calendarEndDatetime = toDate('2017-05-24 16:00:00');
        scope.dayViewSplit = 30;

        mockBackend.expectGET('../ot/views/calendarSurgicalBlock.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.blockDimensions).toEqual({height : 1200, top : 0, color : {backgroundColor : 'hsl(260, 100%, 90%)', borderColor : 'hsl(260,100%, 60%)' }, appointmentHeightPerMin : 3.93 });
    });

    it("should emit an event when surgical block is selected", function() {
        var event = {stopPropagation: function(){}};
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
                provider: {uuid: "providerUuid1", display: "Doctor Strange", attributes: [ {attributeType: {display: "otCalendarColor"}, value: "260"}]},
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
        scope.calendarStartDatetime = new Date(moment('2017-05-24 09:00:00'));
        scope.calendarEndDatetime = new Date(moment('2017-05-24 16:00:00'));
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
        scope.calendarStartDatetime = new Date(moment('2017-05-24 09:00:00'));
        scope.calendarEndDatetime = new Date(moment('2017-05-24 16:00:00'));
        scope.dayViewSplit = 30;

        mockBackend.expectGET('../ot/views/calendarSurgicalBlock.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.surgicalBlockExceedsCalendar()).toBeFalsy();
        compiledElementScope.calendarEndDatetime = new Date(moment('2017-05-24 14:00:00'));
        expect(compiledElementScope.surgicalBlockExceedsCalendar()).toBeFalsy();
    });

    it('should return true if block end time exceeds the calendar end time', function () {
        scope.surgicalBlock = surgicalBlock;
        scope.calendarStartDatetime = new Date(moment('2017-05-24 09:00:00'));
        scope.calendarEndDatetime = new Date(moment('2017-05-24 13:59:59'));
        scope.dayViewSplit = 30;

        mockBackend.expectGET('../ot/views/calendarSurgicalBlock.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.surgicalBlockExceedsCalendar()).toBeTruthy();
    });
});