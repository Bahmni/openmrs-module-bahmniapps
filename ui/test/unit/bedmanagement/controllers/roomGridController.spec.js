'use strict';

describe('RoomGridController', function () {

    var controller;
    var rootScope;
    var scope;
    var messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
    var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    appService.getAppDescriptor.and.returnValue({
        getConfigValue: function (value) {
            return [{"tagName":"Lost","color":"#E1FF00"},{"tagName":"Isolation","color":"#00FBFF"},{"tagName":"Strict Isolation","color":"#4D00FF"}];
        }
    });
    var translate = jasmine.createSpyObj('$translate', ['instant']);
    var state = jasmine.createSpyObj('$state',['go']);
    var room = {
        "name": "ROOM1",
        "beds": [
            [{
                "empty": false,
                "available": false,
                "bed": {"bedId": 1, "bedNumber": "404-a", "bedType": "normal bed", "bedTags": ["Sourav"], "status": "OCCUPIED"}
            }, {
                "empty": false,
                "available": false,
                "bed": {"bedId": 2, "bedNumber": "404-b", "bedType": "deluxe bed", "bedTags": [], "status": "OCCUPIED"}
            }, {
                "empty": false,
                "available": false,
                "bed": {"bedId": 3, "bedNumber": "404-c", "bedType": "normal bed", "bedTags": [], "status": "OCCUPIED"}
            }, {
                "empty": false,
                "available": false,
                "bed": {"bedId": 4, "bedNumber": "404-d", "bedType": "normal bed", "bedTags": [], "status": "OCCUPIED"}
            }], [{
                "empty": false,
                "available": false,
                "bed": {"bedId": 5, "bedNumber": "404-e", "bedType": "deluxe bed", "bedTags": [], "status": "OCCUPIED"}
            }, {
                "empty": false,
                "available": false,
                "bed": {"bedId": 6, "bedNumber": "404-f", "bedType": "deluxe bed", "bedTags": [], "status": "OCCUPIED"}
            }, {
                "empty": false,
                "available": false,
                "bed": {"bedId": 7, "bedNumber": "404-g", "bedType": "normal bed", "bedTags": [], "status": "OCCUPIED"}
            }, {
                "empty": false,
                "available": true,
                "bed": {"bedId": 8, "bedNumber": "404-h", "bedType": "deluxe bed", "bedTags": [], "status": "AVAILABLE"}
            }], [{
                "empty": true,
                "available": false,
                "bed": {"bedId": false, "bedNumber": false, "bedType": false, "bedTags": false, "status": false}
            }, {
                "empty": true,
                "available": false,
                "bed": {"bedId": false, "bedNumber": false, "bedType": false, "bedTags": false, "status": false}
            }, {
                "empty": true,
                "available": false,
                "bed": {"bedId": false, "bedNumber": false, "bedType": false, "bedTags": false, "status": false}
            }, {
                "empty": false,
                "available": false,
                "bed": {"bedId": 9, "bedNumber": "404-i", "bedType": "normal bed", "bedTags": [], "status": "OCCUPIED"}
            }]],
        "totalBeds": 9,
        "availableBeds": 1
    };
    beforeEach(function () {
        module('bahmni.ipd');
    });

    var initController = function (rootScope, state) {
        controller('RoomGridController', {
            $scope: scope,
            $rootScope: rootScope,
            $state: state,
            $translate: translate,
            messagingService: messagingService,
            appService: appService,
            room: room
        });
    };

    beforeEach(function () {
        inject(function ($controller, $rootScope) {
            controller = $controller;
            rootScope = $rootScope;
            scope = $rootScope.$new();
            rootScope.selectedBedInfo ={};
            rootScope.bedDetails =
                {
                    bedId: 9,
                    bedNumber: "404-i",
                    physicalLocationName: "room1"
                };
            spyOn(scope, '$emit');
            scope.room = room;
            scope.currentView = "Grid";
        });
    });

    it('should assign selected bed info on rootScope, when selectedbed is not OCCUPIED and the state is bedManagement.patient', function () {
        var bed = {
            bedId: 9,
            bedNumber: "404-i",
            bedType: "normal bed",
            bedTags: [],
            status: "AVAILABLE"
        };
        state.current = {name: "bedManagement.patient"};
        initController(rootScope, state);
        scope.onSelectBed(bed);
        expect(rootScope.selectedBedInfo.bed).toEqual(bed);
    });

    it('Should reset patient on rootScope on selecting AVAILABLE bed and go to bedManagement.bed state', function () {
        var bed = {
            bedId: 9,
            bedNumber: "404-i",
            bedType: "normal bed",
            bedTags: [],
            status: "AVAILABLE"
        };
        rootScope.patient = {name: "patientName", uuid: "patientUuid"};
        state.current = {name: "bedManagement"};
        initController(rootScope, state);
        scope.onSelectBed(bed);
        expect(rootScope.patient).toBeUndefined();
        expect(rootScope.selectedBedInfo.bed).toEqual(bed);
        expect(state.go).toHaveBeenCalledWith("bedManagement.bed", jasmine.any(Object));
    });

    it('Should not reset patient on rootScope on selecting Occupied bed and go to bedManagement.bed state ', function () {
        var bed = {
            bedId: 9,
            bedNumber: "404-i",
            bedType: "normal bed",
            bedTags: [],
            status: "OCCUPIED"
        };
        rootScope.patient = {name: "patientName", uuid: "patientUuid"};
        state.current = {name: "bedManagement"};
        initController(rootScope, state);
        scope.onSelectBed(bed);
        expect(rootScope.patient).not.toBeUndefined();
        expect(rootScope.selectedBedInfo.bed).toEqual(bed);
        expect(state.go).toHaveBeenCalledWith("bedManagement.bed", jasmine.any(Object));
    });

    it("should get color for beds", function () {
        var bed = {
            bedId: 9,
            bedNumber: "404-i",
            bedType: "normal bed",
            bedTagMaps: [{bedTag: {id: 1, name: "Lost", uuid: "someUuid"}, uuid: "tagUuid"}],
            status: "OCCUPIED"
        };
        rootScope.patient = {name: "patientName", uuid: "patientUuid"};
        rootScope.bedTagsColorConfig =
        state.current = {name: "bedManagement"};
        initController(rootScope, state);
        scope.getColorForTheTag(bed);
        expect(translate.instant).toHaveBeenCalled();

    });
});