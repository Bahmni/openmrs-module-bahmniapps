'use strict';

describe("conceptService", function () {
    var http, $q;
    beforeEach(module('bahmni.common.conceptSet'));
    beforeEach(function () {
        http = jasmine.createSpyObj('$http', ['get']);
        module(function ($provide) {
            $provide.value('$http', http);
            $provide.value('$q', Q);
        });

    });

    var injectConceptService = function () {
        var conceptService;
        inject(['conceptService', function (_conceptService_) {
            conceptService = _conceptService_;
        }]);
        return conceptService;
    };

    /*Mock of constructor Bahmni.Common.Domain.ConceptMapper*/
    var originalConceptMapper, spyConceptMapperInstance;
    beforeEach(function () {
        spyConceptMapperInstance = jasmine.createSpyObj('ConceptMapperInstance', ['map']);
        spyConceptMapperInstance.map.and.callFake(function (toBeMapped) {
            return {uuid: toBeMapped.uuid, name: toBeMapped.name.name};
        });

        originalConceptMapper = Bahmni.Common.Domain.ConceptMapper;
        Bahmni.Common.Domain.ConceptMapper = function () {
            return spyConceptMapperInstance;
        };
    });
    afterEach(function () {
        Bahmni.Common.Domain.ConceptMapper = originalConceptMapper;
    });
    /*********/

    describe("#getAnswer", function () {
        it("should get no answer when the concept doesn't have answers", function (done) {
            var aConcept = {};
            var conceptService = injectConceptService();
            conceptService.getAnswers(aConcept).then(function (answers) {
                expect(answers).toEqual([]);
            }).catch(notifyError).finally(done);
        });

        it("should get all uniq answers based on the uuid uniqueness", function (done) {
            var aConcept = {
                answers: [
                    {uuid: 'same uuid', name: 'name 1'},
                    {uuid: 'same uuid', name: 'name 2'}
                ]
            };
            var conceptService = injectConceptService();
            conceptService.getAnswers(aConcept).then(function (answers) {
                expect(answers.length).toEqual(1);
                expect(answers[0].uuid).toEqual('same uuid');
            }).catch(notifyError).finally(done);
        });

        it("should get mapped answers using ConceptMapper", function (done) {
            var aConcept = {
                answers: [
                    {uuid: 'uuid1', name: {name: 'name 1'}},
                    {uuid: 'uuid2', name: {name: 'name 2'}},
                    {uuid: 'uuid3', name: {name: 'name 3'}}
                ]
            };
            var conceptService = injectConceptService();
            conceptService.getAnswers(aConcept).then(function (answers) {
                expect(answers.length).toEqual(3);
                expect(answers[0].uuid).toEqual('uuid1');
                expect(answers[0].name).toEqual('name 1');
                expect(answers[1].uuid).toEqual('uuid2');
                expect(answers[1].name).toEqual('name 2');
                expect(answers[2].uuid).toEqual('uuid3');
                expect(answers[2].name).toEqual('name 3');
                expect(spyConceptMapperInstance.map.calls.count()).toBe(3);
            }).catch(notifyError).finally(done);
        });
    });

    describe("#getConceptByQuestion", function () {
        it("should get answers from openmrs concept api", function (done) {
            var request = {
                term:"requestTerm",
                answersConceptName:"requestCodedConceptName"
            };
            var data = {
                results:[]
            };
            http.get.and.returnValue(specUtil.respondWith({data:data}));
            var conceptService = injectConceptService();
            conceptService.getAnswersForConceptName(request).then(function (answers) {
                var actualRequestArgs = http.get.calls.mostRecent().args;
                expect(actualRequestArgs[0]).toEqual(Bahmni.Common.Constants.bahmniConceptAnswerUrl);
                var actualRequestParams = actualRequestArgs[1].params;
                expect(actualRequestParams.q).toEqual(request.term);
                expect(actualRequestParams.question).toEqual(request.answersConceptName);
                expect(actualRequestParams.v).toEqual("custom:(concept:(uuid,name:(display,uuid,name,conceptNameType),names:(display,uuid,name,conceptNameType)),drug:(uuid,name,display))");
                expect(actualRequestParams.s).toEqual("byQuestion");

                expect(answers).toEqual(data.results);
            }).catch(notifyError).finally(done);
        });
    });
});