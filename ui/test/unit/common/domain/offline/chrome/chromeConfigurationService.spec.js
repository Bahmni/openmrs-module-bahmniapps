'use strict';

describe('configurationService', function () {
    var offlineDbService;
    var $q= Q;

    beforeEach(module('bahmni.common.domain'));
    beforeEach(module('bahmni.common.offline'));

    beforeEach(module(function ($provide) {
        offlineDbService = jasmine.createSpyObj('offlineDbService',['getReferenceData']);
        $provide.value('$q', $q);
        $provide.value('offlineDbService', offlineDbService);
    }));

    var configurationservice;

    beforeEach(inject(function (_configurationService_) {
        configurationservice = _configurationService_;

    }));

    it('should fetch encounterConfig from love field database', function (done) {
        var encounterConfig = {
            "data": {
                "visitTypes": {
                    "emergency": "d77c4b69-7d55-11e5-acdf-90fba67c4298",
                    "inpatient": "d5d88349-7d55-11e5-acdf-90fba67c4298",
                    "outpatient": "d5f34f04-7d55-11e5-acdf-90fba67c4298"
                }
            }
        };
        offlineDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, encounterConfig));
        configurationservice.getConfigurations(['encounterConfig']).then(function(result){
            expect(result.encounterConfig.visitTypes).toBe(encounterConfig.data.visitTypes);
            done();
        });
    });


    it('should fetch patientAttributesConfig from offline db', function (done) {

        var patientAttributesConfig = {
            "data": {
                "results": [
                    {
                        "name": "fatherName",
                        "uuid": "d312809a-7d55-11e5-acdf-90fba67c4298",
                        "format": "java.lang.String"
                    },
                    {
                        "name": "spouseName",
                        "uuid": "d32e8ca4-7d55-11e5-acdf-90fba67c4298",
                        "format": "java.lang.String"
                    }
                ]
            }};

        offlineDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, patientAttributesConfig));
        configurationservice.getConfigurations(['patientAttributesConfig']).then(function(result){
            expect(result.patientAttributesConfig.results.length).toBe(2);
            expect(result.patientAttributesConfig.results[0].name).toBe("fatherName");
            done();
        });

    });

    it('should fetch patientConfig from offline db', function (done) {
        var patientConfig = {
            "data": {
                "results": [
                    {
                        personAttributeTypes: [{
                            name: "personName",
                            description: "Name in local language"
                        },{
                            name: "patientName",
                            description: "Name in local language"
                        }]
                    }
                ]
            }};

        offlineDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, patientConfig));
        configurationservice.getConfigurations(['patientConfig']).then(function(result){

            expect(result.patientConfig.results.length).toBe(1);
            expect(result.patientConfig.results[0].personAttributeTypes[0].name).toBe("personName");
            done();
        });

    });


    it('should fetch dosageFrequencyConfig from offline db', function (done) {
        var dosageFrequencyConfig = {
            "data": {
                "results": [
                    {
                        uuid: "818f75fe-3f10-11e4-adec-0800271c1b75",
                        name: "TID"
                    }
                ]
            }};

        offlineDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, dosageFrequencyConfig));
        configurationservice.getConfigurations(['dosageFrequencyConfig']).then(function(result){
            expect(result.dosageFrequencyConfig.results.length).toBe(1);
            expect(result.dosageFrequencyConfig.results[0].name).toBe("TID");
            done();
        });
    });

    it('should fetch dosageInstructionConfig from  offline db', function (done) {
        var dosageInstructionConfig = {
            "data": {
                "results": [
                    {
                        name: { display: "AC",
                            uuid: "81b90886-3f10-11e4-adec-0800271c1b75",
                            name: "AC",
                            locale: "en"
                        },
                        answers: []
                    }]
            }
        };

        offlineDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, dosageInstructionConfig));
        configurationservice.getConfigurations(['dosageInstructionConfig']).then(function (result) {
            expect(result.dosageInstructionConfig.results.length).toBe(1);
            expect(result.dosageInstructionConfig.results[0].name.name).toBe("AC");
            done();
        });
    });

    it('should fetch stoppedOrderReasonConfig from  offline db', function (done) {
        var stoppedOrderReasonConfig = {
            "data": {
                "results": [
                    {
                        name: { display: "Stopped Order Reason",
                            uuid: "81b90886-3f10-11e4-adec-0800271c1b75",
                            name: "Stopped Order Reason",
                            locale: "en"
                        },
                        answers: []
                    }]
            }
        };

        offlineDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, stoppedOrderReasonConfig));
        configurationservice.getConfigurations(['stoppedOrderReasonConfig']).then(function (result) {
            expect(result.stoppedOrderReasonConfig.results.length).toBe(1);
            expect(result.stoppedOrderReasonConfig.results[0].name.name).toBe("Stopped Order Reason");
            done();
        });
    });

    it('should fetch consultationNoteConfig from  offline db', function (done) {
        var consultationNoteConfig = {
            "data": {
                "results": [
                    {
                        name: { display: "Consultation Note Config",
                            uuid: "81b90886-3f10-11e4-adec-0800271c1b75",
                            name: "Consultation Note Config",
                            locale: "en"
                        },
                        answers: []
                    }]}
        };

        offlineDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, consultationNoteConfig));
        configurationservice.getConfigurations(['consultationNoteConfig']).then(function (result) {
            expect(result.consultationNoteConfig.results.length).toBe(1);
            expect(result.consultationNoteConfig.results[0].name.name).toBe("Consultation Note Config");
            done();
        });
    });

    it('should fetch labOrderNotesConfig from  offline db', function (done) {
        var labOrderNotesConfig = {
            "data": {
                "results": [
                    {
                        name: { display: "labOrder Note Config",
                            uuid: "81b90886-3f10-11e4-adec-0800271c1b75",
                            name: "labOrder Note Config",
                            locale: "en"
                        },
                        answers: []
                    }]}
        };

        offlineDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, labOrderNotesConfig));
        configurationservice.getConfigurations(['labOrderNotesConfig']).then(function (result) {
            expect(result.labOrderNotesConfig.results.length).toBe(1);
            expect(result.labOrderNotesConfig.results[0].name.name).toBe("labOrder Note Config");
            done();
        });
    });

    it('should fetch radiologyImpressionConfig from  offline db', function (done) {
        var radiologyImpressionConfig = {
            "data": {
                "results": [
                    {
                        name: { display: "Radiology Impression Config",
                            uuid: "81b90886-3f10-11e4-adec-0800271c1b75",
                            name: "Radiology Impression Config",
                            locale: "en"
                        },
                        answers: []
                    }]}
        };

        offlineDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, radiologyImpressionConfig));
        configurationservice.getConfigurations(['radiologyImpressionConfig']).then(function (result) {
            expect(result.radiologyImpressionConfig.results.length).toBe(1);
            expect(result.radiologyImpressionConfig.results[0].name.name).toBe("Radiology Impression Config");
            done();
        });
    });

    it('should fetch addressLevels from  offline db', function (done) {
        var addressLevels = {
            "data": {
                "results": [
                    {
                        name: "State",
                        addressField: "stateProvince",
                        required: false
                    }]}
        };

        offlineDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, addressLevels));
        configurationservice.getConfigurations(['addressLevels']).then(function (result) {
            expect(result.addressLevels.results.length).toBe(1);
            expect(result.addressLevels.results[0].name).toBe("State");
            done();
        });
    });

    it('should fetch allTestsAndPanelsConcept from offline db', function (done) {
        var allTestsAndPanelsConcept = {
            "data": {
                "results": [
                    {
                        uuid: "41e09efb-eca2-48b1-9aff-0b34864e0aad",
                        name: "All_Tests_and_Panels"
                    }]}
        };

        offlineDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, allTestsAndPanelsConcept));
        configurationservice.getConfigurations(['allTestsAndPanelsConcept']).then(function (result) {
            expect(result.allTestsAndPanelsConcept.results.length).toBe(1);
            expect(result.allTestsAndPanelsConcept.results[0].name).toBe("All_Tests_and_Panels");
            done();
        });
    });

    it('should fetch identifierTypesConfig from offline db', function (done) {
        var identifierTypesConfig = {
            "data": {
                "results": [
                    {
                        uuid: "52e09efb-eca2-48b1-9aff-0b34864e0aad",
                        identifierSources: [{
                            uuid: "41e09efb-eca2-48b1-9aff-0b34864e0aad",
                            name: "Identifier Source Config"
                        }
                        ]
                    }]
            }
        };

        offlineDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, identifierTypesConfig));
        configurationservice.getConfigurations(['identifierTypesConfig']).then(function (result) {
            expect(result.identifierTypesConfig.results.length).toBe(1);
            expect(result.identifierTypesConfig.results[0].identifierSources[0].name).toBe("Identifier Source Config");
            done();
        });
    });

    it('should fetch relationshipTypes from offline db', function (done) {
        var relationshipTypeConfig = {
            "data": {
                "results": [
                    {
                        uuid: "41e09efb-eca2-48b1-9aff-0b348e0aad",
                        name: "LoginLocation_Visit_type_Mapping"
                    }]}
        };

        offlineDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, relationshipTypeConfig));
        configurationservice.getConfigurations(['relationshipTypeConfig']).then(function (result) {
            expect(result.relationshipTypeConfig.results.length).toBe(1);
            expect(result.relationshipTypeConfig.results[0].name).toBe("LoginLocation_Visit_type_Mapping");
            done();
        });
    });

    it('should fetch genderMap from offline db', function (done) {
        var genderMap = {
            "data": {
                "results": {
                    M: "Male",
                    F: "Female",
                    O: "Other"
                }
            }
        };

        offlineDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, genderMap));
        configurationservice.getConfigurations(['genderMap']).then(function (result) {
            expect(result.genderMap.results.M).toBe("Male");
            done();
        });
    });

    it('should fetch loginLocationToVisitTypeMapping from offline db', function (done) {
        var loginLocationToVisitTypeMapping = {
            "data": {
                "results": [
                    {
                        uuid: "41e09efb-eca2-48b1-9aff-0b34864e0aad",
                        name: "loginLocation To VisitType Map"
                    }]}
        };

        offlineDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, loginLocationToVisitTypeMapping));
        configurationservice.getConfigurations(['loginLocationToVisitTypeMapping']).then(function (result) {
            expect(result.loginLocationToVisitTypeMapping.results.length).toBe(1);
            expect(result.loginLocationToVisitTypeMapping.results[0].name).toBe("loginLocation To VisitType Map");
            done();
        });
    });



    it('should fetch loginLocationToEncounterTypeMapping from offline db', function (done) {
        var loginLocationToEncounterTypeMapping = {
            "data": {
                "results": [
                    {
                        "entity": {
                            "uuid": "6f8dca71-1f5a-4cb4-8bb2-f52b317af202",
                            "display": "login location",
                            "name": "login location"
                        }
                    },
                    {
                        "mappings": []
                    }
                ]
            }
        };

        offlineDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, loginLocationToEncounterTypeMapping));
        configurationservice.getConfigurations(['loginLocationToEncounterTypeMapping']).then(function (result) {
            expect(result.loginLocationToEncounterTypeMapping.results.length).toBe(2);
            expect(result.loginLocationToEncounterTypeMapping.results[0].entity.name).toBe("login location");
            done();
        });
    });
});