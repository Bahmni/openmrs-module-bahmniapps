'use strict';

describe('treatmentConfig', function() {

    var treatmentConfig;
    var medicationConfig = {
        "commonConfig": {},
        "tabConfig": {
            "tbTab": {
                "inputOptionsConfig": {
                    "drugConceptSet": "All TB Drugs",
                    "isDropDown": true,
                    "doseUnits": ["mg"],
                    "frequency": ["Seven days a week"],
                    "route": ["Oral"],
                    "hiddenFields": ["additionalInstructions"]
                }
            },
            "nonTbTab": {
                "inputOptionsConfig": {
                    "drugConceptSet": "Non TB Drugs",
                    "isDropDown": true,
                    "doseUnits": ["mg"],
                    "frequency": ["Seven days a week"],
                    "route": ["Intramuscular"],
                    "hiddenFields": ["instructions"]
                }
            }
        }
    };
    var masterConfig = {
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

    beforeEach(module('bahmni.clinical'));
    beforeEach(module('bahmni.common.appFramework'));

    var injectTreatmentConfig = function (configName) {
        module(function ($provide) {

            var treatmentService = jasmine.createSpyObj('treatmentService', ['getConfig', 'getNonCodedDrugConcept']);
            var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
            var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
            var config = specUtil.respondWith({data: masterConfig});
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

        });

        inject(['treatmentConfig', function (_treatmentConfig) {
            treatmentConfig = _treatmentConfig(configName);
        }]);

    };

    it("should initialize treatment config based on tab name configured", function (done) {
        injectTreatmentConfig("tbTab");
        treatmentConfig.then(function(config){
            expect(config.inputOptionsConfig.drugConceptSet).toBe("All TB Drugs");
            done();
        });
    });

    it("should initialise drugOrderHistoryConfig if it is not available", function(){
        injectTreatmentConfig("tbTab");
        treatmentConfig.then(function(config){
            expect(config.drugOrderHistoryConfig).toEqual({});
            done();
        });
    });

    it('should initialize duration units', function(done) {
        injectTreatmentConfig("tbTab");
        treatmentConfig.then(function(data){
            expect(data.durationUnits).toEqual([
                {name: "Day(s)", factor: 1},
                {name: "Week(s)", factor: 7},
                {name: "Month(s)", factor: 30}
            ]);
            done();
        });
    });

    it('should initialize dosage units', function(done) {
        injectTreatmentConfig("tbTab");
        treatmentConfig.then(function(config){
            var doseUnits = config.getDoseUnits();
            expect(doseUnits.length).toEqual(1);
            expect(doseUnits).toContain({"name": "mg"});
            done();
        });
    });

    it('should retrieve all dose Units configured for the tab', function(done) {
        injectTreatmentConfig("tbTab");
        treatmentConfig.then(function(config){
            var doseUnits = config.getDoseUnits();
            expect(doseUnits.length).toEqual(1);
            expect(doseUnits).toContain({"name": "mg"});

            done();
        });
    });

    it("should disable elements on UI mentioned in inputConfig", function (done) {
        injectTreatmentConfig("tbTab");
        treatmentConfig.then(function (config) {
            expect(config.isHiddenField('additionalInstructions')).toBe(true);
            expect(config.isHiddenField('frequencies')).toBe(false);
            done();
        });
    });

    it("drug name field should be dropdown if configured as dropdown",function(done){
        var configName = "tbTab";
        medicationConfig['tabConfig'][configName].inputOptionsConfig.isDropDown=true;
        medicationConfig['tabConfig'][configName].inputOptionsConfig.drugConceptSet="Some Drug set";
        injectTreatmentConfig(configName);
        treatmentConfig.then(function(config){
            expect(config.isDropDown()).toBeTruthy();
            done();
        });
    });

    it("drug name field should be autocomplete if dropdown is not configured",function(done){
        var configName = "tbTab";
        medicationConfig['tabConfig'][configName].inputOptionsConfig.isDropDown=false;
        injectTreatmentConfig(configName);
        treatmentConfig.then(function(config){
            expect(config.isAutoComplete()).toBeTruthy();
            done();
        });
    });

    it("drugConceptSet should be part of inputOptionsConfig",function (done) {
        var allTBDrugs = 'All TB Drugs';
        var configName = "tbTab";
        medicationConfig['tabConfig'][configName].inputOptionsConfig.drugConceptSet=allTBDrugs;
        injectTreatmentConfig(configName);
        treatmentConfig.then(function(config){
            expect(config.getDrugConceptSet()).toBe(allTBDrugs);
            done();
        });
    });

    it("show additional information only if sos or dosing instructions or additional instructions are configured to be shown", function(done){
        var configName = "tbTab";
        medicationConfig['tabConfig'][configName].inputOptionsConfig.hiddenFields = ["additionalInstructions", "sos"];
        injectTreatmentConfig(configName);
        treatmentConfig.then(function(config){
            expect(config.showAdditionalInformation()).toBeTruthy();
            done();
        })
    });

    it("hide additional information only if sos, dosing instructions, additional instructions are hidden", function(done){
        var configName = "tbTab";
        medicationConfig['tabConfig'][configName].inputOptionsConfig.hiddenFields = ["additionalInstructions", "sos", "dosingInstructions"];
        injectTreatmentConfig(configName);
        treatmentConfig.then(function(config){
            expect(config.showAdditionalInformation()).toBeFalsy();
            done();
        })
    })
});