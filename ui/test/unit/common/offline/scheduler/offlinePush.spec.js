'use strict';

describe('Offline Push Tests', function () {
    var offlinePush, window, eventQueueMock, httpBackend, androidDbService, $q=Q, eventQueue, errorQueue, event, offlineDbServiceMock, loggingServiceMock, mockBahmniCookieStore, databaseNamePromise;


    beforeEach(function () {
        module('bahmni.common.offline');
        module(function ($provide) {
            var offlineServiceMock = jasmine.createSpyObj('offlineService', ['isOfflineApp','isAndroidApp']);
            eventQueueMock = jasmine.createSpyObj('eventQueue', ['consumeFromErrorQueue','consumeFromEventQueue','removeFromQueue','addToErrorQueue','releaseFromQueue']);
            offlineDbServiceMock = jasmine.createSpyObj('offlineDbService', ['getPatientByUuidForPost','getEncounterByEncounterUuid','insertLog', 'createEncounter','deleteErrorFromErrorLog','getErrorLogByUuid', 'initSchema','init']);
            loggingServiceMock = jasmine.createSpyObj('loggingService', ['logSyncError']);
            mockBahmniCookieStore = jasmine.createSpyObj('bahmniCookieStore', ["get"]);
            $provide.value('$bahmniCookieStore', mockBahmniCookieStore);
            window = jasmine.createSpyObj('$window',['indexedDB']);

            offlineDbServiceMock.initSchema.and.callFake(function (dbName) {
                return specUtil.simplePromise(
                  {
                      getSchema: function() {
                          return {
                              name: function () {
                                  return dbName;
                              }
                          };
                      }
                  });
            });

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
            $provide.value('$window', window);
        });
    });

    beforeEach(inject(['offlinePush', '$httpBackend',function (_offlinePush_, _$httpBackend_) {
        offlinePush = _offlinePush_;
        httpBackend = _$httpBackend_;
    }]));

    describe("push events when single db is present", function () {
        beforeEach(function() {
            window.indexedDB = {
                webkitGetDatabaseNames: function() {
                    databaseNamePromise = {};
                    setTimeout(function() {
                        databaseNamePromise.onsuccess({target: {result : ['dbOne']}});
                    }, 10);
                    return databaseNamePromise;
                }
            };
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
        var eventOne, eventTwo, errorEvent, _eventQueue, _errorQueue;

        beforeEach(function() {
            eventOne = {
                "data": {
                    url: "someUrl",
                    patientUuid: "someUuid",
                    dbName: "dbOne"
                },
                tube: "event_queue"
            };
            eventTwo = {
                "data": {
                    url: "someUrl",
                    patientUuid: "someUuid",
                    dbName: "dbTwo"
                },
                tube: "event_queue"
            };
            errorEvent = {
                "data": {
                    url: "someUrl",
                    patientUuid: "someUuid",
                    dbName: "dbTwo"
                },
                tube: "error_queue"
            };
            _eventQueue = [eventTwo, eventOne];
            _errorQueue = [errorEvent];

            window.indexedDB = {
                webkitGetDatabaseNames: function() {
                    databaseNamePromise = {};
                    setTimeout(function() {
                        databaseNamePromise.onsuccess({target: {result : ["dbOne", "dbTwo"]}});
                    }, 10);
                    return databaseNamePromise;
                }
            };

            eventQueueMock.consumeFromEventQueue = function() {
              return $q.when(_eventQueue.shift());
            };
            eventQueueMock.consumeFromErrorQueue = function() {
                return $q.when(_errorQueue.shift());
            }
        });

        afterEach(function (done) {
            setTimeout(function () {
                done()
            }, 50);
        });

        it("should push the events generated across multiple location", function(done) {
            httpBackend.expectPOST("someUrl").respond(200, {});
            offlinePush().then(function(){
                expect(eventQueueMock.removeFromQueue).toHaveBeenCalled();
                expect(offlineDbServiceMock.initSchema).toHaveBeenCalledWith("dbOne");
                expect(eventQueueMock.releaseFromQueue).toHaveBeenCalledWith(errorEvent);
                done();
            });
            setTimeout(function(){
                httpBackend.flush();
            }, 100);
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