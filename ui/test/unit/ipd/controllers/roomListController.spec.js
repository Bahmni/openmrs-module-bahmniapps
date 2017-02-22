'use strict';

describe('RoomListController', function () {

    var controller;
    var rootScope;
    var scope = {};
    var queryService, appService;

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

        module(function ($provide) {
            appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            var appDescriptor = {
                getConfigValue: function (config) {
                  return {
                      attributes: ["Bed", "Name", "Id", "Name", "Age", "Gender", "Country", "Bed Tags", "ADT Notes"]
                  };
                }
            };
            appService.getAppDescriptor.and.returnValue(appDescriptor);

            $provide.value('appService', {});
            queryService = jasmine.createSpyObj('queryService', ['getResponseFromQuery']);
            queryService.getResponseFromQuery.and.returnValue(specUtil.createServicePromise('queryService'));
            $provide.value('queryService', queryService);
            $provide.value('room', room);
            $provide.value('$stateParams', {});
        });
    });

    beforeEach(function () {
        inject(function ($controller, $rootScope) {
            controller = $controller;
            rootScope = $rootScope;
            scope = $rootScope.$new();
            scope.room = room;
        });
    });

    var initController = function () {
        controller('RoomListController', {
            $scope: scope,
            QueryService: queryService,
            appService: appService
        });
    };

    it('Should set table details', function () {
        initController();
    });

});