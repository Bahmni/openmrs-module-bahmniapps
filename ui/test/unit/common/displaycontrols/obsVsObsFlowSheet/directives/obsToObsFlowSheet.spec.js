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

    beforeEach(module(function($provide){
        conceptSetUiConfigService = jasmine.createSpyObj('conceptSetUiConfigService',['getConfig']);
        $provide.value('conceptSetUiConfigService',conceptSetUiConfigService);
    }));

    beforeEach(module('bahmni.common.displaycontrol.obsVsObsFlowSheet'), function($provide){
        var _spinner = jasmine.createSpyObj('spinner',['forPromise','then']);
        _spinner.forPromise.and.callFake(function(){
            deferred = q.defer();
            deferred.resolve({data: dispositions});
            return deferred.promise;
        });

        _spinner.then.and.callThrough({data: dispositions});

        observationsService = jasmine.createSpyObj('observationsService',['getObsInFlowSheet', 'getTemplateDisplayName']);

        translate = jasmine.createSpyObj('$translate',['instant']);

        conceptSetService = jasmine.createSpyObj('conceptSetService',['getConcept']);

        $provide.value('observationsService', observationsService);
        $provide.value('conceptSetService',conceptSetService);
        $provide.value('spinner', _spinner);
    });

    beforeEach(inject(function ($compile, $httpBackend, $rootScope, $q) {
        compile = $compile;
        mockBackend = $httpBackend;
        rootScope = $rootScope;
        q = $q;
    }));

    it('should return the concept name when there is no abbreviation', function () {
        var scope = rootScope.$new();

        scope.isOnDashboard = true;
        scope.section = {
            "name": "obsToObsFlowSheet",
            "headingConceptSource":"Abbreviation",
            "dashboardParams": {
                "conceptNames": [
                    "Bacteriology, Rifampicin result",
                    "Bacteriology, Ethambutol result"
                ]
            }
        };

        scope.patient = {
            "uuid":"patientUuid"
        };

        mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&patientUuid=patientUuid').respond({});
        mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&v=custom:(uuid,names,displayString)').respond("<div>dummy</div>");

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        var conceptWithoutMappingAndShortName = {
            "uuid":"uuid",
            "shortName":"shortName"
        };

        expect(compiledElementScope.getAbbreviation(conceptWithoutMappingAndShortName)).toEqual("shortName");

        var conceptWithoutMappingAndName = {
            "uuid":"uuid",
            "name":"name"
        };

        expect(compiledElementScope.getAbbreviation(conceptWithoutMappingAndName)).toEqual("name");

        var conceptWithoutMappingAndBothFullNameAndShortName = {
            "uuid":"uuid",
            "name":"name",
            "shortName":"shortName"
        };

        expect(compiledElementScope.getAbbreviation(conceptWithoutMappingAndBothFullNameAndShortName)).toEqual("shortName");
    });

    it('should return the abbreviation given the concept name', function () {
        var scope = rootScope.$new();

        scope.isOnDashboard = true;
        scope.section = {
            "headingConceptSource":"Abbreviation",
            "dashboardParams": {
                "conceptNames": [
                    "Bacteriology, Rifampicin result",
                    "Bacteriology, Ethambutol result"
                ]
            }
        };

        scope.patient = {
            "uuid":"patientUuid"
        };

        mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&patientUuid=patientUuid').respond({});
        mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&v=custom:(uuid,names,displayString)').respond("<div>dummy</div>");

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        var conceptWithAbbreviation = {
            "uuid":"uuid",
            "shortName":"shortName",
            "mappings":[
                {
                    "source": "org.openmrs.module.bacteriology",
                    "name": "SPECIMEN COLLECTION DATE",
                    "code": "SPECIMEN_COLLECTION_DATE"
                },
                {
                    "source": "Abbreviation",
                    "name": "abbreviation",
                    "code": "SCD"
                }
            ]
        };

        expect(compiledElementScope.getAbbreviation(conceptWithAbbreviation)).toEqual("SCD");

        var conceptWithoutAbbreviationMapping = {
            "uuid":"uuid",
            "shortName":"shortName",
            "mappings":[
                {
                    "source": "org.openmrs.module.bacteriology",
                    "name": "SPECIMEN COLLECTION DATE",
                    "code": "SPECIMEN_COLLECTION_DATE"
                }
            ]
        };

        expect(compiledElementScope.getAbbreviation(conceptWithoutAbbreviationMapping)).toEqual("shortName");

    });

    it('should return the abbreviation from the provided heading source dictionary', function () {
        var scope = rootScope.$new();

        scope.isOnDashboard = true;
        scope.section = {
            "headingConceptSource":"CustomAbbreviationSource",
            "dashboardParams": {
                "conceptNames": [
                    "Bacteriology, Rifampicin result",
                    "Bacteriology, Ethambutol result"
                ]
            }
        };

        scope.patient = {
            "uuid":"patientUuid"
        };

        mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&patientUuid=patientUuid').respond({});
        mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&v=custom:(uuid,names,displayString)').respond("<div>dummy</div>");

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        var conceptWithAbbreviation = {
            "uuid":"uuid",
            "shortName":"shortName",
            "mappings":[
                {
                    "source": "org.openmrs.module.bacteriology",
                    "name": "SPECIMEN COLLECTION DATE",
                    "code": "SPECIMEN_COLLECTION_DATE"
                },
                {
                    "source": "CustomAbbreviationSource",
                    "name": "abbreviation",
                    "code": "SCD"
                }
            ]
        };

        expect(compiledElementScope.getAbbreviation(conceptWithAbbreviation)).toEqual("SCD");

    });

    it('should return the short name when headingConceptSource is not configured', function () {
        var scope = rootScope.$new();

        scope.isOnDashboard = true;
        scope.section = {
            "dashboardParams": {
                "conceptNames": [
                    "Bacteriology, Rifampicin result",
                    "Bacteriology, Ethambutol result"
                ]
            }
        };

        scope.patient = {
            "uuid":"patientUuid"
        };

        mockBackend.expectGET('/openmrs/ws/rest/v1/bahmnicore/observations/flowSheet?conceptNames=Bacteriology,+Rifampicin+result&conceptNames=Bacteriology,+Ethambutol+result&patientUuid=patientUuid').respond({});
        mockBackend.expectGET('/openmrs/ws/rest/v1/concept?s=byFullySpecifiedName&v=custom:(uuid,names,displayString)').respond("<div>dummy</div>");

        var element = compile(simpleHtml)(scope);

        scope.$digest();
        mockBackend.flush();

        var compiledElementScope = element.isolateScope();
        scope.$digest();

        var conceptWithAbbreviation = {
            "uuid":"uuid",
            "shortName":"shortName",
            "mappings":[
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

        expect(compiledElementScope.getAbbreviation(conceptWithAbbreviation)).toEqual("shortName");

    });

});

