'use strict';

describe('treatmentConfig', function() {

    beforeEach(module('bahmni.clinical'));
    beforeEach(module('bahmni.common.appFramework'));

    beforeEach(module(function ($provide) {
        var treatmentService = jasmine.createSpyObj('treatmentService', ['getConfig']);
        var config = specUtil.respondWith({data: {}});
        treatmentService.getConfig.and.returnValue(config);
        $provide.value('TreatmentService', treatmentService);
    }));

    beforeEach(inject(['treatmentConfig', function (treatmentConfig) {
        this.treatmentConfig = treatmentConfig;
    }]));

    it('should initialize duration units', function(done) {
        this.treatmentConfig.then(function(data){
            expect(data.durationUnits).toEqual([
                {name: "Day(s)", factor: 1},
                {name: "Week(s)", factor: 7},
                {name: "Month(s)", factor: 30}
            ]);
            done();
        });
    });

});