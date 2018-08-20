'use strict';

describe('RoomController', function () {

    var controller;
    var rootScope, translate;
    var scope;
    var messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
    var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    appService.getAppDescriptor.and.returnValue({
        getConfigValue: function (value) {
            return [{"tagName":"Lost","color":"#E1FF00"},{"tagName":"Isolation","color":"#00FBFF"},{"tagName":"Strict Isolation","color":"#4D00FF"}];
        }
    });
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
        },{
            "empty": false,
            "available": false,
            "bed": {"bedId": 9, "bedNumber": "404-i", "bedType": "normal bed", "bedTags": [], "status": "OCCUPIED"}
        }, {
            "empty": false,
            "available": false,
            "bed": {"bedId": 10, "bedNumber": "404-i", "bedType": "normal bed", "bedTags": [], "status": "OCCUPIED"}
        }]],
        "totalBeds": 9,
        "availableBeds": 1
    };

    var translatedMessages = {
            "KEY_AVAILABLE": "Available",
            "KEY_OCCUPIED": "Occupied"
            };


    var initController = function (rootScope, state) {
        controller('RoomController', {
            $scope: scope,
            $rootScope: rootScope,
            $state: state,
            messagingService: messagingService,
            appService: appService,
            $translate: translate

        });
    };

    beforeEach(function () {
        module('bahmni.ipd');
        inject(function ($controller, $rootScope) {
            controller = $controller;
            rootScope = $rootScope;
            scope = $rootScope.$new();
            rootScope.selectedBedInfo ={};
            spyOn(scope, '$emit');
            scope.room = room;
            scope.currentView = "Grid";
        });
        translate = jasmine.createSpyObj('$translate', ['instant']);
        translate.instant.and.callFake(function (key) {
            return translatedMessages[key];
        });
    });

    it('should initialize bed info based on Admitted Patient Details ', function () {
        rootScope.bedDetails = { bedId: 10, bedNumber: "404-i", physicalLocationName: "room1" };
        var expectedBed = {
            bedId: 10,
            bedNumber: "404-i",
            bedType: "normal bed",
            bedTags: [],
            status: "OCCUPIED"
        };
        state.current = {name: "bedManagement.bed"};
        initController(rootScope, state);
        expect(scope.selectedBed).toEqual(expectedBed);
        expect(scope.oldBedNumber).toBeUndefined();
        expect(rootScope.selectedBedInfo.bed).toEqual(expectedBed);
    });

    it('should initialize current view with grid as a default view', function() {
        state.current = {name: "bedManagement.bed"};
        initController(rootScope, state);
        scope.toggleWardView();
        expect(scope.currentView).toEqual("List");
    });
});
