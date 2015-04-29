'use strict';

describe("Observation Graph", function () {
    var element, scope, compile, httpBackend, observationsService, patientService;

    beforeEach(module('bahmni.clinical'));

    beforeEach(module(function ($provide) {
        observationsService = jasmine.createSpyObj('observationsService', ['fetch']);
        patientService = jasmine.createSpyObj('patientService', ['getPatient']);
        $provide.value('observationsService', observationsService);
        $provide.value('patientService', patientService);

        window.c3 = jasmine.createSpyObj('c3', ['generate']);
    }));

    beforeEach(inject(function ($compile, $rootScope, $httpBackend) {
        scope = $rootScope.$new();
        compile = $compile;
        httpBackend = $httpBackend;
        scope.visit = {uuid: "visitUuid"};
        scope.patient = {uuid: "patientUuid"};
    }));

    var mockObservationService = function (data) {
        observationsService.fetch.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({data: data})
                }
            }
        });
    };

    var mockPatientService = function (data) {
        patientService.getPatient.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({data: data})
                }
            }
        });
    };

    beforeEach(function () {
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
                "xAxisConcept": "observationDateTime",
                "numberOfVisits": 3
            }
        };
        mockObservationService([]);
        spyOn(Bahmni.Graph, 'c3Chart');

        compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        expect(Bahmni.Graph.c3Chart).not.toHaveBeenCalled();
    });

    it("should call c3 render for observations with xaxis as observationDatetime", function () {
        scope.section = {
            "type": "observationGraph",
            "title": "Temperature",
            "config": {
                "yAxisConcepts": ["Temperature"],
                "xAxisConcept": "observationDateTime",
                "numberOfVisits": 3,
                "type": "timeseries"
            }
        };
        mockObservationService([{
            observationDateTime: "2015-01-01",
            value: 45,
            concept: {name: "Temperature", units: "Celcius"}
        }]);
        spyOn(Bahmni.Graph, 'c3Chart');

        compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        expect(scope.graphId).not.toBeNull();
        var graphModel = [{
            name: "Temperature",
            units: "Celcius",
            values: [{observationDateTime: Bahmni.Common.Util.DateUtil.parseDatetime("2015-01-01").toDate(), Temperature: 45, units: "Celcius"}]
        }];
        var anyElement = null;
        expect(Bahmni.Graph.c3Chart).toHaveBeenCalledWith(anyElement, jasmine.any(Number),
            new Bahmni.Clinical.ObservationGraphConfig(scope.section.config),
            new Bahmni.Clinical.ObservationGraph(graphModel));
        expect(Bahmni.Graph.c3Chart).toHaveBeenCalled();
    });

    it("should call c3 render for observations with xaxis as age", function () {
        scope.section = {
            "type": "observationGraph",
            "title": "Height",
            "config": {
                "yAxisConcepts": ["Height"],
                "xAxisConcept": "age",
                "numberOfVisits": 3,
                "unit": " (years)"
            }
        };
        mockObservationService([{
            observationDateTime: "2015-01-01",
            value: 45,
            concept: {name: "Height", units: "cm"}
        }]);
        spyOn(Bahmni.Graph, 'c3Chart');
        mockPatientService({person: {birthdate: "2000-02-02"}});

        compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        expect(scope.graphId).not.toBeNull();
        var graphModel = [{name: 'Height', units: "cm", values: [{age: '14.10', Height: 45, units: "cm"}]}];
        var anyElement = null;
        expect(Bahmni.Graph.c3Chart).toHaveBeenCalledWith(
            anyElement
            , jasmine.any(Number)
            , new Bahmni.Clinical.ObservationGraphConfig(scope.section.config)
            , new Bahmni.Clinical.ObservationGraph(graphModel));
        expect(Bahmni.Graph.c3Chart).toHaveBeenCalled();
    });

    it("should call c3 render for observations with xaxis as another concept", function () {
        scope.section = {
            "type": "observationGraph",
            "title": "Height",
            "config": {
                "yAxisConcepts": ["Height"],
                "xAxisConcept": "Weight",
                "numberOfVisits": 3,
                "type": "indexed"
            }
        };
        mockObservationService([
            {observationDateTime: "2015-01-01", value: 155, concept: {name: "Height", units: "cm"}},
            {observationDateTime: "2015-01-01", value: 45, concept: {name: "Weight", units: "kg"}}
        ]);
        spyOn(Bahmni.Graph, 'c3Chart');

        compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        expect(scope.graphId).not.toBeNull();
        var graphModel = [{
            name: 'Height',
            units: 'cm',
            values: [{Weight: 45, Height: 155, units: 'cm'}]
        }];
        var anyElement = null;
        expect(Bahmni.Graph.c3Chart).toHaveBeenCalledWith(anyElement
            , jasmine.any(Number)
            , new Bahmni.Clinical.ObservationGraphConfig(scope.section.config)
            , new Bahmni.Clinical.ObservationGraph(graphModel));
        expect(Bahmni.Graph.c3Chart).toHaveBeenCalled();
    });

    it("should call c3 render for multiple observations on the yAxis", function () {
        scope.section = {
            "type": "observationGraph",
            "title": "Height and weight vs time",
            "config": {
                "yAxisConcepts": ["Height", "Weight"],
                "xAxisConcept": "observationDateTime",
                "numberOfVisits": 3,
                "type": "timeseries"
            }
        };
        mockObservationService([{observationDateTime: "2015-01-01", value: 155, concept: {name: "Height", units: "cm"}},
            {observationDateTime: "2015-01-01", value: 40, concept: {name: "Weight", units: "kg"}},
            {observationDateTime: "2015-02-01", value: 155, concept: {name: "Height", units: "cm"}},
            {observationDateTime: "2015-02-01", value: 45, concept: {name: "Weight", units: "kg"}}
        ]);

        spyOn(Bahmni.Graph, 'c3Chart');

        compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        var toDate = function(str) {
            return Bahmni.Common.Util.DateUtil.parseDatetime(str).toDate();
        };

        expect(scope.graphId).not.toBeNull();
        var graphModel = [
            {
                name: "Height", units: "cm", values: [
                {observationDateTime: toDate("2015-01-01"), "Height": 155, "units": "cm"},
                {observationDateTime: toDate("2015-02-01"), "Height": 155, "units": "cm"}]
            },
            {
                name: "Weight", units: "kg", values: [
                {observationDateTime: toDate("2015-01-01"), "Weight": 40, "units": "kg"},
                {observationDateTime: toDate("2015-02-01"), "Weight": 45, "units": "kg"}]
            }];
        var anyElement = null;

        expect(Bahmni.Graph.c3Chart).toHaveBeenCalledWith(anyElement
            , jasmine.any(Number)
            , new Bahmni.Clinical.ObservationGraphConfig(scope.section.config)
            , new Bahmni.Clinical.ObservationGraph(graphModel));
        expect(Bahmni.Graph.c3Chart).toHaveBeenCalled();
    });
});