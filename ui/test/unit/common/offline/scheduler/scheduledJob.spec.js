'use strict';

describe('scheduledJob', function () {
    var scheduledJobService;
    var interval;

    beforeEach(module('bahmni.common.offline'));

    beforeEach(inject(function (scheduledJob, $interval) {
        scheduledJobService = scheduledJob;
        interval = $interval;
    }));

    it("should schedule a job for given interval", function(done) {
        var workerObj = jasmine.createSpyObj('worker', ['execute']);
        var job = scheduledJobService.create({interval: 1, worker: workerObj});
        job.start();
        interval.flush(10);
        expect(workerObj.execute.calls.count()).toBe(10);
        done();
    });

    it("should stop a scheduled job", function(done) {
        var workerObj = jasmine.createSpyObj('worker', ['execute']);
        var job = scheduledJobService.create({interval: 1, worker: workerObj});
        job.start();
        interval.flush(10);
        expect(workerObj.execute.calls.count()).toBe(10);

        job.stop();
        interval.flush(10);
        expect(workerObj.execute.calls.count()).toBe(10);

        job.start();
        interval.flush(15);
        expect(workerObj.execute.calls.count()).toBe(25);

        done();
    });

    it("should pause a scheduled job", function(done) {
        var workerObj = jasmine.createSpyObj('worker', ['execute', 'pause']);
        var job = scheduledJobService.create({interval: 1, worker: workerObj});
        job.start();
        interval.flush(10);
        expect(workerObj.execute.calls.count()).toBe(10);

        job.pause();
        interval.flush(10);
        expect(workerObj.execute.calls.count()).toBe(10);
        expect(workerObj.pause.calls.count()).toBe(1);

        done();
    })
});