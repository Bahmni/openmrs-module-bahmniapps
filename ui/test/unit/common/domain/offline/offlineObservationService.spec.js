'use strict';

describe('offlineObservationService', function () {

    var observationsService, observationsServiceStrategy;
    var $q= Q;
    var rootScope;
    var observationJson;

    beforeEach(module('bahmni.common.offline'));
    beforeEach(module('bahmni.common.domain'));

    beforeEach(module(function ($provide) {
        jasmine.getFixtures().fixturesPath = 'base/test/data';
        var encounterJson = JSON.parse(readFixtures('encounter.json'));
        observationJson = encounterJson.observations;
        var observationsWithConceptNamesInHierarchy = {"data": observationJson};
        var conceptNamesInHierarchy = {"data": ['Child Health', 'Treatment Given']};

        $provide.value('$q', $q);
        $provide.value('$rootScope', rootScope);
        $provide.value('observationsServiceStrategy', {
            getAllParentsInHierarchy: function () {
                return {
                    then: function (callback) {
                        return callback(conceptNamesInHierarchy);
                    }
                };
            },
            fetch: function () {
                return {
                    then: function (callback) {
                        return callback(observationsWithConceptNamesInHierarchy);
                    }
                };
            },
            fetchObsForVisit: function() {
                return {
                    then: function (callback) {
                        return callback(observationJson);
                    }
                };
            }
        });
    }));

    beforeEach(inject(['observationsService','observationsServiceStrategy', function (observationsServiceInjected, observationsServiceStrategyInjected) {
        observationsService = observationsServiceInjected;
        observationsServiceStrategy = observationsServiceStrategyInjected;
    }]));


    it('should not get observations if the given conceptName is not present in the db',function (done) {
        var childConceptNameNotInDb = 'Dummy Concept';
        var params = { patientUuid : 'fc6ede09-f16f-4877-d2f5-ed8b2182ec11', numberOfVisits : 0, scope : undefined, patientProgramUuid : undefined };
        params.conceptNames = [];

        spyOn(observationsServiceStrategy, 'getAllParentsInHierarchy').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback({"data":[]});
                    }
                };
            });
        spyOn(observationsServiceStrategy, 'fetch').and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({"data":[]});
                }
            };
        });
        observationsService.fetch(params.patientUuid, [childConceptNameNotInDb], undefined, 0, undefined, undefined, undefined,undefined).then(function(results){
            expect(results.data.length).toBe(0);
            expect(observationsServiceStrategy.getAllParentsInHierarchy.calls.count()).toBe(1);
            expect(observationsServiceStrategy.fetch.calls.count()).toBe(1);
            expect(observationsServiceStrategy.fetch).toHaveBeenCalledWith(params.patientUuid, params.numberOfVisits, params);
            done();
        });
    });

    it('should not get observations if the given conceptName is present in the db and no obs filled against it',function (done) {
        var templateConceptName = "Vitals";
        var params = { patientUuid : 'fc6ede09-f16f-4877-d2f5-ed8b2182ec11', numberOfVisits : 0, scope : undefined, patientProgramUuid : undefined };
        params.conceptNames = [templateConceptName];

        spyOn(observationsServiceStrategy, 'getAllParentsInHierarchy').and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({"data": ["Vitals"]});
                }
            };
        });
        spyOn(observationsServiceStrategy, 'fetch').and.callFake(function () {
            return {
                then: function (callback) {
                    return callback([]);
                }
            };
        });
        var patientUuid = "fc6ede09-f16f-4877-d2f5-ed8b2182ec11";
        var result = observationsService.fetch(patientUuid, [templateConceptName], undefined, 0, undefined, undefined, undefined,undefined).then(function(results){
            expect(results.data.length).toBe(0);
            expect(observationsServiceStrategy.getAllParentsInHierarchy.calls.count()).toBe(1);
            expect(observationsServiceStrategy.fetch.calls.count()).toBe(1);
            expect(observationsServiceStrategy.fetch).toHaveBeenCalledWith(params.patientUuid, params.numberOfVisits, params);
            done();
        });
    });

    it('should get all observations for the given conceptName, if the concept is template name and Observations recorded against concept',function (done) {
        var templatetName = 'Child Health';
        var params = { patientUuid : 'fc6ede09-f16f-4877-d2f5-ed8b2182ec11', numberOfVisits : 0, scope : undefined, patientProgramUuid : undefined };
        params.conceptNames = [templatetName];

        spyOn(observationsServiceStrategy, 'fetch').and.callThrough();

        spyOn(observationsServiceStrategy, 'getAllParentsInHierarchy').and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({"data": ["Child Health"]});
                }
            };
        });
        observationsService.fetch(params.patientUuid, [templatetName], undefined, 0, undefined, undefined, undefined,undefined).then(function(results){
            expect(results.data.length).toBe(1);
            expect(results.data[0].concept.name).toBe(templatetName);
            expect(observationsServiceStrategy.getAllParentsInHierarchy.calls.count()).toBe(1);
            expect(observationsServiceStrategy.fetch.calls.count()).toBe(1);
            expect(observationsServiceStrategy.fetch).toHaveBeenCalledWith(params.patientUuid, params.numberOfVisits, params);
            done();
        });
    });

    it('should get all observations for the given conceptName, if the concept is present at the first level of observation and Observations recorded against one of the parent concept in the hierarchy',function (done) {
        var firstLevelchildConceptName = 'Treatment Given';
        var conceptNamesInHierarchy = ['Child Health', 'Treatment Given'];
        var params = { patientUuid : 'fc6ede09-f16f-4877-d2f5-ed8b2182ec11', numberOfVisits : 0, scope : undefined, patientProgramUuid : undefined };
        params.conceptNames = conceptNamesInHierarchy;

        spyOn(observationsServiceStrategy, 'getAllParentsInHierarchy').and.callThrough();
        spyOn(observationsServiceStrategy, 'fetch').and.callThrough();

        observationsService.fetch(params.patientUuid, [firstLevelchildConceptName], undefined, 0, undefined, undefined, undefined,undefined).then(function(results){
            expect(results.data.length).toBe(3);
            expect(results.data[0].concept.name).toBe(firstLevelchildConceptName);
            expect(results.data[1].concept.name).toBe(firstLevelchildConceptName);
            expect(results.data[2].concept.name).toBe(firstLevelchildConceptName);
            expect(observationsServiceStrategy.getAllParentsInHierarchy.calls.count()).toBe(1);
            expect(observationsServiceStrategy.fetch.calls.count()).toBe(1);
            expect(observationsServiceStrategy.fetch).toHaveBeenCalledWith(params.patientUuid, params.numberOfVisits, params);
            done();
        });
    });

    it('should get all observations for the given conceptName, if the concept is present at the second level of observation and Observations recorded against one of the parent concept in the hierarchy',function (done) {
        var secondeLevelchildConceptName = 'Oral antibiotics given';
        var conceptNamesInHierarchy = ["Child Health", "Pneumonia Information", "Oral antibiotics given"];
        var params = { patientUuid : 'fc6ede09-f16f-4877-d2f5-ed8b2182ec11', numberOfVisits : 0, scope : undefined, patientProgramUuid : undefined };
        params.conceptNames = conceptNamesInHierarchy;

        spyOn(observationsServiceStrategy, 'getAllParentsInHierarchy').and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({"data": ["Child Health", "Pneumonia Information", "Oral antibiotics given"]});
                }
            };
        });
        spyOn(observationsServiceStrategy, 'fetch').and.callThrough();

        var patientUuid = "fc6ede09-f16f-4877-d2f5-ed8b2182ec11";
        observationsService.fetch(patientUuid, [secondeLevelchildConceptName], undefined, 0, undefined, undefined, undefined,undefined).then(function(results){
            expect(results.data.length).toBe(1);
            expect(results.data[0].concept.name).toBe(secondeLevelchildConceptName);
            expect(observationsServiceStrategy.getAllParentsInHierarchy.calls.count()).toBe(1);
            expect(observationsServiceStrategy.fetch.calls.count()).toBe(1);
            expect(observationsServiceStrategy.fetch).toHaveBeenCalledWith(params.patientUuid, params.numberOfVisits, params);
            done();
        });
    });

    it('should get all observations for the given multiple conceptNames, if the concepts are present at templateLevel and Observations recorded against one of the parent concept in the hierarchy',function (done) {
        var rootConcept = "Child Health";
        var childConcept = "Oral antibiotics given";

        spyOn(observationsServiceStrategy, 'getAllParentsInHierarchy').and.callThrough();
        spyOn(observationsServiceStrategy, 'fetch').and.callThrough();

        var patientUuid = "fc6ede09-f16f-4877-d2f5-ed8b2182ec11";
        observationsService.fetch(patientUuid, [rootConcept, childConcept], undefined, 0, undefined, undefined, undefined,undefined).then(function(results){
            expect(results.data.length).toBe(2);
            expect(results.data[0].concept.name).toBe(rootConcept);
            expect(results.data[1].concept.name).toBe(childConcept);
            expect(observationsServiceStrategy.getAllParentsInHierarchy.calls.count()).toBe(2);
            expect(observationsServiceStrategy.fetch.calls.count()).toBe(2);
            done();
        });
    });

    it('should not get the observations if the configure observation is voided',function (done) {
        observationJson[0].groupMembers[5].groupMembers[0].voided = true;

        spyOn(observationsServiceStrategy, 'getAllParentsInHierarchy').and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({"data": ['Child Health', 'Oral antibiotics given']});
                }
            };
        });
        spyOn(observationsServiceStrategy, 'fetch').and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({"data": observationJson});
                }
            };
        });

        var childConcept = "Oral antibiotics given";
        var patientUuid = "fc6ede09-f16f-4877-d2f5-ed8b2182ec11";
        observationsService.fetch(patientUuid, [childConcept], undefined, 0, undefined, undefined, undefined,undefined).then(function(results){
            expect(results.data.length).toBe(0);
            expect(observationsServiceStrategy.getAllParentsInHierarchy.calls.count()).toBe(1);
            expect(observationsServiceStrategy.fetch.calls.count()).toBe(1);
            done();
        });
    });

    it('should not get the observations if the whole template(rootConcept) is voided',function (done) {
        observationJson[0].voided = true;

        spyOn(observationsServiceStrategy, 'getAllParentsInHierarchy').and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({"data": ['Child Health', 'Oral antibiotics given']});
                }
            };
        });
        spyOn(observationsServiceStrategy, 'fetch').and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({"data": observationJson});
                }
            };
        });

        var childConcept = "Child Health";
        var patientUuid = "fc6ede09-f16f-4877-d2f5-ed8b2182ec11";
        var result = observationsService.fetch(patientUuid, [childConcept], undefined, 0, undefined, undefined, undefined,undefined).then(function(results){
            expect(results.data.length).toBe(0);
            expect(observationsServiceStrategy.getAllParentsInHierarchy.calls.count()).toBe(1);
            expect(observationsServiceStrategy.fetch.calls.count()).toBe(1);
            done();
        });
    });

    it('should get all observations if the given conceptNames is not present', function (done) {
        var params = {
            visitUuid: 'fc6ede09-f16f-4877-d2f5-ed8b2182ec11',
            patientUuid: undefined,
            scope: undefined,
            conceptNames: undefined
        };

        spyOn(observationsServiceStrategy, 'fetchObsForVisit').and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({"data": [
                        {
                            uuid: "uuid1",
                            visitUuid: 'fc6ede09-f16f-4877-d2f5-ed8b2182ec11'
                        },
                        {
                            uuid: "uuid2",
                            visitUuid: 'fc6ede09-f16f-4877-d2f5-ed8b2182ec11'
                        }
                    ]});
                }
            };
        });

        spyOn(observationsServiceStrategy, 'getAllParentsInHierarchy').and.returnValue({});

        observationsService.fetch(undefined, undefined, undefined, 0, params.visitUuid, undefined, undefined, undefined).then(function (results) {
            expect(results.data.length).toBe(2);
            expect(observationsServiceStrategy.getAllParentsInHierarchy).not.toHaveBeenCalled();
            expect(observationsServiceStrategy.fetchObsForVisit).toHaveBeenCalledWith(params);
            done();
        });
    });

    it('should get specific observations for the given conceptNames and visitUuid', function (done) {
        var templateConceptName = "Vitals";
        var params = {
            patientUuid: 'fc6ede09-f16f-4877-d2f5-ed8b2182ec11',
            visitUuid: 'fc6ede09-f16f-4877-d2f5-ed8b2182ec12',
            scope: undefined
        };
        params.conceptNames = [templateConceptName];

        spyOn(observationsServiceStrategy, 'getAllParentsInHierarchy').and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({"data": ["Vitals"]});
                }
            };
        });
        spyOn(observationsServiceStrategy, 'fetch').and.callFake(function () {
            return {
                then: function (callback) {
                    return callback([]);
                }
            };
        });
        var patientUuid = "fc6ede09-f16f-4877-d2f5-ed8b2182ec11";
        observationsService.fetch(patientUuid, [templateConceptName], undefined, 0, params.visitUuid, undefined, undefined, undefined).then(function (results) {
            expect(results.data.length).toBe(0);
            expect(observationsServiceStrategy.getAllParentsInHierarchy.calls.count()).toBe(1);
            expect(observationsServiceStrategy.fetch.calls.count()).toBe(1);
            expect(observationsServiceStrategy.fetch).toHaveBeenCalledWith(params.patientUuid, params.numberOfVisits, params);
            done();
        });
    });
});
