'use strict';

describe('Offline Push Tests', function () {
    var offlinePush, eventQueueMock, httpBackend, androidDbService, $q=Q, eventQueue, errorQueue, event, offlineDbServiceMock, loggingServiceMock, mockBahmniCookieStore, databaseNamePromise;

    beforeEach(function () {
        module('bahmni.common.offline');
        module(function ($provide) {
            var offlineServiceMock = jasmine.createSpyObj('offlineService', ['isOfflineApp','isAndroidApp']);
            eventQueueMock = jasmine.createSpyObj('eventQueue', ['consumeFromErrorQueue','consumeFromEventQueue','removeFromQueue','addToErrorQueue','releaseFromQueue']);
            offlineDbServiceMock = jasmine.createSpyObj('offlineDbService', ['getPatientByUuidForPost','getEncounterByEncounterUuid',
                'insertLog', 'createEncounter','deleteErrorFromErrorLog','getErrorLogByUuid',
                'initSchema','init','getDbNames', 'getCurrentDbName']);
            loggingServiceMock = jasmine.createSpyObj('loggingService', ['logSyncError']);
            mockBahmniCookieStore = jasmine.createSpyObj('bahmniCookieStore', ["get"]);
            $provide.value('$bahmniCookieStore', mockBahmniCookieStore);


            offlineDbServiceMock.initSchema.and.returnValue(specUtil.createFakePromise());

            mockBahmniCookieStore.get.and.callFake(function (cookie) {
                if (cookie == Bahmni.Common.Constants.locationCookieName) {
                    return {name: "dbOne"};
                }
            });

            event = {
                "data": {
                    url: "someUrl",
                    patientUuid: "someUuid",
                    dbName: "dbOne"
                },
                tube: "event_queue"
            };
            eventQueue = [event];
            errorQueue = [event];

            eventQueueMock.consumeFromEventQueue.and.returnValue($q.when(eventQueue.shift()));
            eventQueueMock.consumeFromErrorQueue.and.returnValue($q.when(errorQueue.shift()));

            offlineServiceMock.isOfflineApp.and.returnValue(true);
            offlineServiceMock.isAndroidApp.and.returnValue(false);

            eventQueueMock.removeFromQueue.and.returnValue($q.when(undefined));
            eventQueueMock.addToErrorQueue.and.returnValue($q.when(undefined));
            eventQueueMock.releaseFromQueue.and.returnValue($q.when(undefined));

            eventQueueMock.removeFromQueue = jasmine.createSpy('removeFromQueue').and.returnValue($q.when({}));
            var patient = {};
            offlineDbServiceMock.getPatientByUuidForPost.and.returnValue($q.when(patient));
            offlineDbServiceMock.getEncounterByEncounterUuid.and.returnValue($q.when({}));
            offlineDbServiceMock.createEncounter.and.returnValue($q.when({}));
            offlineDbServiceMock.deleteErrorFromErrorLog.and.returnValue($q.when({}));
            offlineDbServiceMock.getErrorLogByUuid.and.returnValue($q.when({}));


            $provide.value('offlineService', offlineServiceMock);
            $provide.value('eventQueue', eventQueueMock);
            $provide.value('offlineDbService', offlineDbServiceMock);
            $provide.value('androidDbService', androidDbService);
            $provide.value('loggingService', loggingServiceMock);
            $provide.value('$q', $q);
        });
    });

    beforeEach(inject(['offlinePush', '$httpBackend',function (_offlinePush_, _$httpBackend_) {
        offlinePush = _offlinePush_;
        httpBackend = _$httpBackend_;
    }]));

    describe("push events when single db is present", function () {
        beforeEach(function() {
            offlineDbServiceMock.getDbNames.and.returnValue(["dbOne"]);
            offlineDbServiceMock.getCurrentDbName.and.returnValue(["dbOne"]);
        });

        it("should push data from event queue", function (done) {
            httpBackend.expectPOST("someUrl").respond(200, {});
            offlinePush().then(function () {
                expect(eventQueueMock.removeFromQueue).toHaveBeenCalled();
                expect(eventQueueMock.consumeFromEventQueue).toHaveBeenCalled();
                done();

            });
            setTimeout(function () {
                httpBackend.flush();
            }, 100);
        });


        it("should push data from error queue", function (done) {
            httpBackend.expectPOST("someUrl").respond(200, {});
            event.tube = "error_queue";
            offlinePush().then(function () {
                expect(eventQueueMock.removeFromQueue).toHaveBeenCalled();
                expect(eventQueueMock.consumeFromErrorQueue).toHaveBeenCalled();
                done();
            });
            setTimeout(function () {
                httpBackend.flush();
            }, 100);
        });

        it("should add to error queue if push response is 500", function (done) {
            errorQueue = [];
            httpBackend.expectPOST("someUrl").respond(500, {});
            offlinePush().then(function () {
                expect(eventQueueMock.removeFromQueue).toHaveBeenCalled();
                expect(eventQueueMock.addToErrorQueue).toHaveBeenCalled();
                expect(eventQueueMock.consumeFromEventQueue).toHaveBeenCalled();
                expect(loggingServiceMock.logSyncError).toHaveBeenCalled();
                expect(loggingServiceMock.logSyncError).toHaveBeenCalledWith("someUrl", 500, {}, {relationships: []});
                done();
            });
            setTimeout(function () {
                httpBackend.flush();
            }, 100);
        });

        it("should halt queue processing if push response is 400", function (done) {
            httpBackend.expectPOST("someUrl").respond(400, {});
            offlinePush().then(function () {
                expect(eventQueueMock.removeFromQueue).not.toHaveBeenCalled();
                expect(eventQueueMock.addToErrorQueue).not.toHaveBeenCalled();
                expect(eventQueueMock.consumeFromEventQueue).not.toHaveBeenCalled();
                expect(eventQueueMock.releaseFromQueue).toHaveBeenCalled();
                expect(loggingServiceMock.logSyncError).toHaveBeenCalled();
                expect(loggingServiceMock.logSyncError).toHaveBeenCalledWith("someUrl", 400, {}, {relationships: []});
                done();
            });
            setTimeout(function () {
                httpBackend.flush();
            }, 100);
        });

        it("should push encounter data from event queue", function (done) {
            event.data = {type: "encounter", dbName: "dbOne"};
            httpBackend.expectPOST(Bahmni.Common.Constants.bahmniEncounterUrl).respond(200, {});
            offlinePush().then(function () {
                expect(offlineDbServiceMock.createEncounter).toHaveBeenCalled();
                expect(eventQueueMock.removeFromQueue).toHaveBeenCalled();
                expect(eventQueueMock.consumeFromEventQueue).toHaveBeenCalled();
                done();
            });
            setTimeout(function () {
                httpBackend.flush();
            }, 1000);
        });

        it("should push error log from event queue", function (done) {
            event.data = {type: "Error", uuid: "someUuid", dbName: "dbOne"};
            httpBackend.expectPOST(Bahmni.Common.Constants.loggingUrl).respond(201, {});
            offlinePush().then(function () {
                expect(eventQueueMock.removeFromQueue).toHaveBeenCalled();
                expect(eventQueueMock.consumeFromEventQueue).toHaveBeenCalled();
                expect(offlineDbServiceMock.getErrorLogByUuid).toHaveBeenCalledWith("someUuid");
                expect(offlineDbServiceMock.deleteErrorFromErrorLog).toHaveBeenCalledWith("someUuid");
                done();
            });
            setTimeout(function () {
                httpBackend.flush();
            }, 1000);
        });

        it("should not delete error if post fails", function (done) {
            event.data = {type: "Error", uuid: "someUuid", dbName: "dbOne"};
            httpBackend.expectPOST(Bahmni.Common.Constants.loggingUrl).respond(404, {});
            offlinePush().then(function () {

                expect(eventQueueMock.removeFromQueue).not.toHaveBeenCalled();
                expect(eventQueueMock.addToErrorQueue).not.toHaveBeenCalled();
                expect(eventQueueMock.consumeFromEventQueue).not.toHaveBeenCalled();
                expect(eventQueueMock.releaseFromQueue).toHaveBeenCalled();
                expect(offlineDbServiceMock.getErrorLogByUuid).toHaveBeenCalledWith("someUuid");
                expect(offlineDbServiceMock.deleteErrorFromErrorLog).not.toHaveBeenCalled();
                done();
            });
            setTimeout(function () {
                httpBackend.flush();
            }, 1000);
        });
    });

    describe("Push events from multiple database",function(){
        var eventOne, errorEvent, _eventQueue, _errorQueue;

        beforeEach(function() {
            eventOne = {
                "data": {
                    url: "someUrl",
                    patientUuid: "someUuid",
                    dbName: "dbOne"
                },
                tube: "event_queue"
            };
            offlineDbServiceMock.getDbNames.and.returnValue(["dbOne","dbTwo"]);
            eventQueueMock.consumeFromEventQueue = function() {
              return $q.when(_eventQueue.shift());
            };
            eventQueueMock.consumeFromErrorQueue = function() {
                return $q.when(_errorQueue.shift());
            }
        });


        it("should process the  event if the event is in current database", function(done) {
            offlineDbServiceMock.getCurrentDbName.and.returnValue("dbOne");
            _errorQueue = [];
            _eventQueue = [eventOne];
            httpBackend.expectPOST("someUrl").respond(200, {});
            offlinePush().then(function(){
                expect(eventQueueMock.removeFromQueue).toHaveBeenCalled();
                done();
            });
            setTimeout(function(){
                httpBackend.flush();
            }, 100);
        });


        it("should reserve event if event is not in current database", function(done) {
            offlineDbServiceMock.getCurrentDbName.and.returnValue("dbTwo");
            _errorQueue = [];
            _eventQueue = [eventOne];
            offlinePush().then(function(){
                expect(eventQueueMock.releaseFromQueue).toHaveBeenCalledWith(eventOne);
                done();
            });
        });

        it("should initialise new db if queue does not have events and there are events in reserve queue", function(done) {
            var dbNames = ["dbTwo", "dbTwo", "dbOne"];
            offlineDbServiceMock.getCurrentDbName.and.returnValue(dbNames.shift());
            _errorQueue = [];
            _eventQueue = [eventOne];
            offlinePush().then(function(){
                expect(offlineDbServiceMock.initSchema).toHaveBeenCalledWith("dbOne");
                done();
            });
        });

        it("should return if there is no event in eventQueue and errorQueue", function(done) {
            _eventQueue = [];
            _errorQueue = [];
            offlinePush().then(function(){
                expect(eventQueueMock.removeFromQueue).not.toHaveBeenCalled();
                expect(offlineDbServiceMock.getPatientByUuidForPost).not.toHaveBeenCalled();
                done();
            });
        });
    });
});