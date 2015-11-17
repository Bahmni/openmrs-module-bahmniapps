'use strict';

describe('treatmentConfig', function() {

    beforeEach(module('bahmni.clinical'));
    beforeEach(module('bahmni.common.appFramework'));

    beforeEach(module(function ($provide) {
        var treatmentService = jasmine.createSpyObj('treatmentService', ['getConfig', 'getNonCodedDrugConcept']);
        var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        var config = specUtil.respondWith({data: {}});
        treatmentService.getConfig.and.returnValue(config);
        treatmentService.getNonCodedDrugConcept.and.returnValue(specUtil.respondWith(""));
        spinner.forPromise.and.returnValue("drug-oncept-uuid");

        $provide.value('TreatmentService', treatmentService);
        $provide.value('spinner', spinner);
    }));

    beforeEach(inject(['treatmentConfig', function (treatmentConfig) {
        this.treatmentConfig = treatmentConfig;
    }]));

    it('should initialize duration units', function() {
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