'use strict';

describe("Observation Graph", function () {
    var element, scope, compile, httpBackend, observationsService, patientService, conceptSetService, appService, c3ChartSpy, translate;

    beforeEach(module('bahmni.clinical'));

    beforeEach(module(function ($provide) {
        observationsService = jasmine.createSpyObj('observationsService', ['fetch']);
        patientService = jasmine.createSpyObj('patientService', ['getPatient']);
        conceptSetService = jasmine.createSpyObj('conceptSetService', ['getConcept']);
        appService = jasmine.createSpyObj('appService', ['loadCsvFileFromConfig']);
        translate = jasmine.createSpyObj('$translate', ['instant']);
        translate.instant.and.callFake(function (key) {
            return key;
        });
        $provide.value('observationsService', observationsService);
        $provide.value('patientService', patientService);
        $provide.value('conceptSetService', conceptSetService);
        $provide.value('appService', appService);
        $provide.value('$translate', translate);

        c3ChartSpy = jasmine.createSpyObj('c3Chart', ['render']);
        Bahmni.Graph.c3Chart.create = function () {
            return c3ChartSpy;
        };
    }));

    beforeEach(inject(function ($compile, $rootScope, $httpBackend) {
        scope = $rootScope.$new();
        compile = $compile;
        httpBackend = $httpBackend;
        scope.visit = {uuid: "visitUuid"};
        scope.patient = {uuid: "patientUuid"};
    }));

    var toDate = function (str) {
        return Bahmni.Common.Util.DateUtil.parseDatetime(str).toDate();
    };

    var mockConceptSetService = function (data) {
        conceptSetService.getConcept.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({data: data})
                }
            }
        });
    };

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

    var mockAppServiceLoadConfigToReturn = function (data) {
        appService.loadCsvFileFromConfig.and.returnValue(data);
    };

    beforeEach(function () {
        element = angular.element('<div><observation-graph visit-uuid="visit.uuid" params="section" patient-uuid="patient.uuid"></observation-graph></div>');
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
        mockConceptSetService([]);

        compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        expect(c3ChartSpy.render).not.toHaveBeenCalled();
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
        mockConceptSetService([]);

        compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        expect(scope.graphId).not.toBeNull();
        var graphModel = [new Bahmni.Clinical.ObservationGraphLine({
            name: "Temperature",
            units: "Celcius",
            values: [{
                observationDateTime: Bahmni.Common.Util.DateUtil.parseDatetime("2015-01-01").toDate(),
                Temperature: 45
            }]
        })];
        var anyElement = null;
        expect(c3ChartSpy.render).toHaveBeenCalledWith(anyElement, jasmine.any(Number),
            new Bahmni.Clinical.ObservationGraphConfig(scope.section.config),
            new Bahmni.Clinical.ObservationGraph(graphModel));
    });

    it("should call c3 render for observations with xaxis as age", function () {
        scope.section = {
            "type": "observationGraph",
            "title": "Height",
            "config": {
                "yAxisConcepts": ["Height"],
                "xAxisConcept": "age",
                "numberOfVisits": 3
            }
        };
        mockObservationService([{
            observationDateTime: "2015-01-01",
            value: 45,
            concept: {name: "Height", units: "cm"}
        }]);
        mockConceptSetService([]);
        mockPatientService({person: {birthdate: "2000-02-02"}});

        compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        expect(scope.graphId).not.toBeNull();
        var graphModel = [new Bahmni.Clinical.ObservationGraphLine({
            name: 'Height',
            units: "cm",
            values: [{age: 178.9, Height: 45}]
        })];
        var anyElement = null;
        expect(c3ChartSpy.render).toHaveBeenCalledWith(
            anyElement
            , jasmine.any(Number)
            , new Bahmni.Clinical.ObservationGraphConfig(scope.section.config)
            , new Bahmni.Clinical.ObservationGraph(graphModel));
    });

    it("should render growth chart", function () {
        scope.section = {
            "type": "observationGraph",
            "name": "observationGraph",
            "title": "Growth Chart",
            "config": {
                "yAxisConcepts": ["Weight"],
                "referenceData": "growthChartReference.csv",
                "numberOfVisits": 20
            }
        };
        mockPatientService({person: {birthdate: "2014-02-02"}});
        mockObservationService([{
            observationDateTime: "2015-01-01",
            value: 45,
            concept: {name: "Weight", units: "Kg"}
        }]);
        mockConceptSetService({results: [{name: "Weight", units: "Kg",datatype:{name:"Numeric"}}]});
        appService.loadCsvFileFromConfig.and.callFake(function () {
            return {
                then: function (callback) {
                    callback({
                       data: 'Gender,Age,3rd,10th,50th,75th,97th\nM,0,2.3,2.7,3.5,3.8,4.4'
                    });
                }
            }
        });
        var mockObservationGraphModel = {};
        spyOn(Bahmni.Clinical.ObservationGraph, 'create').and.returnValue(mockObservationGraphModel);
        mockPatientService({person: {birthdate: "2000-02-02"}});

        compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        expect(c3ChartSpy.render).toHaveBeenCalledWith(null, 0, jasmine.any(Object), mockObservationGraphModel);
        expect(appService.loadCsvFileFromConfig).toHaveBeenCalledWith("growthChartReference.csv");
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
        mockConceptSetService([]);

        compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        expect(scope.graphId).not.toBeNull();
        var graphModel = [new Bahmni.Clinical.ObservationGraphLine({
            name: 'Height',
            units: 'cm',
            values: [{Weight: 45, Height: 155}]
        })];
        var anyElement = null;
        expect(c3ChartSpy.render).toHaveBeenCalledWith(anyElement
            , jasmine.any(Number)
            , new Bahmni.Clinical.ObservationGraphConfig(scope.section.config)
            , new Bahmni.Clinical.ObservationGraph(graphModel));
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
        mockConceptSetService([]);


        compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        expect(scope.graphId).not.toBeNull();
        var graphModel = [
            new Bahmni.Clinical.ObservationGraphLine({
                name: "Height", units: "cm", values: [
                    {observationDateTime: toDate("2015-01-01"), "Height": 155},
                    {observationDateTime: toDate("2015-02-01"), "Height": 155}]
            }),
            new Bahmni.Clinical.ObservationGraphLine({
                name: "Weight", units: "kg", values: [
                    {observationDateTime: toDate("2015-01-01"), "Weight": 40},
                    {observationDateTime: toDate("2015-02-01"), "Weight": 45}]
            })];
        var anyElement = null;

        expect(c3ChartSpy.render).toHaveBeenCalledWith(anyElement
            , jasmine.any(Number)
            , new Bahmni.Clinical.ObservationGraphConfig(scope.section.config)
            , new Bahmni.Clinical.ObservationGraph(graphModel));
    });

    it("should ignore reference lines if there are multiple y axis concepts for graph", function () {
        scope.section = {
            "type": "observationGraph",
            "title": "Height and weight",
            "config": {
                "yAxisConcepts": ["Height", "Weight"],
                "xAxisConcept": "observationDateTime",
                "referenceData": "growthChartReference.csv",
                "numberOfVisits": 3
            }
        };

        mockObservationService([
            {observationDateTime: "2015-02-01", value: 155, concept: {name: "Height", units: "cm"}}
        ]);
        mockConceptSetService([]);

        compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        var graphModel = [
            new Bahmni.Clinical.ObservationGraphLine({
                name: "Height", units: "cm", values: [
                    {observationDateTime: toDate("2015-02-01"), "Height": 155}]
            })
        ];

        expect(c3ChartSpy.render).toHaveBeenCalledWith(null
            , jasmine.any(Number)
            , jasmine.any(Object)
            , new Bahmni.Clinical.ObservationGraph(graphModel));
    });

    it("should render with lowNormal and hiNormal values when they are available in the concept", function () {
        scope.section = {
            "type": "observationGraph",
            "title": "Height and weight",
            "config": {
                "yAxisConcepts": ["Height", "Weight"],
                "xAxisConcept": "observationDateTime",
                "numberOfVisits": 3
            }
        };

        mockObservationService([
            {observationDateTime: "2015-02-01", value: 155, concept: {name: "Height", units: "cm"}}
        ]);
        mockConceptSetService({results:[
                {lowNormal:20,hiNormal:30,datatype:{name:"Numeric"}}
        ]});

        var expectedConfig = {
            yAxisConcepts: ['Height', 'Weight'],
            xAxisConcept: 'observationDateTime',
            numberOfVisits: 3,
            lowNormal: 20,
            hiNormal: 30,
            type: 'timeseries'
        };

        compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        expect(c3ChartSpy.render).toHaveBeenCalledWith(null
            , jasmine.any(Number)
            , new Bahmni.Clinical.ObservationGraphConfig(expectedConfig)
            , jasmine.any(Object));
    });

    it("should throw error when gender column is not present in the reference csv file",function(){
        scope.section = {
            "type": "observationGraph",
            "name": "observationGraph",
            "title": "Growth Chart",
            "config": {
                "yAxisConcepts": ["Height"],
                "referenceData": "growthChartReference.csv",
                "numberOfVisits": 20
            }
        };

        mockObservationService([]);
        mockConceptSetService({results:[
            {lowNormal:20,hiNormal:30,datatype:{name:"Numeric"}}
        ]});
        mockPatientService({person: {birthdate: "2000-02-02"}});
        mockAppServiceLoadConfigToReturn({data:",Age,P20,P50,P80"});

        compile(element)(scope);
        scope.$digest();
        expect(httpBackend.flush).toThrow(
            new Error("Gender column is not defined in reference lines csv: growthChartReference.csv")
        );

    });

    it("should throw error when age column is not present in the reference csv file",function(){
        scope.section = {
            "type": "observationGraph",
            "name": "observationGraph",
            "title": "Growth Chart",
            "config": {
                "yAxisConcepts": ["Height"],
                "referenceData": "growthChartReference.csv",
                "numberOfVisits": 20
            }
        };

        mockObservationService([]);
        mockConceptSetService({results:[
            {lowNormal:20,hiNormal:30,datatype:{name:"Numeric"}}
        ]});
        mockPatientService({person: {birthdate: "2000-02-02"}});
        mockAppServiceLoadConfigToReturn({data:",Gender,P20,P50,P80"});

        compile(element)(scope);
        scope.$digest();
        expect(httpBackend.flush).toThrow(
            new Error("Age column is not defined in reference lines csv: growthChartReference.csv")
        );

    });

    it("should throw error when non numeric column is given as y-axis concept in the config for reference chart",function(){
        scope.section = {
            "type": "observationGraph",
            "name": "observationGraph",
            "title": "Growth Chart",
            "config": {
                "yAxisConcepts": ["Fever"],
                "referenceData": "growthChartReference.csv",
                "numberOfVisits": 20
            }
        };

        mockObservationService([]);
        mockConceptSetService({results:[{
            name:{name:"Fever"},
            lowNormal: 20,
            hiNormal: 30,
            datatype: {name: "N/A"}
        }]});

        compile(element)(scope);
        scope.$digest();
        var errorMsg = Bahmni.Clinical.Constants.errorMessages.conceptNotNumeric
            .replace(":conceptName","Fever")
            .replace(":placeErrorAccurred","Growth Chart config in growthChartReference.csv");
        expect(httpBackend.flush).toThrow(new Error(errorMsg));

    });
});
