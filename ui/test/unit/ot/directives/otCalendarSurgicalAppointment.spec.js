'use strict';

describe("otCalendarSurgicalAppointment", function () {
    var simpleHtml = '<ot-calendar-surgical-appointment ' +
        'surgical-appointment="surgicalAppointment" background-color="blockDimensions.color" height-per-min="heightPerMin" filter-params="filterParams"/>';

    var $compile, window, element, mockBackend, scope, surgicalAppointment, provide, mockAppDescriptor, mockAppService;

    beforeEach(module('ngHtml2JsPreprocessor'));
    beforeEach(module('bahmni.ot'));
    beforeEach(module('bahmni.ot', function ($provide) {
        mockAppDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfig','getConfigValue', 'formatUrl']);
        mockAppDescriptor.getConfigValue.and.returnValue({
            link: "/bahmni/clinical/#/default/patient/{{patientUuid}}/dashboard"
        });
        mockAppDescriptor.formatUrl.and.returnValue("formattedUrl");
        mockAppService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        mockAppService.getAppDescriptor.and.returnValue(mockAppDescriptor);
        provide = $provide;
        $provide.value('appService', mockAppService);
    }));
    beforeEach(inject(function (_$compile_, $rootScope, $httpBackend, $window) {
        scope = $rootScope.$new();
        $compile = _$compile_;
        mockBackend = $httpBackend;
        window = $window
    }));

    beforeEach(function () {
        surgicalAppointment = {
                "patient": {uuid: "168eed46-dabe-4b7b-a0d6-a8e4ccc02510", display: "IQ100032 - Sri Rama"},
                "notes": "notes",
                "surgicalAppointmentAttributes": [{
                    surgicalAppointmentAttributeType: {
                        uuid: "25ef8484-3a1f-11e7-83f8-0800274a5156",
                        name: "procedure"
                    }, value: "procedure"
                }, {
                    surgicalAppointmentAttributeType: {
                        uuid: "25efb2ef-3a1f-11e7-83f8-0800274a5156",
                        name: "cleaningTime"
                    }, value: "15"
                }, {
                    surgicalAppointmentAttributeType: {
                        uuid: "25efa512-3a1f-11e7-83f8-0800274a5156",
                        name: "estTimeMinutes"
                    }, value: "1"
                }, {
                    surgicalAppointmentAttributeType: {
                        uuid: "25ef9562-3a1f-11e7-83f8-0800274a5156",
                        name: "estTimeHours"
                    }, value: "2"
                }, {
                    surgicalAppointmentAttributeType: {
                        uuid: "25efd013-3a1f-11e7-83f8-0800274a5156",
                        name: "otherSurgeon"
                    }, value: "18"
                }, {
                    surgicalAppointmentAttributeType: {
                        uuid: "25efec33-3a1f-11e7-83f8-0800274a5156",
                        name: "anaesthetist"
                    }, value: "anaest"
                }, {
                    surgicalAppointmentAttributeType: {uuid: "25eff89a-3a1f-11e7-83f8-0800274a5156", name: "scrubNurse"},
                    value: "scr"
                }, {
                    surgicalAppointmentAttributeType: {
                        uuid: "25f0060e-3a1f-11e7-83f8-0800274a5156",
                        name: "circulatingNurse"
                    }, value: "cir"

                }],
                 "derivedAttributes": {
                    duration: 136,
                    height: 136
                }
            };
        scope.filterParams = {
            providers: [],
            locations: {"location1": false, "location2": true},
            patient: {},
            statusList: []
        };
    });

    it("should set the attributes of the surgical appointment", function () {
        scope.surgicalAppointment = surgicalAppointment;
        scope.backgroundColor = "#FFFFF";
        scope.heightPerMin = 2;


        mockBackend.expectGET('../ot/views/calendarSurgicalAppointment.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.attributes).toEqual({
            procedure: 'procedure',
            cleaningTime: '15',
            estTimeMinutes: '1',
            estTimeHours: '2',
            otherSurgeon: '18',
            anaesthetist: 'anaest',
            scrubNurse: 'scr',
            circulatingNurse: 'cir'
        });
    });

    it("should calculate the height of the surgical appointment", function () {
        scope.surgicalAppointment = surgicalAppointment;
        scope.backgroundColor = "#FFFFF";
        scope.heightPerMin = 1.5;


        mockBackend.expectGET('../ot/views/calendarSurgicalAppointment.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.height).toEqual(204);
    });

    it("should format the patient's name for display", function () {
        scope.surgicalAppointment = surgicalAppointment;
        mockBackend.expectGET('../ot/views/calendarSurgicalAppointment.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.patient).toEqual("Sri Rama ( IQ100032 )");
    });

    it("should emit an event when surgical appointment is selected", function () {
        var event = {
            stopPropagation: function () {
            }
        };
        var surgicalBlock = {uuid: "surgicalBlockUuid"};
        scope.surgicalAppointment = surgicalAppointment;
        scope.$parent.surgicalBlock =  surgicalBlock;

        mockBackend.expectGET('../ot/views/calendarSurgicalAppointment.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        spyOn(compiledElementScope, "$emit");

        compiledElementScope.selectSurgicalAppointment(event);
        expect(compiledElementScope.$emit).toHaveBeenCalledWith("event:surgicalAppointmentSelect", compiledElementScope.surgicalAppointment, surgicalBlock);
    });

    it("Should the surgicalAppointment not be hidden, if the filter param doesn't have any patient and status filters", function () {
        scope.surgicalAppointment = surgicalAppointment;
        scope.filterParams = {
            providers: [{uuid: "providerUuid1"}],
            locations: {"location1": false, "location2": true},
            patient: {},
            statusList: []
        };

        mockBackend.expectGET('../ot/views/calendarSurgicalAppointment.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.canTheSurgicalAppointmentBeShown()).toBeTruthy();
    });

    it("Should the surgicalAppointment not be hidden, if the filter param have same patient as that of surgical appointment and no status filters", function () {
        surgicalAppointment.patient = {uuid: "168eed46-dabe-4b7b-a0d6-a8e4ccc02510", display: "IQ100032 - Sri Rama"};
        scope.surgicalAppointment = surgicalAppointment;
        scope.filterParams = {
            providers: [{uuid: "providerUuid1"}],
            locations: {"location1": false, "location2": true},
            patient: {uuid: "168eed46-dabe-4b7b-a0d6-a8e4ccc02510", display: "IQ100032 - Sri Rama"},
            statusList: []
        };

        mockBackend.expectGET('../ot/views/calendarSurgicalAppointment.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.canTheSurgicalAppointmentBeShown()).toBeTruthy();
    });

    it("Should the surgicalAppointment be hidden, if the filter param have any patient and no status filters", function () {
        surgicalAppointment.patient = {uuid: "168eed46-dabe-4b7b-a0d6-a8e4ccc02510", display: "IQ100032 - Sri Rama"};
        scope.surgicalAppointment = surgicalAppointment;
        scope.filterParams = {
            providers: [{uuid: "providerUuid1"}],
            locations: {"location1": false, "location2": true},
            patient: {uuid: "randomUuid", display: "random name"},
            statusList: []
        };

        mockBackend.expectGET('../ot/views/calendarSurgicalAppointment.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.canTheSurgicalAppointmentBeShown()).toBeFalsy();
    });

    it("Should the surgicalAppointment not be hidden, if the filter param have same status as that of surgical appointment and no patient filters", function () {
        surgicalAppointment.status = "SCHEDULED";
        scope.surgicalAppointment = surgicalAppointment;
        scope.filterParams = {
            providers: [{uuid: "providerUuid1"}],
            locations: {"location1": false, "location2": true},
            patient: {},
            statusList: [{name: "SCHEDULED"}, {name: "POSTPONED"}]
        };

        mockBackend.expectGET('../ot/views/calendarSurgicalAppointment.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.canTheSurgicalAppointmentBeShown()).toBeTruthy();
    });

    it("Should the surgicalAppointment be hidden, if the filter param have status otherthan the surgical appointment status and no patient filters", function () {
        surgicalAppointment.status = "SCHEDULED";
        surgicalAppointment.patient = {uuid: "168eed46-dabe-4b7b-a0d6-a8e4ccc02510", display: "IQ100032 - Sri Rama"};
        scope.surgicalAppointment = surgicalAppointment;
        scope.filterParams = {
            providers: [{uuid: "providerUuid1"}],
            locations: {"location1": false, "location2": true},
            patient: {uuid: "randomUuid", display: "random name"},
            statusList: [{name: "POSTPONED"}]
        };

        mockBackend.expectGET('../ot/views/calendarSurgicalAppointment.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.canTheSurgicalAppointmentBeShown()).toBeFalsy();
    });

    it("Should the surgicalAppointment not be hidden, if the filter param have same status and patient as that of surgical appointment status and patient", function () {
        surgicalAppointment.status = "SCHEDULED";
        scope.surgicalAppointment = surgicalAppointment;
        scope.filterParams = {
            providers: [{uuid: "providerUuid1"}],
            locations: {"location1": false, "location2": true},
            patient: {},
            statusList: [{name: "SCHEDULED"}, {name: "POSTPONED"}]
        };

        mockBackend.expectGET('../ot/views/calendarSurgicalAppointment.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.canTheSurgicalAppointmentBeShown()).toBeTruthy();
    });

    it("Should the surgicalAppointment be hidden, if the filter param status and patient different from that of surgical appointment", function () {
        surgicalAppointment.status = "SCHEDULED";
        surgicalAppointment.patient = {uuid: "168eed46-dabe-4b7b-a0d6-a8e4ccc02510", display: "IQ100032 - Sri Rama"};
        scope.surgicalAppointment = surgicalAppointment;
        scope.filterParams = {
            providers: [{uuid: "providerUuid1"}],
            locations: {"location1": false, "location2": true},
            patient: {uuid: "randomUuid", display: "random name"},
            statusList: [{name: "POSTPONED"}]
        };

        mockBackend.expectGET('../ot/views/calendarSurgicalAppointment.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.canTheSurgicalAppointmentBeShown()).toBeFalsy();
    });

    it("Should the surgicalAppointment be hidden, if the filter param patient matches with surgical appointment patient but not the status", function () {
        surgicalAppointment.status = "SCHEDULED";
        surgicalAppointment.patient = {uuid: "168eed46-dabe-4b7b-a0d6-a8e4ccc02510", display: "IQ100032 - Sri Rama"};
        scope.surgicalAppointment = surgicalAppointment;
        scope.filterParams = {
            providers: [{uuid: "providerUuid1"}],
            locations: {"location1": false, "location2": true},
            patient: {uuid: "168eed46-dabe-4b7b-a0d6-a8e4ccc02510", display: "IQ100032 - Sri Rama"},
            statusList: [{name: "POSTPONED"}]
        };

        mockBackend.expectGET('../ot/views/calendarSurgicalAppointment.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.canTheSurgicalAppointmentBeShown()).toBeFalsy();
    });

    it("Should the surgicalAppointment be hidden, if the filter param status matches with surgical appointment status but not the patient", function () {
        surgicalAppointment.status = "SCHEDULED";
        surgicalAppointment.patient = {uuid: "168eed46-dabe-4b7b-a0d6-a8e4ccc02510", display: "IQ100032 - Sri Rama"};
        scope.surgicalAppointment = surgicalAppointment;
        scope.filterParams = {
            providers: [{uuid: "providerUuid1"}],
            locations: {"location1": false, "location2": true},
            patient: {uuid: "randomUuid", display: "random name"},
            statusList: [{name: "SCHEDULED"}]
        };

        mockBackend.expectGET('../ot/views/calendarSurgicalAppointment.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.canTheSurgicalAppointmentBeShown()).toBeFalsy();
    });

    it("Should the surgicalAppointment not be hidden, if the filter param status and patient both matches with surgical appointment status and patient", function () {
        surgicalAppointment.status = "SCHEDULED";
        surgicalAppointment.patient = {uuid: "168eed46-dabe-4b7b-a0d6-a8e4ccc02510", display: "IQ100032 - Sri Rama"};
        scope.surgicalAppointment = surgicalAppointment;
        scope.filterParams = {
            providers: [{uuid: "providerUuid1"}],
            locations: {"location1": false, "location2": true},
            patient: {uuid: "168eed46-dabe-4b7b-a0d6-a8e4ccc02510", display: "IQ100032 - Sri Rama"},
            statusList: [{name: "SCHEDULED"}]
        };

        mockBackend.expectGET('../ot/views/calendarSurgicalAppointment.html').respond("<div>dummy</div>");
        element = $compile(simpleHtml)(scope);
        scope.$digest();
        mockBackend.flush();
        var compiledElementScope = element.isolateScope();
        scope.$digest();
        expect(compiledElementScope.canTheSurgicalAppointmentBeShown()).toBeTruthy();
    });
});