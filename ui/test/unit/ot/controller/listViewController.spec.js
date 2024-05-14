'use strict';

describe('listViewController', function () {
    var scope, controller, q, spinner, state, rootScope, defaultAttributeTypes;
    var locationService = jasmine.createSpyObj('locationService', ['getAllByTag']);
    spinner = jasmine.createSpyObj('spinner', ['forPromise', 'then', 'catch']);
    var surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['getSurgicalBlocksInDateRange']);
    state = jasmine.createSpyObj('state', ['go']);
    var ngDialog = jasmine.createSpyObj('ngDialog', ['open']);
    var printer = jasmine.createSpyObj('printer', ['print']);
    var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    var appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
    appService.getAppDescriptor.and.returnValue(appDescriptor);

    beforeEach(function () {
        module('bahmni.ot');
        inject(function ($controller, $rootScope, $q) {
            controller = $controller;
            rootScope = $rootScope;
            scope = $rootScope.$new();
            q = $q;
        });
    });

    var createController = function () {
        spyOn(scope, "$emit");
        controller('listViewController', {
            $scope: scope,
            $rootScope: rootScope,
            locationService: locationService,
            $q: q,
            spinner: spinner,
            surgicalAppointmentService: surgicalAppointmentService,
            appService: appService,
            $state: state,
            ngDialog: ngDialog,
            printer: printer
        });
        scope.$apply();
    };
    defaultAttributeTypes = [
        {
            "uuid": "613ed1d6-3c7c-11e7-ba26-0800274a5156",
            "name": "procedure",
            "format": "java.lang.String"
        },
        {
            "uuid": "613efa61-3c7c-11e7-ba26-0800274a5156",
            "name": "estTimeHours",
            "format": "java.lang.String"
        },
        {
            "uuid": "613f275a-3c7c-11e7-ba26-0800274a5156",
            "name": "estTimeMinutes",
            "format": "java.lang.String"
        },
        {
            "uuid": "6141270b-3c7c-11e7-ba26-0800274a5156",
            "name": "cleaningTime",
            "format": "java.lang.String"
        },
        {
            "uuid": "61415081-3c7c-11e7-ba26-0800274a5156",
            "name": "otherSurgeon",
            "format": "org.openmrs.Provider"
        },
        {
            "uuid": "61416693-3c7c-11e7-ba26-0800274a5156",
            "name": "surgicalAssistant",
            "format": "java.lang.String"
        },
        {
            "uuid": "6141780a-3c7c-11e7-ba26-0800274a5156",
            "name": "anaesthetist",
            "format": "java.lang.String"
        },
        {
            "uuid": "6141881a-3c7c-11e7-ba26-0800274a5156",
            "name": "scrubNurse",
            "format": "java.lang.String"
        },
        {
            "uuid": "6141968f-3c7c-11e7-ba26-0800274a5156",
            "name": "circulatingNurse",
            "format": "java.lang.String"
        },
        {
            "uuid": "910f2c7f-4b73-11e7-81d5-0800274a5156",
            "name": "notes",
            "format": "java.lang.String"
        }
    ];

      var surgicalAppointmentsForOT2Block = [{
          "id": 105,
          "patient": {"uuid": "3ee5efbf-1267-43af-943d-d1ee8ced9285", "display": "EG100145M - Al Padas e", "person" : {"age": "25"}},
          "actualStartDatetime": "2017-06-22T08:54:00.000+0530",
          "actualEndDatetime": "2017-06-22T09:54:00.000+0530",
          "status": "POSTPONED",
          "notes": "psofdkjfsdfslfskfjsf",
          "sortWeight": null,
          "surgicalAppointmentAttributes": [{
              surgicalAppointmentAttributeType: {
                  format: "java.lang.String",
                  name: "estTimeMinutes"
              },
              value: "30"
          },
              {
                  surgicalAppointmentAttributeType: {
                      format: "java.lang.String",
                      name: "estTimeHours"
                  },
                  value: "0"
              },
              {
                  surgicalAppointmentAttributeType: {
                      format: "java.lang.String",
                      name: "cleaningTime"
                  },
                  value: "15"
              }
          ]
      }, {
          "id": 96,
          "patient": {
              "uuid": "168eed46-dabe-4b7b-a0d6-a8e4ccc02510",
              "display": "EG100104M - Al Padjhjvj hjhj hjjhhjhj",
              "person": {
                  "age": "45"
              }
          },
          "actualStartDatetime": "2017-06-22T10:00:00.000+0530",
          "actualEndDatetime": "2017-06-22T11:30:00.000+0530",
          "status": "POSTPONED",
          "notes": "postpone appointment",
          "sortWeight": null,
          "surgicalAppointmentAttributes": [
              {
                  surgicalAppointmentAttributeType: {
                      format: "java.lang.String",
                      name: "estTimeMinutes"
                  },
                  value: "0"
              },
              {
                  surgicalAppointmentAttributeType: {
                      format: "java.lang.String",
                      name: "estTimeHours"
                  },
                  value: "1"
              },
              {
                  surgicalAppointmentAttributeType: {
                      format: "java.lang.String",
                      name: "cleaningTime"
                  },
                  value: "15"
              }
          ]
      }];

      var surgicalAppointmentsForOT1Block = [{
          "id": 104,
          "patient": {"uuid": "2300015f-95a3-4d47-933d-a81138ad0aa6", "display": "EG100137M - Al Pad Hassan", "person": {"age": "98"}},
          "actualStartDatetime": "2017-06-22T09:00:00.000+0530",
          "actualEndDatetime": "2017-06-22T13:00:00.000+0530",
          "status": "SCHEDULED",
          "notes": null,
          "sortWeight": 0,
          "surgicalAppointmentAttributes": [
              {
                  surgicalAppointmentAttributeType: {
                      format: "java.lang.String",
                      name: "estTimeMinutes"
                  },
                  value: "30"
              },
              {
                  surgicalAppointmentAttributeType: {
                      format: "java.lang.String",
                      name: "estTimeHours"
                  },
                  value: "1"
              },
              {
                  surgicalAppointmentAttributeType: {
                      format: "java.lang.String",
                      name: "cleaningTime"
                  },
                  value: "15"
              }
          ]
      }];

      var surgicalAppointmentsForOT3Block = [{
          "id": 107,
          "patient": {
              "uuid": "2848a63a-b273-4d9d-8e10-1ad3e39ab1a6",
              "display": "IQ100079F - XKHRQKVNNJKC UHNTLIXSNERE",
              "person": {
                  "age": "34"
              }
          },
          "actualStartDatetime": "2017-06-22T08:30:00.000+0530",
          "actualEndDatetime": "2017-06-22T09:30:00.000+0530",
          "status": "POSTPONED",
          "notes": "not ready",
          "sortWeight": 0,
          "surgicalAppointmentAttributes": [
              {
                  surgicalAppointmentAttributeType: {
                      format: "java.lang.String",
                      name: "estTimeMinutes"
                  },
                  value: "30"
              },
              {
                  surgicalAppointmentAttributeType: {
                      format: "java.lang.String",
                      name: "estTimeHours"
                  },
                  value: "0"
              },
              {
                  surgicalAppointmentAttributeType: {
                      format: "java.lang.String",
                      name: "cleaningTime"
                  },
                  value: "15"
              }
          ]
      }, {
          "id": 106,
          "patient": {
              "uuid": "9b41d661-df96-4815-aea1-ecc8278dd220",
              "display": "IQ100072F - QXHTPLJYKLTF JVMSGICIQZVB",
              "person": {
                  "age": "34"
              }
          },
          "actualStartDatetime": "2017-06-22T09:45:00.000+0530",
          "actualEndDatetime": "2017-06-22T13:00:00.000+0530",
          "status": "COMPLETED",
          "notes": null,
          "sortWeight": 0,
          "surgicalAppointmentAttributes": [
              {
                  surgicalAppointmentAttributeType: {
                      format: "java.lang.String",
                      name: "estTimeMinutes"
                  },
                  value: "30"
              },
              {
                  surgicalAppointmentAttributeType: {
                      format: "java.lang.String",
                      name: "estTimeHours"
                  },
                  value: "2"
              },
              {
                  surgicalAppointmentAttributeType: {
                      format: "java.lang.String",
                      name: "cleaningTime"
                  },
                  value: "15"
              }
          ]
      }, {
          "id": 108,
          "patient": {
              "uuid": "0c58967c-a415-48c8-9830-adcaa94b9d4f",
              "display": "IQ100074F - CUYCTOEPHJDP OCECDYHMGPSO",
              "person": {
                  "age": "56"
              }
          },
          "actualStartDatetime": "2017-06-22T14:30:00.000+0530",
          "actualEndDatetime": "2017-06-22T16:30:00.000+0530",
          "status": "CANCELLED",
          "notes": "Mistake",
          "sortWeight": null,
          "surgicalAppointmentAttributes": [
              {
                  surgicalAppointmentAttributeType: {
                      format: "java.lang.String",
                      name: "estTimeMinutes"
                  },
                  value: "30"
              },
              {
                  surgicalAppointmentAttributeType: {
                      format: "java.lang.String",
                      name: "estTimeHours"
                  },
                  value: "1"
              },
              {
                  surgicalAppointmentAttributeType: {
                      format: "java.lang.String",
                      name: "cleaningTime"
                  },
                  value: "0"
              }
          ]
      }];



       var results = [{
           "id": 114,
           "provider": {
               "uuid": "1773ea11-1617-11e7-85a5-080027b18094",
               "person": {"uuid": "17731354-1617-11e7-85a5-080027b18094", "display": "Yahya Kalilah"},
               "attributes": [{
                   "attributeType": {"display": "otCalendarColor"},
                   "value": "360",
                   "voided": false
               }, {"attributeType": {"display": "otCalendarColor"}, "value": "260", "voided": true}]
           },
           "location": {"uuid": "3353e310-3086-11e7-b60e-0800274a5156", "name": "OT 2"},
           "startDatetime": "2017-06-22T08:54:00.000+0530",
           "endDatetime": "2017-06-22T16:54:00.000+0530",
           "surgicalAppointments": surgicalAppointmentsForOT2Block,
           "uuid": "7a6e123e-a824-4512-b50b-5c49bfbe71de"
       }, {
           "id": 119,
           "provider": {
               "uuid": "55b4ebe6-a00b-4ee1-8691-a71513bc3253",
               "person": {"uuid": "e25196dc-9934-423a-99e9-0838bc8c9856", "display": "Eman Fawzi"},
               "attributes": [{
                   "attributeType": {"display": "color"},
                   "value": "#DAECFE",
                   "voided": false
               }, {
                   "attributeType": {"display": "otCalendarColor"},
                   "value": "200",
                   "voided": false
               }, {
                   "attributeType": {"display": "color"},
                   "value": "#EFD7FE",
                   "voided": true
               }, {"attributeType": {"display": "otCalendarColor"}, "value": "#DAECFE", "voided": true}]
           },
           "location": {"uuid": "3353ccb2-3086-11e7-b60e-0800274a5156", "name": "OT 1"},
           "startDatetime": "2017-06-22T09:00:00.000+0530",
           "endDatetime": "2017-06-22T10:00:00.000+0530",
           "surgicalAppointments": surgicalAppointmentsForOT1Block,
           "uuid": "524cdff6-812c-4b54-ae9e-d3f1c1f00eb9"
       }, {
           "id": 120,
           "provider": {
               "uuid": "1799e06e-1617-11e7-85a5-080027b18094",
               "person": {"uuid": "17990560-1617-11e7-85a5-080027b18094", "display": "Hanna Janho"},
               "attributes": [{"attributeType": {"display": "otCalendarColor"}, "value": "270", "voided": false}]
           },
           "location": {"uuid": "3353f1c1-3086-11e7-b60e-0800274a5156", "name": "OT 3"},
           "startDatetime": "2017-06-22T08:30:00.000+0530",
           "endDatetime": "2017-06-22T17:00:00.000+0530",
           "surgicalAppointments": surgicalAppointmentsForOT3Block,
           "uuid": "c9bd5e83-62f7-4e03-a7b4-fd056c4dd67e"
       }];

    surgicalAppointmentService.getSurgicalBlocksInDateRange.and.callFake(function () {
        return {data: {results: results}};
    });


    it("should sort the appointments by start date and by the location and by start time", function () {
        scope.viewDate = moment('2017-06-22').toDate();
        scope.filterParams = {
            providers: [],
            locations: {"OT 1": true, "OT 2": true, "OT 3": true},
            patient: null,
            statusList: []
        };
        createController();
        expect(surgicalAppointmentService.getSurgicalBlocksInDateRange).toHaveBeenCalledWith(jasmine.any(Date), jasmine.any(Date), true, true);
        expect(scope.surgicalAppointmentList.length).toEqual(6);
        expect(scope.surgicalAppointmentList[0].id).toEqual(104);
        expect(scope.surgicalAppointmentList[1].id).toEqual(105);
        expect(scope.surgicalAppointmentList[2].id).toEqual(96);
        expect(scope.surgicalAppointmentList[3].id).toEqual(107);
        expect(scope.surgicalAppointmentList[4].id).toEqual(106);
        expect(scope.surgicalAppointmentList[5].id).toEqual(108);
    });

    it("should set the derived attributes for appointments", function () {
        scope.viewDate = moment('2017-06-22').toDate();
        scope.filterParams = {
            providers: [],
            locations: {"OT 1": true, "OT 2": false, "OT 3": false},
            patient: {uuid: "2300015f-95a3-4d47-933d-a81138ad0aa6"},
            statusList: []
        };
        createController();
        expect(scope.surgicalAppointmentList.length).toEqual(1);
        expect(moment(scope.surgicalAppointmentList[0].derivedAttributes.expectedStartTime).utc().format()).toEqual("2017-06-22T03:30:00Z");
        expect(scope.surgicalAppointmentList[0].derivedAttributes.expectedStartDate).toEqual(moment(results[0].startDatetime).startOf('day').toDate());
        expect(scope.surgicalAppointmentList[0].derivedAttributes.patientIdentifier).toEqual("EG100137M");
        expect(scope.surgicalAppointmentList[0].derivedAttributes.patientAge).toEqual("98");
        expect(scope.surgicalAppointmentList[0].status).toEqual("SCHEDULED");
    });

    it("should print the page with the surgical appointment list", function () {
        appDescriptor.getConfigValue.and.callFake(function (value) {
            if (value == 'printListViewTemplateUrl') {
                return "/bahmni_config/openmrs/apps/ot/printListView.html";
            }
            return value;
        });
        scope.filterParams = {
            providers: [],
            locations: {"OT 1": true, "OT 2": false, "OT 3": false},
            patient: {uuid: "2300015f-95a3-4d47-933d-a81138ad0aa6"},
            statusList: []
        };
        createController();
        scope.printPage();
        expect(printer.print).toHaveBeenCalledWith("/bahmni_config/openmrs/apps/ot/printListView.html",
            {
                surgicalAppointmentList: scope.surgicalAppointmentList,
                weekStartDate: scope.weekStartDate,
                weekEndDate: scope.weekEndDate,
                viewDate: scope.viewDate,
                weekOrDay: scope.weekOrDay,
                isCurrentDate: scope.isCurrentDateinWeekView
            });
    });

    it('should print the page with the default list view when configuration template url is not there', function () {
        appDescriptor.getConfigValue.and.callFake(function (value) {
            if (value == 'printListViewTemplateUrl') {
                return '';
            }
            return value;
        });
        scope.filterParams = {
            providers: [],
            locations: {"OT 1": true, "OT 2": false, "OT 3": false},
            patient: {uuid: "2300015f-95a3-4d47-933d-a81138ad0aa6"},
            statusList: []
        };
        createController();
        scope.printPage();
        expect(printer.print).toHaveBeenCalledWith("views/listView.html",
            {
                surgicalAppointmentList: scope.surgicalAppointmentList,
                weekStartDate: scope.weekStartDate,
                weekEndDate: scope.weekEndDate,
                viewDate: scope.viewDate,
                weekOrDay: scope.weekOrDay,
                isCurrentDate: scope.isCurrentDateinWeekView
            });
    });

    it("should sort appointments by the sort column", function () {
        scope.viewDate = moment('2017-06-22').toDate();
        scope.filterParams = {
            providers: [],
            locations: {"OT 1": true, "OT 2": true, "OT 3": true},
            statusList: []
        };
        createController();
        scope.sortSurgicalAppointmentsBy('derivedAttributes.patientIdentifier');
        expect(scope.sortColumn).toEqual('derivedAttributes.patientIdentifier');
        expect(scope.surgicalAppointmentList.length).toEqual(6);
        expect(scope.surgicalAppointmentList[0].id).toEqual(96);
        expect(scope.surgicalAppointmentList[1].id).toEqual(104);
        expect(scope.surgicalAppointmentList[2].id).toEqual(105);
        expect(scope.surgicalAppointmentList[3].id).toEqual(106);
        expect(scope.surgicalAppointmentList[4].id).toEqual(108);
        expect(scope.surgicalAppointmentList[5].id).toEqual(107);

        scope.sortSurgicalAppointmentsBy('status');
        expect(scope.sortColumn).toEqual('status');
        expect(scope.surgicalAppointmentList.length).toEqual(6);
        expect(scope.surgicalAppointmentList[0].id).toEqual(104);
        expect(scope.surgicalAppointmentList[1].id).toEqual(107);
        expect(scope.surgicalAppointmentList[2].id).toEqual(105);
        expect(scope.surgicalAppointmentList[3].id).toEqual(96);
        expect(scope.surgicalAppointmentList[4].id).toEqual(106);
        expect(scope.surgicalAppointmentList[5].id).toEqual(108);

        scope.sortSurgicalAppointmentsBy('derivedAttributes.duration');
        expect(scope.sortColumn).toEqual('derivedAttributes.duration');
        expect(scope.surgicalAppointmentList.length).toEqual(6);
        expect(scope.surgicalAppointmentList[0].id).toEqual(107);
        expect(scope.surgicalAppointmentList[1].id).toEqual(105);
        expect(scope.surgicalAppointmentList[2].id).toEqual(96);
        expect(scope.surgicalAppointmentList[3].id).toEqual(108);
        expect(scope.surgicalAppointmentList[4].id).toEqual(104);
        expect(scope.surgicalAppointmentList[5].id).toEqual(106);

        scope.sortSurgicalAppointmentsBy('derivedAttributes.expectedStartTime');
        expect(scope.sortColumn).toEqual('derivedAttributes.expectedStartTime');
        expect(scope.surgicalAppointmentList.length).toEqual(6);
        expect(scope.surgicalAppointmentList[0].id).toEqual(104);
        expect(scope.surgicalAppointmentList[1].id).toEqual(106);
        expect(scope.surgicalAppointmentList[2].id).toEqual(107);
        expect(scope.surgicalAppointmentList[3].id).toEqual(105);
        expect(scope.surgicalAppointmentList[4].id).toEqual(96);
        expect(scope.surgicalAppointmentList[5].id).toEqual(108);

        scope.sortSurgicalAppointmentsBy('actualStartDatetime');
        expect(scope.sortColumn).toEqual('actualStartDatetime');
        expect(scope.surgicalAppointmentList.length).toEqual(6);
        expect(scope.surgicalAppointmentList[0].id).toEqual(107);
        expect(scope.surgicalAppointmentList[1].id).toEqual(105);
        expect(scope.surgicalAppointmentList[2].id).toEqual(104);
        expect(scope.surgicalAppointmentList[3].id).toEqual(106);
        expect(scope.surgicalAppointmentList[4].id).toEqual(96);
        expect(scope.surgicalAppointmentList[5].id).toEqual(108);

        scope.sortSurgicalAppointmentsBy('derivedAttributes.patientAge');
        expect(scope.sortColumn).toEqual('derivedAttributes.patientAge');
        expect(scope.surgicalAppointmentList.length).toEqual(6);
        expect(scope.surgicalAppointmentList[0].id).toEqual(104);
        expect(scope.surgicalAppointmentList[1].id).toEqual(108);
        expect(scope.surgicalAppointmentList[2].id).toEqual(96);
        expect(scope.surgicalAppointmentList[3].id).toEqual(106);
        expect(scope.surgicalAppointmentList[4].id).toEqual(107);
        expect(scope.surgicalAppointmentList[5].id).toEqual(105);
    });

    it("should reverse sort appointments if sorted on the same column consecutively", function () {
        scope.viewDate = moment('2017-06-22').toDate();
        scope.filterParams = {
            providers: [],
            locations: {"OT 1": true, "OT 2": true, "OT 3": true},
            statusList: []
        };
        createController();
        scope.sortSurgicalAppointmentsBy('derivedAttributes.patientIdentifier');
        expect(scope.reverseSort).toEqual(true);
        expect(scope.surgicalAppointmentList.length).toEqual(6);
        expect(scope.surgicalAppointmentList[0].id).toEqual(96);
        expect(scope.surgicalAppointmentList[1].id).toEqual(104);
        expect(scope.surgicalAppointmentList[2].id).toEqual(105);
        expect(scope.surgicalAppointmentList[3].id).toEqual(106);
        expect(scope.surgicalAppointmentList[4].id).toEqual(108);
        expect(scope.surgicalAppointmentList[5].id).toEqual(107);

        scope.sortSurgicalAppointmentsBy('derivedAttributes.patientIdentifier');
        expect(scope.reverseSort).toEqual(false);
        expect(scope.surgicalAppointmentList.length).toEqual(6);
        expect(scope.surgicalAppointmentList[0].id).toEqual(107);
        expect(scope.surgicalAppointmentList[1].id).toEqual(108);
        expect(scope.surgicalAppointmentList[2].id).toEqual(106);
        expect(scope.surgicalAppointmentList[3].id).toEqual(105);
        expect(scope.surgicalAppointmentList[4].id).toEqual(104);
        expect(scope.surgicalAppointmentList[5].id).toEqual(96);
    });

    it("should emit an event when surgical appointment is selected in list view", function () {
        scope.filterParams = {
            providers: [],
            locations: {"OT 1": true, "OT 2": true, "OT 3": true},
            statusList: []
        };

        var event = {
            stopPropagation: function () {
            }
        };
        var surgicalBlock = {uuid: "surgicalBlockUuid"};
        var appointment = surgicalAppointmentsForOT2Block[0];
        appointment.surgicalBlock =  results[0];
        createController();
        scope.selectSurgicalAppointment(event, appointment);
        expect(scope.$emit).toHaveBeenCalledWith("event:surgicalAppointmentSelect", appointment, appointment.surgicalBlock);
    });

    it("should emit an event when surgical appointment is deselected in list view", function () {
        scope.filterParams = {
            providers: [],
            locations: {"OT 1": true, "OT 2": true, "OT 3": true},
            statusList: []
        };
        var event = {
            stopPropagation: function () {
            }
        };
        createController();
        scope.deselectSurgicalAppointment(event);
        expect(scope.$emit).toHaveBeenCalledWith("event:surgicalBlockDeselect");
    });

    it("isStatusPostponed should return true if status is postponed", function () {
        scope.filterParams = {
            providers: [],
            locations: {"OT 1": true, "OT 2": true, "OT 3": true},
            statusList: []
        };
        var event = {
            stopPropagation: function () {
            }
        };
        createController();
        var isPostponed = scope.isStatusPostponed('POSTPONED');
        expect(isPostponed).toBeTruthy();
    });

    it("isStatusPostponed should return false if status is not postponed", function () {
        scope.filterParams = {
            providers: [],
            locations: {"OT 1": true, "OT 2": true, "OT 3": true},
            statusList: []
        };
        var event = {
            stopPropagation: function () {
            }
        };
        createController();
        var isPostponed = scope.isStatusPostponed('CANCELLED');
        expect(isPostponed).toBeFalsy();
    });

    it("isStatusCancelled should return true if status is cancelled", function () {
        scope.filterParams = {
            providers: [],
            locations: {"OT 1": true, "OT 2": true, "OT 3": true},
            statusList: []
        };
        var event = {
            stopPropagation: function () {
            }
        };
        createController();
        var isCancelled = scope.isStatusCancelled('CANCELLED');
        expect(isCancelled).toBeTruthy();
    });

    it("isStatusCancelled should return false if status is not cancelled", function () {
        scope.filterParams = {
            providers: [],
            locations: {"OT 1": true, "OT 2": true, "OT 3": true},
            statusList: []
        };
        var event = {
            stopPropagation: function () {
            }
        };
        createController();
        var isCancelled = scope.isStatusCancelled('SCHEDULED');
        expect(isCancelled).toBeFalsy();
    });

    it("should have bed location and bed id in table info", function () {
        scope.filterParams = {
            providers: [],
            locations: {"OT 1": true, "OT 2": true, "OT 3": true},
            statusList: []
        };
        var event = {
            stopPropagation: function () {
            }
        };
        rootScope.attributeTypes = defaultAttributeTypes;
        createController();
        expect(scope.tableInfo.length).toBe(21);
        expect(scope.tableInfo[19].heading).toBe("Bed Location");
        expect(scope.tableInfo[19].sortInfo).toBe("bedLocation");
        expect(scope.tableInfo[20].heading).toBe("Bed ID");
        expect(scope.tableInfo[20].sortInfo).toBe("bedNumber");
    });

    it('should have all the surgical attributes in table info', function () {
        scope.filterParams = {
            providers: [],
            locations: {"OT 1": true, "OT 2": true, "OT 3": true},
            statusList: []
        };
        rootScope.attributeTypes = defaultAttributeTypes;
        createController();
        expect(scope.tableInfo.length).toBe(21);
        expect(scope.tableInfo[11].heading).toBe('procedure');
        expect(scope.tableInfo[11].sortInfo).toBe('surgicalAppointmentAttributes.procedure.value');
        expect(scope.tableInfo[12].heading).toBe('otherSurgeon');
        expect(scope.tableInfo[12].sortInfo).toBe('surgicalAppointmentAttributes.otherSurgeon.value.person.display');
        expect(scope.tableInfo[13].heading).toBe('surgicalAssistant');
        expect(scope.tableInfo[13].sortInfo).toBe('surgicalAppointmentAttributes.surgicalAssistant.value');
        expect(scope.tableInfo[14].heading).toBe('anaesthetist');
        expect(scope.tableInfo[14].sortInfo).toBe('surgicalAppointmentAttributes.anaesthetist.value');
        expect(scope.tableInfo[15].heading).toBe('scrubNurse');
        expect(scope.tableInfo[15].sortInfo).toBe('surgicalAppointmentAttributes.scrubNurse.value');
        expect(scope.tableInfo[16].heading).toBe('circulatingNurse');
        expect(scope.tableInfo[16].sortInfo).toBe('surgicalAppointmentAttributes.circulatingNurse.value');
        expect(scope.tableInfo[17].heading).toBe('notes');
        expect(scope.tableInfo[17].sortInfo).toBe('surgicalAppointmentAttributes.notes.value');
    })

    it('should have primaryDiagnosisInfo attributes in table info', function () {
        scope.filterParams = {
            providers: [],
            locations: {"OT 1": true, "OT 2": true, "OT 3": true},
            statusList: []
        };
        rootScope.attributeTypes = defaultAttributeTypes;
        rootScope.showPrimaryDiagnosisForOT = true;
        createController();
        console.log(scope.tableInfo)
        expect(scope.tableInfo.length).toBe(22);
        expect(scope.tableInfo[21].heading).toBe('Primary Diagnoses');
        expect(scope.tableInfo[21].sortInfo).toBe('patientObservations');
        })
});
