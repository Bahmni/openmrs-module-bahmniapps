'use strict';

describe('ErrorLogController', function () {


    var $aController;
    var scopeMock, rootScopeMock, _spinner, $q, offlineDbServiceMock, androidDbServiceMock, offlineService;
    beforeEach(module('bahmni.home'));
    beforeEach(module('bahmni.common.offline'));

    beforeEach(module(function () {
        _spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        offlineService = jasmine.createSpyObj('offlineService', ['isOfflineApp', 'isAndroidApp']);
        offlineService.isOfflineApp.and.returnValue(true);
        offlineDbServiceMock = jasmine.createSpyObj('offlineDbService', ['getAllLogs']);
        androidDbServiceMock = jasmine.createSpyObj('androidDbService', ['getAllLogs']);
    }));
    beforeEach(
        inject(function ($controller, $rootScope) {
            $aController = $controller;
            rootScopeMock = $rootScope;
            $q = Q;
            scopeMock = rootScopeMock.$new();
        })

    );

    var errorLogs = [
        {
            failedRequestUrl: '/home/index.html',
            stackTrace: '{ "errorMessage": "TypeError: Cannot read property results of undefined", "stackTrace": "something" }'
        },
        {
            failedRequestUrl: '/home/index.html',
            stackTrace: 'Session timeout'
        }
    ];

    describe('getAllLogs', function () {
        it('should get all error logs for chrome with parsed JSON', function () {
            offlineService.isAndroidApp.and.returnValue(false);

            offlineDbServiceMock.getAllLogs.and.returnValue(
                {
                    then: function (callback) {
                        return callback(errorLogs);
                    }
                }
            );
            $aController('ErrorLogController', {
                $scope: scopeMock,
                $rootScope: rootScopeMock,
                $q: $q,
                spinner: _spinner,
                offlineService: offlineService,
                offlineDbService: offlineDbServiceMock,
                androidDbService: androidDbServiceMock
            });

            expect(scopeMock.errorLogs.length).toBe(2);
            expect(scopeMock.errorLogs[0].stackTrace.errorMessage).toBe('TypeError: Cannot read property results of undefined');
            expect(scopeMock.errorLogs[1].stackTrace).toBe('Session timeout');

            expect(offlineDbServiceMock.getAllLogs).toHaveBeenCalled();
            expect(androidDbServiceMock.getAllLogs).not.toHaveBeenCalled();

        });

        it('should get all error logs for Android with parsed JSON', function () {
            offlineService.isAndroidApp.and.returnValue(true);
            androidDbServiceMock.getAllLogs.and.returnValue(
                {
                    then: function (callback) {
                        return callback(errorLogs);
                    }
                }
            );

            $aController('ErrorLogController', {
                $scope: scopeMock,
                $rootScope: rootScopeMock,
                $q: $q,
                spinner: _spinner,
                offlineService: offlineService,
                offlineDbService: offlineDbServiceMock,
                androidDbService: androidDbServiceMock
            });

            expect(scopeMock.errorLogs.length).toBe(2);
            expect(scopeMock.errorLogs[0].stackTrace.errorMessage).toBe('TypeError: Cannot read property results of undefined');
            expect(scopeMock.errorLogs[1].stackTrace).toBe('Session timeout');
            expect(androidDbServiceMock.getAllLogs).toHaveBeenCalled();
            expect(offlineDbServiceMock.getAllLogs).not.toHaveBeenCalled();

        })
    })

});