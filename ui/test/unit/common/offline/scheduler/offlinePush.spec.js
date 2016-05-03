'use strict';

describe('Offline Push Tests', function () {
    var offlinePush, offlineServiceMock, eventQueueMock, httpBackend, offlineDbServiceMock, androidDbService, $q=Q, eventQueue, errorQueue, event, eventQueueMock;


    beforeEach(function () {
        module('bahmni.common.offline');
        module(function ($provide) {
            var offlineServiceMock = jasmine.createSpyObj('offlineService', ['isOfflineApp','isAndroidApp']);
            eventQueueMock = jasmine.createSpyObj('eventQueue', ['consumeFromErrorQueue','consumeFromEventQueue','removeFromQueue','addToErrorQueue','releaseFromQueue']);
            var offlineDbServiceMock = jasmine.createSpyObj('offlineDbService', ['getPatientByUuid','getEncounterByEncounterUuid']);

            offlineServiceMock.isOfflineApp.and.returnValue(true);
            offlineServiceMock.isAndroidApp.and.returnValue(false);
            event = {
                "data": {
                    url: "someUrl",
                    patientUuid: "someUuid"
                },
                tube: "event_queue"
            };

            eventQueue = [event];
            errorQueue = [event];

            eventQueueMock.consumeFromEventQueue.and.returnValue($q.when(eventQueue.shift()));

            eventQueueMock.consumeFromErrorQueue.and.returnValue($q.when(errorQueue.shift()));

            eventQueueMock.removeFromQueue.and.returnValue($q.when(undefined));
            eventQueueMock.addToErrorQueue.and.returnValue($q.when(undefined));
            eventQueueMock.releaseFromQueue.and.returnValue($q.when(undefined));

            eventQueueMock.removeFromQueue = jasmine.createSpy('removeFromQueue').and.returnValue($q.when({}));
            var patient = {};
            offlineDbServiceMock.getPatientByUuid.and.returnValue($q.when(patient));
            offlineDbServiceMock.getEncounterByEncounterUuid.and.returnValue($q.when({}));
            $provide.value('offlineService', offlineServiceMock);
            $provide.value('eventQueue', eventQueueMock);
            $provide.value('offlineDbService', offlineDbServiceMock);
            $provide.value('androidDbService', androidDbService);
            $provide.value('$q', $q);
        });
    });

    beforeEach(inject(['offlinePush', '$httpBackend',function (_offlinePush_, _$httpBackend_) {
        offlinePush = _offlinePush_;
        httpBackend = _$httpBackend_;
    }]));

    it("should push data from event queue", function(done) {
        httpBackend.expectPOST("someUrl").respond(200, {});
        offlinePush().then(function(){
            expect(eventQueueMock.removeFromQueue).toHaveBeenCalled();
            expect(eventQueueMock.consumeFromEventQueue).toHaveBeenCalled();
        });
        setTimeout(function(){
            httpBackend.flush();
            done();
        }, 1000);
    });


    it("should push data from error queue", function(done) {
        httpBackend.expectPOST("someUrl").respond(200, {});
        event.tube = "error_queue";
        offlinePush().then(function(){
            expect(eventQueueMock.removeFromQueue).toHaveBeenCalled();
            expect(eventQueueMock.consumeFromErrorQueue).toHaveBeenCalled();
        });
        setTimeout(function(){
            httpBackend.flush();
            done();
        }, 1000);
    });

    it("should add to error queue if push response is 500", function(done) {
        errorQueue = [];
        httpBackend.expectPOST("someUrl").respond(500, {});
        offlinePush().then(function(){
            expect(eventQueueMock.removeFromQueue).toHaveBeenCalled();
            expect(eventQueueMock.addToErrorQueue).toHaveBeenCalled();
            expect(eventQueueMock.consumeFromEventQueue).toHaveBeenCalled();
        });
        setTimeout(function(){
            httpBackend.flush();
            done();
        }, 1000);
    });

    it("should halt queue processing if push response is 400", function(done) {
        httpBackend.expectPOST("someUrl").respond(400, {});
        offlinePush().then(function(){
            expect(eventQueueMock.removeFromQueue).not.toHaveBeenCalled();
            expect(eventQueueMock.addToErrorQueue).not.toHaveBeenCalled();
            expect(eventQueueMock.consumeFromEventQueue).not.toHaveBeenCalled();
            expect(eventQueueMock.releaseFromQueue).toHaveBeenCalled();
        });
        setTimeout(function(){
            httpBackend.flush();
            done();
        }, 1000);
    });

    it("should push encounter data from event queue", function(done) {
        event.type = "encounter";
        httpBackend.expectPOST("someUrl").respond(200, {});
        offlinePush().then(function(){
            expect(eventQueueMock.removeFromQueue).toHaveBeenCalled();
            expect(eventQueueMock.consumeFromEventQueue).toHaveBeenCalled();
        });
        setTimeout(function(){
            httpBackend.flush();
            done();
        }, 1000);
    });
});