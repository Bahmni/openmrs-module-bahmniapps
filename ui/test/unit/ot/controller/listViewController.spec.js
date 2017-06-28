'use strict';

describe('listViewController', function () {
    var scope, controller, q, spinner, state, rootScope;
    var locationService = jasmine.createSpyObj('locationService', ['getAllByTag']);
    spinner = jasmine.createSpyObj('spinner', ['forPromise', 'then', 'catch']);
    var surgicalAppointmentService = jasmine.createSpyObj('surgicalAppointmentService', ['getSurgicalBlocksInDateRange']);
    state = jasmine.createSpyObj('state', ['go']);
    var ngDialog = jasmine.createSpyObj('ngDialog', ['open']);
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
        controller('listViewController', {
            $scope: scope,
            $rootScope: rootScope,
            locationService: locationService,
            $q: q,
            spinner: spinner,
            surgicalAppointmentService: surgicalAppointmentService,
            $state: state,
            ngDialog: ngDialog
        });
        scope.$apply();
        rootScope.surgeons = [{
            "uuid": "batmanUuid",
            "person": {
                "display": "Bat Man"
            },
            "attributes": [
                {
                    "attributeType": {
                        "display": "otCalendarColor"
                    },
                    "value": "90"
                }
            ]
        },
            {
                "uuid": "spidermanUuid",
                "person": {
                    "display": "Spider Man"
                },
                "attributes": []
            }];
        rootScope.attributeTypes = [
            {
                "uuid": "613ed1d6-3c7c-11e7-ba26-0800274a5156",
                "name": "procedure"
            },
            {
                "uuid": "613efa61-3c7c-11e7-ba26-0800274a5156",
                "name": "estTimeHours"
            },
            {
                "uuid": "613f275a-3c7c-11e7-ba26-0800274a5156",
                "name": "estTimeMinutes"
            },
            {
                "uuid": "6141270b-3c7c-11e7-ba26-0800274a5156",
                "name": "cleaningTime"
            },
            {
                "uuid": "61415081-3c7c-11e7-ba26-0800274a5156",
                "name": "otherSurgeon"
            },
            {
                "uuid": "61416693-3c7c-11e7-ba26-0800274a5156",
                "name": "surgicalAssistant"
            },
            {
                "uuid": "6141780a-3c7c-11e7-ba26-0800274a5156",
                "name": "anaesthetist"
            },
            {
                "uuid": "6141881a-3c7c-11e7-ba26-0800274a5156",
                "name": "scrubNurse"
            },
            {
                "uuid": "6141968f-3c7c-11e7-ba26-0800274a5156",
                "name": "circulatingNurse"
            },
            {
                "uuid": "910f2c7f-4b73-11e7-81d5-0800274a5156",
                "name": "notes"
            }
        ];
    };



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
           "surgicalAppointments": [{
               "id": 105,
               "patient": {"uuid": "3ee5efbf-1267-43af-943d-d1ee8ced9285", "display": "EG100145M - Al Padas e"},
               "actualStartDatetime": null,
               "actualEndDatetime": null,
               "status": "POSTPONED",
               "notes": "psofdkjfsdfslfskfjsf",
               "sortWeight": null,
               "surgicalAppointmentAttributes": []
           }, {
               "id": 96,
               "patient": {
                   "uuid": "168eed46-dabe-4b7b-a0d6-a8e4ccc02510",
                   "display": "EG100104M - Al Padjhjvj hjhj hjjhhjhj"
               },
               "actualStartDatetime": null,
               "actualEndDatetime": null,
               "status": "POSTPONED",
               "notes": "postpone appointment",
               "sortWeight": null,
               "surgicalAppointmentAttributes": []
           }],
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
           "surgicalAppointments": [{
               "id": 104,
               "patient": {"uuid": "2300015f-95a3-4d47-933d-a81138ad0aa6", "display": "EG100137M - Al Pad Hassan"},
               "actualStartDatetime": null,
               "actualEndDatetime": null,
               "status": "SCHEDULED",
               "notes": null,
               "sortWeight": 0,
               "surgicalAppointmentAttributes": []
           }],
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
           "surgicalAppointments": [{
               "id": 107,
               "patient": {
                   "uuid": "2848a63a-b273-4d9d-8e10-1ad3e39ab1a6",
                   "display": "IQ100079F - XKHRQKVNNJKC UHNTLIXSNERE"
               },
               "actualStartDatetime": null,
               "actualEndDatetime": null,
               "status": "POSTPONED",
               "notes": "not ready",
               "sortWeight": 0,
               "surgicalAppointmentAttributes": []
           }, {
               "id": 106,
               "patient": {
                   "uuid": "9b41d661-df96-4815-aea1-ecc8278dd220",
                   "display": "IQ100072F - QXHTPLJYKLTF JVMSGICIQZVB"
               },
               "actualStartDatetime": "2017-06-22T09:15:00.000+0530",
               "actualEndDatetime": "2017-06-22T10:00:00.000+0530",
               "status": "COMPLETED",
               "notes": null,
               "sortWeight": 0,
               "surgicalAppointmentAttributes": []
           }, {
               "id": 108,
               "patient": {
                   "uuid": "0c58967c-a415-48c8-9830-adcaa94b9d4f",
                   "display": "IQ100074F - CUYCTOEPHJDP OCECDYHMGPSO"
               },
               "actualStartDatetime": null,
               "actualEndDatetime": null,
               "status": "CANCELLED",
               "notes": "Mistake",
               "sortWeight": null,
               "surgicalAppointmentAttributes": []
           }],
           "uuid": "c9bd5e83-62f7-4e03-a7b4-fd056c4dd67e"
       }];

    surgicalAppointmentService.getSurgicalBlocksInDateRange.and.callFake(function () {
        return {data: {results: results}};
    });


    it("should sort the appointments by start date and by the location and by start time", function () {
        scope.viewDate = moment('2017-02-22').toDate();
        scope.filterParams = {
            providers: [],
            locations: {"OT 1": true, "OT 2": true, "OT 3": true},
            patient: null,
            statusList: []
        };
        createController();
        expect(scope.surgicalAppointmentList.length).toEqual(6);
        expect(scope.surgicalAppointmentList[0].id).toEqual(104);
        expect(scope.surgicalAppointmentList[1].id).toEqual(105);
        expect(scope.surgicalAppointmentList[2].id).toEqual(96);
        expect(scope.surgicalAppointmentList[3].id).toEqual(107);
        expect(scope.surgicalAppointmentList[4].id).toEqual(106);
        expect(scope.surgicalAppointmentList[5].id).toEqual(108);
    });

    it("should set the derived attributes for appointments", function () {
        scope.filterParams = {
            providers: [],
            locations: {"OT 1": true, "OT 2": false, "OT 3": false},
            patient: {uuid: "2300015f-95a3-4d47-933d-a81138ad0aa6"},
            statusList: []
        };
        createController();
        expect(scope.surgicalAppointmentList.length).toEqual(1);
    });



});