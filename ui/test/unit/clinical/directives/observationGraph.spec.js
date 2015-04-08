'use strict';

describe("Observation Graph", function() {
    var element, scope, compile, httpBackend, observationsService;

    beforeEach(module('bahmni.clinical'));

    beforeEach(module(function($provide ) {
        observationsService = jasmine.createSpyObj('observationsService', ['fetch']);
        $provide.value('observationsService', observationsService);

        window.c3 = jasmine.createSpyObj('c3',['generate']);
    }));

    beforeEach(inject(function($compile, $rootScope, $httpBackend) {
        scope = $rootScope.$new();
        compile = $compile;
        httpBackend = $httpBackend;
        scope.section = {
            "type": "observationGraph",
            "title": "Temperature",
            "config": {
                "yAxisConcepts": ["Temperature"],
                "numberOfVisits": 3
            }
        };

        scope.visit = {uuid: "visitUuid"};
        scope.patient = {uuid: "patientUuid"};
    }));

    var mockObservationService = function(data) {
        observationsService.fetch.and.callFake(function() {
            return {
                then: function(callback) {
                    return callback({data: data})
                }
            }
        });
    };

    beforeEach(function() {
        element = angular.element('<observation-graph visit-uuid="visit.uuid" params="section" patient-uuid="patient.uuid"></observation-graph>');
        httpBackend.expectGET('displaycontrols/graph/views/observationGraph.html').respond('<div id="{{graphId}}"></div>')
    });

    it("should not render the graph for no observations", function () {
        mockObservationService([]);

        compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        expect(window.c3.generate).not.toHaveBeenCalled();
    });

    it("should call c3 render for observations", function () {
        mockObservationService([{observationDateTime: "2015-01-01", value: 45, concept: { name: "superConcept"}}]);
        spyOn(Bahmni.Graph, 'observationGraphConfig');

        compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        expect(scope.graphId).not.toBeNull();
        var graphModel = [{observationDateTime: new Date("2015-01-01"), superConcept: 45}];
        var anyElement = null;
        expect(Bahmni.Graph.observationGraphConfig).toHaveBeenCalledWith(anyElement, jasmine.any(Number), scope.section.config.yAxisConcepts, graphModel);
        expect(window.c3.generate).toHaveBeenCalled();
    });

});