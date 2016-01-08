'use strict';

var $aController, eventLogService, $scope;

describe('Offline - DashboardController', function () {

    beforeEach(module('bahmni.offline'));

    beforeEach(
        inject(function ($controller, $rootScope) {
            $aController = $controller;
            $scope = $rootScope.$new();
        })
    );

    beforeEach(function () {
        eventLogService = jasmine.createSpyObj('eventLogService', ['getEventsFor']);


        $aController('DashboardController', {
            $scope: $scope,
            eventLogService: eventLogService
        });
    });

    describe('sync', function () {
        it('should sync data', function () {
            $scope.catchmentNumber = 111;
            $scope.sync();

            expect(eventLogService.getEventsFor).toHaveBeenCalledWith($scope.catchmentNumber);
        })
    })

});