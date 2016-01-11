'use strict';

var $scope, _eventLogService, _$q;

describe('Offline - DashboardController', function () {

    beforeEach(module('bahmni.offline'));

    beforeEach(
        inject(function ($controller, $rootScope, $q, eventLogService) {
            _$q = $q;
            $scope = $rootScope.$new();


            _eventLogService = eventLogService;
            $controller('DashboardController', {
                $scope: $scope,
                eventLogService: eventLogService
            });
        })
    );

    describe('sync', function () {
        it('should get all events by catchment number and save', function () {
            var promiseForGetEvents = _$q.defer();
            spyOn(_eventLogService, 'getEventsFor').and.returnValue(promiseForGetEvents.promise);
            promiseForGetEvents.resolve([{object: 'url to get patient object', category: 'patient'}]);

            var promiseForGetpatient = _$q.defer();
            spyOn(_eventLogService, 'getDataForUrl').and.returnValue(promiseForGetpatient.promise);
            promiseForGetpatient.resolve({uuid: 'patient uuid'});

            $scope.catchmentNumber = 111;
            $scope.sync();
            $scope.$apply();

            expect(_eventLogService.getEventsFor).toHaveBeenCalledWith($scope.catchmentNumber);
            expect(_eventLogService.getEventsFor.calls.count()).toBe(1);
            expect(_eventLogService.getDataForUrl).toHaveBeenCalledWith('url to get patient object');
            expect(_eventLogService.getDataForUrl.calls.count()).toBe(1);
        })

        it('should not make a call to get event data if there are no events exists', function () {
            var promiseForGetEvents = _$q.defer();
            spyOn(_eventLogService, 'getEventsFor').and.returnValue(promiseForGetEvents.promise);
            promiseForGetEvents.resolve([]);

            var promiseForGetpatient = _$q.defer();
            spyOn(_eventLogService, 'getDataForUrl').and.returnValue(promiseForGetpatient.promise);
            promiseForGetpatient.resolve({});

            $scope.catchmentNumber = 111;
            $scope.sync();
            $scope.$apply();

            expect(_eventLogService.getEventsFor).toHaveBeenCalledWith($scope.catchmentNumber);
            expect(_eventLogService.getEventsFor.calls.count()).toBe(1);
            expect(_eventLogService.getDataForUrl.calls.count()).toBe(0);
        })
    })

});