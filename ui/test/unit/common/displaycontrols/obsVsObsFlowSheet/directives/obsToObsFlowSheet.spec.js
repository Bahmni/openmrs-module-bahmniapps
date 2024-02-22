'use strict';

describe('obsToObsFlowSheet DisplayControl', function () {
    var q,
        compile,
        mockBackend,
        rootScope,
        deferred,
        observationsService,
        conceptSetService,
        translate,
        conceptSetUiConfigService,
        simpleHtml = '<obs-to-obs-flow-sheet patient="patient" section="section" is-on-dashboard="true"></obs-to-obs-flow-sheet>';

    beforeEach(module('ngHtml2JsPreprocessor'));
    beforeEach(module('bahmni.common.uiHelper'));
    beforeEach(module('bahmni.common.i18n'));
    beforeEach(module('bahmni.clinical'));
    beforeEach(module('bahmni.common.conceptSet'));

    beforeEach(module(function ($provide) {
        conceptSetUiConfigService = jasmine.createSpyObj('conceptSetUiConfigService', ['getConfig']);
        $provide.value('conceptSetUiConfigService', conceptSetUiConfigService);
    }));

    beforeEach(module('bahmni.common.displaycontrol.obsVsObsFlowSheet'), function ($provide) {
        var _spinner = jasmine.createSpyObj('spinner', ['forPromise', 'then']);
        _spinner.forPromise.and.callFake(function () {
            deferred = q.defer();
            deferred.resolve({data: dispositions});
            return deferred.promise;
        });

        _spinner.then.and.callThrough({data: dispositions});

        observationsService = jasmine.createSpyObj('observationsService', ['getObsInFlowSheet', 'getTemplateDisplayName']);

        translate = jasmine.createSpyObj('$translate', ['instant']);

        conceptSetService = jasmine.createSpyObj('conceptSetService', ['getConcept']);

        $provide.value('observationsService', observationsService);
        $provide.value('conceptSetService', conceptSetService);
        $provide.value('spinner', _spinner);
    });

    beforeEach(inject(function ($compile, $httpBackend, $rootScope, $q) {
        compile = $compile;
        mockBackend = $httpBackend;
        rootScope = $rootScope;
        q = $q;
    }));

    describe('initialization', function() {
        it("should make the right http call as specified by its input", function() {
            var scope = rootScope.$new();

            scope.section = {
                "name": "obsToObsFlowSheet",
                "headingConceptSource": "Abbreviation",
                "dashboardConfig": {
                    "templateName": "TemplateName",
                    "conceptNames": [
                        "Bacteriology, Rifampicin result",
                        "Bacteriology, Ethambutol result"
                    ]
                }
            };

            scope.patient = {
                "uuid": "patientUuid"
            };

            scope.enrollment = "enrollmentUuid";

            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&conceptSet=TemplateName&enrollment=enrollmentUuid&patientUuid=patientUuid').respond({});
            mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=TemplateName&v=custom:(uuid,names,displayString)').respond("<div>dummy</div>");

            var html = '<obs-to-obs-flow-sheet patient="patient" section="section" is-on-dashboard="true" enrollment="enrollment"></obs-to-obs-flow-sheet>';

            var element = compile(html)(scope);

            scope.$digest();
            mockBackend.flush();

            element.isolateScope();
            scope.$digest();
        });

    });

    describe('getHeaderName ', function () {
        it('should return the concept name when there is no abbreviation and there is no short name and units not specified', function () {
            var scope = rootScope.$new();

            scope.isOnDashboard = true;
            scope.section = {
                "name": "obsToObsFlowSheet",
                "headingConceptSource": "Abbreviation",
                "dashboardConfig": {
                    "templateName": "TemplateName",
                    "conceptNames": [
                        "Bacteriology, Rifampicin result",
                        "Bacteriology, Ethambutol result"
                    ]
                }
            };

            scope.patient = {
                "uuid": "patientUuid"
            };

            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&conceptSet=TemplateName&patientUuid=patientUuid').respond({});
            mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=TemplateName&v=custom:(uuid,names,displayString)').respond("<div>dummy</div>");

            var element = compile(simpleHtml)(scope);

            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            var conceptWithoutMappingAndShortName = {
                "uuid": "uuid",
                "name": "name"
            };

            expect(compiledElementScope.getHeaderName(conceptWithoutMappingAndShortName)).toEqual("name");
        });

        it('should return the concept short name when there is no abbreviation and there is short name available', function () {
            var scope = rootScope.$new();

            scope.isOnDashboard = true;
            scope.section = {
                "headingConceptSource": "Abbreviation",
               "dashboardConfig": {
                    "templateName": "TemplateName",
                    "conceptNames": [
                        "Bacteriology, Rifampicin result",
                        "Bacteriology, Ethambutol result"
                    ]
                }
            };

            scope.patient = {
                "uuid": "patientUuid"
            };

            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&conceptSet=TemplateName&patientUuid=patientUuid').respond({});
            mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=TemplateName&v=custom:(uuid,names,displayString)').respond("<div>dummy</div>");

            var element = compile(simpleHtml)(scope);

            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            var conceptWithAbbreviation = {
                "uuid": "uuid",
                "shortName": "shortName",
                "name": "name"
            };

            expect(compiledElementScope.getHeaderName(conceptWithAbbreviation)).toEqual("shortName");
        });

        it('should return abbreviation if the concept have it and if it is configured and units not specified', function () {
            var scope = rootScope.$new();

            scope.isOnDashboard = true;
            scope.section = {
                "headingConceptSource": "CustomAbbreviationSource",
               "dashboardConfig": {
                    "templateName": "TemplateName",
                    "conceptNames": [
                        "Bacteriology, Rifampicin result",
                        "Bacteriology, Ethambutol result"
                    ]
                }
            };

            scope.patient = {
                "uuid": "patientUuid"
            };

            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&conceptSet=TemplateName&patientUuid=patientUuid').respond({});
            mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=TemplateName&v=custom:(uuid,names,displayString)').respond("<div>dummy</div>");

            var element = compile(simpleHtml)(scope);

            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            var conceptWithAbbreviation = {
                "uuid": "uuid",
                "shortName": "shortName",
                "mappings": [
                    {
                        "source": "CustomAbbreviationSource",
                        "name": "abbreviation",
                        "code": "SCD"
                    }
                ]
            };

            expect(compiledElementScope.getHeaderName(conceptWithAbbreviation)).toEqual("SCD");

        });

        it('should return the abbreviation name with units if units are specified', function () {
            var scope = rootScope.$new();

            scope.isOnDashboard = true;
            scope.section = {
                "headingConceptSource": "CustomAbbreviationSource",
               "dashboardConfig": {
                    "templateName": "TemplateName",
                    "conceptNames": [
                        "Bacteriology, Rifampicin result",
                        "Bacteriology, Ethambutol result"
                    ]
                }
            };

            scope.patient = {
                "uuid": "patientUuid"
            };

            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&conceptSet=TemplateName&patientUuid=patientUuid').respond({});
            mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=TemplateName&v=custom:(uuid,names,displayString)').respond("<div>dummy</div>");

            var element = compile(simpleHtml)(scope);

            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            var conceptWithAbbreviation = {
                "uuid": "uuid",
                "shortName": "shortName",
                "units": "mg",
                "mappings": [
                    {
                        "source": "CustomAbbreviationSource",
                        "name": "abbreviation",
                        "code": "SCD"
                    }
                ]
            };

            expect(compiledElementScope.getHeaderName(conceptWithAbbreviation)).toEqual("SCD (mg)");
        });

        it('should return the short name when headingConceptSource is not configured', function () {
            var scope = rootScope.$new();

            scope.isOnDashboard = true;
            scope.section = {
               "dashboardConfig": {
                    "templateName": "TemplateName",
                    "conceptNames": [
                        "Bacteriology, Rifampicin result",
                        "Bacteriology, Ethambutol result"
                    ]
                }
            };

            scope.patient = {
                "uuid": "patientUuid"
            };

            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&conceptSet=TemplateName&patientUuid=patientUuid').respond({});
            mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=TemplateName&v=custom:(uuid,names,displayString)').respond("<div>dummy</div>");

            var element = compile(simpleHtml)(scope);

            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            var conceptWithAbbreviation = {
                "uuid": "uuid",
                "shortName": "shortName",
                "mappings": [
                    {
                        "source": "org.openmrs.module.bacteriology",
                        "name": "SPECIMEN COLLECTION DATE",
                        "code": "SPECIMEN_COLLECTION_DATE"
                    },
                    {
                        "source": "Abbrevation",
                        "name": "abbreviation",
                        "code": "SCD"
                    }
                ]
            };

            expect(compiledElementScope.getHeaderName(conceptWithAbbreviation)).toEqual("shortName");

        });
        it('should return the shortname with units if abbreviation is not specifed and units are specified ', function () {
            var scope = rootScope.$new();

            scope.isOnDashboard = true;
            scope.section = {
               "dashboardConfig": {
                    "templateName": "TemplateName",
                    "conceptNames": [
                        "Bacteriology, Rifampicin result",
                        "Bacteriology, Ethambutol result"
                    ]
                }
            };

            scope.patient = {
                "uuid": "patientUuid"
            };

            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&conceptSet=TemplateName&patientUuid=patientUuid').respond({});
            mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=TemplateName&v=custom:(uuid,names,displayString)').respond("<div>dummy</div>");

            var element = compile(simpleHtml)(scope);

            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            var conceptWithAbbreviation = {
                "uuid": "uuid",
                "shortName": "shortName",
                "units": "mg"
            };

            expect(compiledElementScope.getHeaderName(conceptWithAbbreviation)).toEqual("shortName (mg)");
        });

        it('should return the full specified Name with units if abbreviation and shortName are not specifed and units are specified ', function () {
            var scope = rootScope.$new();

            scope.isOnDashboard = true;
            scope.section = {
               "dashboardConfig": {
                    "templateName": "TemplateName",
                    "conceptNames": [
                        "Bacteriology, Rifampicin result",
                        "Bacteriology, Ethambutol result"
                    ]
                }
            };

            scope.patient = {
                "uuid": "patientUuid"
            };

            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&conceptSet=TemplateName&patientUuid=patientUuid').respond({});
            mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=TemplateName&v=custom:(uuid,names,displayString)').respond("<div>dummy</div>");

            var element = compile(simpleHtml)(scope);

            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            var conceptWithAbbreviation = {
                "uuid": "uuid",
                "name": "fullName",
                "units": "mg"
            };

            expect(compiledElementScope.getHeaderName(conceptWithAbbreviation)).toEqual("fullName (mg)");
        });



    });

    describe('commafy ', function () {
        it('should return the values in comma seperated if there are multiple values', function () {
            var scope = rootScope.$new();

            scope.isOnDashboard = true;
            scope.section = {
                "name": "obsToObsFlowSheet",
                "headingConceptSource": "Abbreviation",
               "dashboardConfig": {
                    "templateName": "TemplateName",
                    "conceptNames": [
                        "Bacteriology, Rifampicin result",
                        "Bacteriology, Ethambutol result"
                    ]
                }
            };

            scope.patient = {
                "uuid": "patientUuid"
            };

            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&conceptSet=TemplateName&patientUuid=patientUuid').respond({});
            mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=TemplateName&v=custom:(uuid,names,displayString)').respond("<div>dummy</div>");

            var element = compile(simpleHtml)(scope);

            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            var observations = [
                {
                    concept: {
                        dataType: 'Numeric'
                    },
                    value: 7.2
                }, {
                    concept: {
                        dataType: 'Numeric'
                    },
                    value: 9.3
                }
            ];

            expect(compiledElementScope.commafy(observations)).toEqual("7.2, 9.3");
        });

        it('should return the values in by custom delimiter if specified and there are multiple values', function () {
            var scope = rootScope.$new();

            scope.isOnDashboard = true;
            scope.section = {
                "name": "obsToObsFlowSheet",
                "headingConceptSource": "Abbreviation",
               "dashboardConfig": {
                    "templateName": "TemplateName",
                    "conceptNames": [
                        "Bacteriology, Rifampicin result",
                        "Bacteriology, Ethambutol result"
                    ],
                    "obsDelimiter": ":"
                }
            };

            scope.patient = {
                "uuid": "patientUuid"
            };

            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&conceptSet=TemplateName&patientUuid=patientUuid').respond({});
            mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=TemplateName&v=custom:(uuid,names,displayString)').respond("<div>dummy</div>");

            var element = compile(simpleHtml)(scope);

            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            var observations = [
                {
                    concept: {
                        dataType: 'Numeric'
                    },
                    value: 7.2
                }, {
                    concept: {
                        dataType: 'Numeric'
                    },
                    value: 9.3
                }
            ];

            expect(compiledElementScope.commafy(observations)).toEqual("7.2:9.3");
        });


        it('should return just the value if there is only one value', function () {
            var scope = rootScope.$new();

            scope.isOnDashboard = true;
            scope.section = {
                "headingConceptSource": "Abbreviation",
               "dashboardConfig": {
                    "templateName": "TemplateName",
                    "conceptNames": [
                        "Bacteriology, Rifampicin result",
                        "Bacteriology, Ethambutol result"
                    ]
                }
            };

            scope.patient = {
                "uuid": "patientUuid"
            };

            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&conceptSet=TemplateName&patientUuid=patientUuid').respond({});
            mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=TemplateName&v=custom:(uuid,names,displayString)').respond("<div>dummy</div>");

            var element = compile(simpleHtml)(scope);

            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            var observations = [
                {
                    concept: {
                        dataType: 'Numeric'
                    },
                    value: 7.2
                }
            ];

            expect(compiledElementScope.commafy(observations)).toEqual("7.2");
        });

        it('should return yes/no if the concept is boolean', function () {
            var scope = rootScope.$new();

            scope.isOnDashboard = true;
            scope.section = {
                "headingConceptSource": "CustomAbbreviationSource",
               "dashboardConfig": {
                    "templateName": "TemplateName",
                    "conceptNames": [
                        "Bacteriology, Rifampicin result",
                        "Bacteriology, Ethambutol result"
                    ]
                }
            };

            scope.patient = {
                "uuid": "patientUuid"
            };

            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&conceptSet=TemplateName&patientUuid=patientUuid').respond({});
            mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=TemplateName&v=custom:(uuid,names,displayString)').respond("<div>dummy</div>");

            var element = compile(simpleHtml)(scope);

            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            var observations = [
                {
                    concept: {
                        dataType: 'Boolean'
                    },
                    value: true
                }
            ];

            expect(compiledElementScope.commafy(observations)).toEqual("OBS_BOOLEAN_YES_KEY");
        });

        it('should return date if the concept datatype is date and not configured to show month and year', function () {
            var scope = rootScope.$new();

            scope.isOnDashboard = true;
            scope.section = {
               "dashboardConfig": {
                    "templateName": "TemplateName",
                    "conceptNames": [
                        "Bacteriology, Rifampicin result",
                        "Bacteriology, Ethambutol result"
                    ]
                }
            };

            scope.patient = {
                "uuid": "patientUuid"
            };

            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&conceptSet=TemplateName&patientUuid=patientUuid').respond({});
            mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=TemplateName&v=custom:(uuid,names,displayString)').respond("<div>dummy</div>");

            var element = compile(simpleHtml)(scope);

            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            var observations = [
                {
                    concept: {
                        dataType: 'Date'
                    },
                    value: '10/10/2015',
                    observationDateTime: new Date("10/10/2015")
                }
            ];

            expect(compiledElementScope.commafy(observations)).toEqual("10 Oct 2015");
        });

        it('should return just month and year if the concept datatype is date and configured to show month and year', function () {
            conceptSetUiConfigService.getConfig.and.callFake(function () {
                return {
                    ConceptName: {
                        displayMonthAndYear: true
                    }
                }
            });

            var scope = rootScope.$new();

            scope.isOnDashboard = true;
            scope.section = {
               "dashboardConfig": {
                    "templateName": "TemplateName",
                    "conceptNames": [
                        "Bacteriology, Rifampicin result",
                        "Bacteriology, Ethambutol result"
                    ]
                }
            };

            scope.patient = {
                "uuid": "patientUuid"
            };

            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&conceptSet=TemplateName&patientUuid=patientUuid').respond({});
            mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=TemplateName&v=custom:(uuid,names,displayString)').respond("<div>dummy</div>");

            var element = compile(simpleHtml)(scope);

            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            var observations = [
                {
                    concept: {
                        name: "ConceptName",
                        dataType: 'Date'
                    },
                    value: '10/10/2015',
                    observationDateTime: new Date("10/10/2015")
                }
            ];

            expect(compiledElementScope.commafy(observations)).toEqual("Oct 2015");
        });

        it('should return abbreviation of the coded answer if the concept is coded and configured to show abbreviation', function () {
            var scope = rootScope.$new();

            scope.isOnDashboard = true;
            scope.section = {
                "dataConceptSource": "Abbreviation",
               "dashboardConfig": {
                    "templateName": "TemplateName",
                    "conceptNames": [
                        "Bacteriology, Rifampicin result",
                        "Bacteriology, Ethambutol result"
                    ]
                }
            };

            scope.patient = {
                "uuid": "patientUuid"
            };

            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&conceptSet=TemplateName&patientUuid=patientUuid').respond({});
            mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=TemplateName&v=custom:(uuid,names,displayString)').respond("<div>dummy</div>");

            var element = compile(simpleHtml)(scope);

            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            var observations = [
                {
                    concept: {
                        name: "ConceptName",
                        dataType: 'Coded'
                    },
                    value: {
                        "name": "Answer1",
                        "shortName": "Ans1",
                        "mappings": [
                            {
                                "source": "Abbreviation",
                                "name": "abbreviation",
                                "code": "A1"
                            }
                        ]
                    }
                }
            ];

            expect(compiledElementScope.commafy(observations)).toEqual("A1");
        });

        it('should return shortName of the coded answer if the concept is coded and not configured to show abbreviation', function () {
            var scope = rootScope.$new();

            scope.isOnDashboard = true;
            scope.section = {
               "dashboardConfig": {
                    "templateName": "TemplateName",
                    "conceptNames": [
                        "Bacteriology, Rifampicin result",
                        "Bacteriology, Ethambutol result"
                    ]
                }
            };

            scope.patient = {
                "uuid": "patientUuid"
            };

            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&conceptSet=TemplateName&patientUuid=patientUuid').respond({});
            mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=TemplateName&v=custom:(uuid,names,displayString)').respond("<div>dummy</div>");

            var element = compile(simpleHtml)(scope);

            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            var observations = [
                {
                    concept: {
                        name: "ConceptName",
                        dataType: 'Coded'
                    },
                    value: {
                        "name": "Answer1",
                        "shortName": "Ans1",
                        "mappings": [
                            {
                                "source": "Abbreviation",
                                "name": "abbreviation",
                                "code": "A1"
                            }
                        ]
                    }
                }
            ];

            expect(compiledElementScope.commafy(observations)).toEqual("Ans1");
        });

        it('should return name of the coded answer if the concept is coded and not configured to show abbreviation and no shortname for the concept', function () {
            var scope = rootScope.$new();

            scope.isOnDashboard = true;
            scope.section = {
               "dashboardConfig": {
                    "templateName": "TemplateName",
                    "conceptNames": [
                        "Bacteriology, Rifampicin result",
                        "Bacteriology, Ethambutol result"
                    ]
                }
            };

            scope.patient = {
                "uuid": "patientUuid"
            };

            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&conceptSet=TemplateName&patientUuid=patientUuid').respond({});
            mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=TemplateName&v=custom:(uuid,names,displayString)').respond("<div>dummy</div>");

            var element = compile(simpleHtml)(scope);

            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            var observations = [
                {
                    concept: {
                        name: "ConceptName",
                        dataType: 'Coded'
                    },
                    value: {
                        "name": "Answer1",
                        "mappings": [
                            {
                                "source": "Abbreviation",
                                "name": "abbreviation",
                                "code": "A1"
                            }
                        ]
                    }
                }
            ];

            expect(compiledElementScope.commafy(observations)).toEqual("Answer1");
        });
    });

    describe('getEditObsData', function(){
        it('should construct object with formDetails when formName is given', function () {
            var scope = rootScope.$new();
            scope.isOnDashboard = true;
            scope.section = {
                "dashboardConfig": {
                    "formNames": ["formName"],
                    "conceptNames": [
                        "Bacteriology, Rifampicin result",
                        "Bacteriology, Ethambutol result"
                    ]
                }
            };
            scope.patient = {
                "uuid": "patientUuid"
            };
            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&formNames=formName&patientUuid=patientUuid').respond({});

            var element = compile(simpleHtml)(scope);

            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            var observation =
                {
                    encounterUuid: "encounteruuid",
                    concept: {
                        name: "ConceptName",
                        dataType: 'Coded'
                    },
                    value: {
                        "name": "Answer1",
                        "mappings": [
                            {
                                "source": "Abbreviation",
                                "name": "abbreviation",
                                "code": "A1"
                            }
                        ]
                    },
                    formFieldPath: "formName.1/1-0"
                };

            var editData = compiledElementScope.getEditObsData(observation);
            expect(editData.observation.encounterUuid).toBe("encounteruuid");
            expect(editData.observation.formType).toBe("v2");
            expect(editData.observation.formName).toBe("formName");
            expect(editData.observation.formVersion).toBe("1");
        });

        it('should construct object with formDetails when formName is given', function () {
            var scope = rootScope.$new();
            scope.isOnDashboard = true;
            scope.section = {
                "dashboardConfig": {
                    "templateName": "templateName",
                    "conceptNames": [
                        "Bacteriology, Rifampicin result",
                        "Bacteriology, Ethambutol result"
                    ]
                }
            };
            scope.patient = {
                "uuid": "patientUuid"
            };

            mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&conceptSet=templateName&patientUuid=patientUuid').respond({});
            mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&name=templateName&v=custom:(uuid,names,displayString)')
                .respond({"results":[{"uuid":"uuid","names":[{"display":"TemplateName","uuid":"uuid1","name":"TemplateName"}],"displayString":"MD, Medication"}]});
            var element = compile(simpleHtml)(scope);

            scope.$digest();
            mockBackend.flush();

            var compiledElementScope = element.isolateScope();
            scope.$digest();

            var observation =
                {
                    encounterUuid: "encounteruuid",
                    obsGroupUuid: "obsGroupUuid",
                    concept: {
                        name: "ConceptName",
                        dataType: 'Coded'
                    },
                    value: {
                        "name": "Answer1",
                        "mappings": [
                            {
                                "source": "Abbreviation",
                                "name": "abbreviation",
                                "code": "A1"
                            }
                        ]
                    }
                };

            var editData = compiledElementScope.getEditObsData(observation);
            expect(editData.observation.encounterUuid).toBe("encounteruuid");
            expect(editData.observation.uuid).toBe("obsGroupUuid");
            expect(editData.conceptSetName).toBe("templateName");
            expect(editData.conceptDisplayName).toBe("TemplateName");
        });
    })
});

