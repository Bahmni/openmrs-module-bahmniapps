'use strict';

describe('eventQueue', function () {
    var eventQueueService;

    beforeEach(module('bahmni.common.offline'));

    beforeEach(module(function ($provide) {
        $provide.value('$q', Q);
    }));

    beforeEach(inject(['eventQueue', function (eventQueue) {
        eventQueueService = eventQueue;
    }]));

    it("should add events to queue", function(done) {
        eventQueueService.addToEventQueue({uuid: "1234"}).then(function(eventContent) {
            expect(eventContent).not.toBeNull();
            done();
        });
    });

    it("should consume from events queue", function(done) {
        eventQueueService.consumeFromEventQueue().then(function(eventContent) {
            expect(eventContent).not.toBeNull();
            done();
        });
    });

    it("should add to error queue", function(done) {
        eventQueueService.addToErrorQueue({uuid: "1234"}).then(function(eventContent) {
            expect(eventContent).not.toBeNull();
            done();
        });
    });

    it("should consume from error queue", function(done) {
        eventQueueService.consumeFromErrorQueue().then(function(eventContent) {
            expect(eventContent).not.toBeNull();
            done();
        });
    });
});