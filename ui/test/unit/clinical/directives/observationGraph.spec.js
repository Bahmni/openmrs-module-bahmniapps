'use strict';

describe("Observation Graph", function() {
    var element, scope, compile, httpBackend, observationsService, patientService;

    beforeEach(module('bahmni.clinical'));

    beforeEach(module(function($provide ) {
        observationsService = jasmine.createSpyObj('observationsService', ['fetch']);
        patientService = jasmine.createSpyObj('patientService', ['getPatient']);
        $provide.value('observationsService', observationsService);
        $provide.value('patientService', patientService);

        window.c3 = jasmine.createSpyObj('c3',['generate']);
    }));

    beforeEach(inject(function($compile, $rootScope, $httpBackend) {
        scope = $rootScope.$new();
        compile = $compile;
        httpBackend = $httpBackend;
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

    var mockPatientService = function(data) {
        patientService.getPatient.and.callFake(function() {
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

    it("should not call observationsService fetch for no config", function () {
        scope.section = undefined;

        compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        expect(observationsService.fetch).not.toHaveBeenCalled();
    });

    it("should not render the graph for no observations", function () {
        scope.section = {
            "type": "observationGraph",
            "title": "Temperature",
            "config": {
                "yAxisConcepts": ["Temperature"],
                "xAxisConcept": ["observationDateTime"],
                "numberOfVisits": 3
            }
        };
        mockObservationService([]);

        compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        expect(window.c3.generate).not.toHaveBeenCalled();
    });

    it("should call c3 render for observations with xaxis as observationDatetime", function () {
        scope.section = {
            "type": "observationGraph",
            "title": "Temperature",
            "config": {
                "yAxisConcepts": ["Temperature"],
                "xAxisConcept": ["observationDateTime"],
                "numberOfVisits": 3
            }
        };
        mockObservationService([{observationDateTime: "2015-01-01", value: 45, concept: { name: "Temperature"}}]);
        spyOn(Bahmni.Graph, 'observationGraphConfig');

        compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        expect(scope.graphId).not.toBeNull();
        var graphModel = [{observationDateTime: new Date("2015-01-01"), Temperature: 45}];
        var anyElement = null;
        expect(Bahmni.Graph.observationGraphConfig).toHaveBeenCalledWith(anyElement, jasmine.any(Number), scope.section.config, graphModel);
        expect(window.c3.generate).toHaveBeenCalled();
    });

    it("should call c3 render for observations with xaxis as age", function () {
        scope.section = {
            "type": "observationGraph",
            "title": "Height",
            "config": {
                "yAxisConcepts": ["Height"],
                "xAxisConcept": ["age"],
                "numberOfVisits": 3
            }
        };
        mockObservationService([{observationDateTime: "2015-01-01", value: 45, concept: { name: "Height"}}]);
        spyOn(Bahmni.Graph, 'observationGraphConfig');
        mockPatientService({person: {birthdate: "2000-02-02"}});

        compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        expect(scope.graphId).not.toBeNull();
        var graphModel = [{age: "14.10", Height: 45}];
        var anyElement = null;
        expect(Bahmni.Graph.observationGraphConfig).toHaveBeenCalledWith(anyElement, jasmine.any(Number), scope.section.config, graphModel);
        expect(window.c3.generate).toHaveBeenCalled();
    });

    it("should call c3 render for observations with xaxis as another concept", function () {
        scope.section = {
            "type": "observationGraph",
            "title": "Height",
            "config": {
                "yAxisConcepts": ["Height"],
                "xAxisConcept": ["Weight"],
                "numberOfVisits": 3
            }
        };
        mockObservationService([{observationDateTime: "2015-01-01", value: 155, concept: { name: "Height"}},
            {observationDateTime: "2015-01-01", value: 45, concept: { name: "Weight"}},
        ]);
        spyOn(Bahmni.Graph, 'observationGraphConfig');

        compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        expect(scope.graphId).not.toBeNull();
        var graphModel = [{Height: 155, Weight: 45}];
        var anyElement = null;
        expect(Bahmni.Graph.observationGraphConfig).toHaveBeenCalledWith(anyElement, jasmine.any(Number), scope.section.config, graphModel);
        expect(window.c3.generate).toHaveBeenCalled();
    });

});