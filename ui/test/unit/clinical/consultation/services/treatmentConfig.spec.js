'use strict';

describe('treatmentConfig', function() {

    beforeEach(module('bahmni.clinical'));
    beforeEach(module('bahmni.common.appFramework'));

    beforeEach(module(function ($provide) {

        var medicationConfig = {
            "conceptNameForDefaultDrugs": "All TB Drugs",
            "inputOptionsConfig": {
                "All TB Drugs": {
                    "doseUnits": ["mg"],
                    "frequency" :["Seven days a week"],
                    "route" : ["Oral"]
                },
                "default": {
                    "doseUnits": ["Tablet(s)", "mg"],
                    "frequency" :["Seven days a week"],
                    "route" : ["Oral"]
                }
            }
        };

        var drugOrderConfig = {
            "doseUnits": [{"name": "mg"}, {"name": "Tablet(s)"}],
            "routes": [{"name": "Oral"}, {"name": "Inhalation"}],
            "durationUnits": [{"name": "Day(s)"}, {"name": "Minute(s)"}],
            "dosingInstructions": [{"name": "Before meals"}, {"name": "As directed"}],
            "dispensingUnits": [{"name": "Tablet(s)"}, {"name": "Unit(s)"}],
            "frequencies": [
                { "uuid": "ca407cb0-3a91-11e5-b380-0050568236ae", "frequencyPerDay": 1, "name": "Seven days a week"},
                { "uuid": "18a35ec5-3a92-11e5-b380-0050568236ae", "frequencyPerDay": 0.857142857, "name": "Six days a week"}
            ]
        };

        var treatmentService = jasmine.createSpyObj('treatmentService', ['getConfig', 'getNonCodedDrugConcept']);
        var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        var config = specUtil.respondWith({data: drugOrderConfig});
        treatmentService.getConfig.and.returnValue(config);
        treatmentService.getNonCodedDrugConcept.and.returnValue(specUtil.respondWith(""));
        var appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigForPage']);
        appDescriptor.getConfigForPage.and.returnValue(medicationConfig);
        appService.getAppDescriptor.and.returnValue(appDescriptor);
        spinner.forPromise.and.returnValue("drug-oncept-uuid");
        var drugService = jasmine.createSpyObj('drugService', ['getSetMembersOfConcept']);
        drugService.getSetMembersOfConcept.and.returnValue(specUtil.respondWith([{name: "K"}, {name: "T"}]));

        $provide.value('TreatmentService', treatmentService);
        $provide.value('appService', appService);
        $provide.value('spinner', spinner);
        $provide.value('DrugService', drugService);
        $provide.value('$q', Q);
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

    it('should initialize dosage units', function(done) {
        this.treatmentConfig.then(function(config){
            var doseUnits = config.getDoseUnits({'name': 'K'})
            expect(doseUnits.length).toEqual(1);
            expect(doseUnits).toContain({"name": "mg"});
            done();
        });
    });

    it('should retrieve dose Units for a specific concept name', function(done) {
        this.treatmentConfig.then(function(config){
            var doseUnits = config.getDoseUnits({name: 'K'});
            expect(doseUnits.length).toEqual(1);
            expect(doseUnits).toContain({"name": "mg"});

            doseUnits = config.getDoseUnits({name: 'Not Present in list of drugs'});
            expect(doseUnits.length).toEqual(2);
            expect(doseUnits).toContain({"name": "mg"});
            expect(doseUnits).toContain({"name": "Tablet(s)"});
            done();
        });
    });
});