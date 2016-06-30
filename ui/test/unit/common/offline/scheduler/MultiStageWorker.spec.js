'use strict';

describe('MultiStageWorker', function () {

    it("should execute multiple stages", function(done) {
        var stage1 = jasmine.createSpyObj("stage1", ["execute", "pause"]);
        var stage2 = jasmine.createSpyObj("stage2", ["execute", "pause"]);

        stage1.execute.and.returnValue(Q.when({}));
        stage2.execute.and.returnValue(Q.when({}));

        var worker = new Bahmni.Common.Offline.MultiStageWorker(Q);

        worker.addStage(stage1);
        worker.addStage(stage2);

        worker.execute().then(function() {
            expect(stage1.execute).toHaveBeenCalled();
            expect(stage2.execute).toHaveBeenCalled();
            done();
        });
    });

    it("should be able to pause", function(done) {
        var stage1 = jasmine.createSpyObj("stage1", ["execute", "pause"]);
        var stage2 = jasmine.createSpyObj("stage2", ["execute"]);
        stage1.execute.and.returnValue(Q.when({}));
        stage2.execute.and.returnValue(Q.when({}));

        var worker = new Bahmni.Common.Offline.MultiStageWorker(Q);
        worker.addStage(stage1);
        worker.addStage(stage2);

        worker.execute().catch(function() {
            expect(stage2.execute).not.toHaveBeenCalled();
            done();
        });

        worker.pause();
    });

    it("should be able to resume", function(done) {
        var stage1 = jasmine.createSpyObj("stage1", ["execute", "pause"]);
        var stage2 = jasmine.createSpyObj("stage2", ["execute", "pause"]);
        var stage3 = jasmine.createSpyObj("stage3", ["execute", "pause"]);

        stage1.execute.and.returnValue(Q.when({}));
        stage2.execute.and.returnValue(Q.when({}));
        stage3.execute.and.returnValue(Q.when({}));

        var worker = new Bahmni.Common.Offline.MultiStageWorker(Q);
        worker.addStage(stage1);
        worker.addStage(stage2);
        worker.addStage(stage3);

        worker.currentlyExecutingStage = stage2;

        worker.execute().then(function() {
            expect(stage1.execute).not.toHaveBeenCalled();
            expect(stage2.execute).toHaveBeenCalled();
            expect(stage3.execute).toHaveBeenCalled();
            done();
        });
    });
});