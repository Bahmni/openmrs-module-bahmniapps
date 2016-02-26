'use strict';

describe('eventQueueWorker', function () {
    var _eventQueueWorker;
    var _eventQueue;
    var syncServiceMock;
    var _q;

    beforeEach(module('bahmni.common.offline'));

    beforeEach(module(function ($provide) {
        syncServiceMock = jasmine.createSpyObj('syncService', ['sync'])
        $provide.value('$q', Q);
        $provide.value('syncService', syncServiceMock);
    }));

    beforeEach(inject(function (eventQueueWorker, eventQueue) {
        _eventQueueWorker = eventQueueWorker;
        _eventQueue = eventQueue;
    }));

    it("should start syncing events", function(done) {
        var datasetup = function() {
            return Q.all([
                _eventQueue.addToEventQueue({uuid: 1}),
                _eventQueue.addToEventQueue({uuid: 2}),
                _eventQueue.addToEventQueue({uuid: 3}),
                _eventQueue.addToEventQueue({uuid: 4})
            ])
        };

        datasetup().then(function(events) {
            var callCount = -1;
            syncServiceMock.sync.and.callFake(function() {
                callCount++;
                return Q.when(events[callCount]);
            })
            _eventQueueWorker.execute().then(function() {
                expect(syncServiceMock.sync.calls.count()).toBe(4);
                _eventQueue.getCount().then(function(count) {
                    expect(count).toBe(0);
                    done();
                })
            });
        })
    });

    xit("should handle errors while syncing", function(done) {
        var datasetup = function() {
            console.log("Asdads");
            return Q.all([
                _eventQueue.addToEventQueue({uuid: 5}),
                _eventQueue.addToEventQueue({uuid: 6}),
            ])
        };

        datasetup().then(function(events) {
            var callCount = -1;
            syncServiceMock.sync.and.callFake(function() {
                callCount++;
                return Q.reject(events[callCount]);
            })
            _eventQueueWorker.execute().then(function() {
                expect(syncServiceMock.sync.calls.count()).toBe(2);
                return _eventQueue.getErrorCount().then(function(count) {
                    expect(count).toBe(2);
                })
            }).then(function() {
                return _eventQueue.getCount().then(function(count) {
                    expect(count).toBe(0);
                })
            }).then(done);
        })
    });

});