'use strict';

describe('Offline Push Tests', function () {
    var offlinePush, eventQueueMock, httpBackend, androidDbService, $q=Q, eventQueue, errorQueue, event, offlineDbServiceMock;


    beforeEach(function () {
        module('bahmni.common.offline');
        module(function ($provide) {
            var offlineServiceMock = jasmine.createSpyObj('offlineService', ['isOfflineApp','isAndroidApp']);
            eventQueueMock = jasmine.createSpyObj('eventQueue', ['consumeFromErrorQueue','consumeFromEventQueue','removeFromQueue','addToErrorQueue','releaseFromQueue']);
            offlineDbServiceMock = jasmine.createSpyObj('offlineDbService', ['getPatientByUuid','getEncounterByEncounterUuid', 'createEncounter']);

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
            offlineDbServiceMock.createEncounter.and.returnValue($q.when({}));
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
            done();

        });
        setTimeout(function(){
            httpBackend.flush();
        }, 1000);
    });


    it("should push data from error queue", function(done) {
        httpBackend.expectPOST("someUrl").respond(200, {});
        event.tube = "error_queue";
        offlinePush().then(function(){
            expect(eventQueueMock.removeFromQueue).toHaveBeenCalled();
            expect(eventQueueMock.consumeFromErrorQueue).toHaveBeenCalled();
            done();
        });
        setTimeout(function(){
            httpBackend.flush();
        },1000);
    });

    it("should add to error queue if push response is 500", function(done) {
        errorQueue = [];
        httpBackend.expectPOST("someUrl").respond(500, {});
        offlinePush().then(function(){
            expect(eventQueueMock.removeFromQueue).toHaveBeenCalled();
            expect(eventQueueMock.addToErrorQueue).toHaveBeenCalled();
            expect(eventQueueMock.consumeFromEventQueue).toHaveBeenCalled();
            done();
        });
        setTimeout(function(){
            httpBackend.flush();
        }, 1000);
    });

    it("should halt queue processing if push response is 400", function(done) {
        httpBackend.expectPOST("someUrl").respond(400, {});
        offlinePush().then(function(){
            expect(eventQueueMock.removeFromQueue).not.toHaveBeenCalled();
            expect(eventQueueMock.addToErrorQueue).not.toHaveBeenCalled();
            expect(eventQueueMock.consumeFromEventQueue).not.toHaveBeenCalled();
            expect(eventQueueMock.releaseFromQueue).toHaveBeenCalled();
            done();
        });
        setTimeout(function(){
            httpBackend.flush();
        }, 1000);
    });

    it("should push encounter data from event queue", function(done) {
        event.data = {type : "encounter"};
        httpBackend.expectPOST(Bahmni.Common.Constants.bahmniEncounterUrl).respond(200, {});
        offlinePush().then(function(){
            expect(offlineDbServiceMock.createEncounter).toHaveBeenCalled();
            expect(eventQueueMock.removeFromQueue).toHaveBeenCalled();
            expect(eventQueueMock.consumeFromEventQueue).toHaveBeenCalled();
            done();
        });
        setTimeout(function(){
            httpBackend.flush();
        }, 1000);
    });
});