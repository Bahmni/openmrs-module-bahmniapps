'use strict';

describe('configurationService', function () {

    var _$http;
    var rootScope;
    var offlineService;
    var offlineDbService;
    var $q= Q;

    beforeEach(module('bahmni.common.domain.offline'));
    beforeEach(module('bahmni.common.offline'));


    beforeEach(module(function ($provide) {
        _$http = jasmine.createSpyObj('$http', ['get']);
        _$http.get.and.callFake(function (url) {
            return specUtil.respondWith({data: "success"});
        });
        offlineService = jasmine.createSpyObj('offlineService',['isOfflineApp', 'isAndroidApp']);
        offlineDbService = jasmine.createSpyObj('offlineDbService',['getReferenceData']);
        $provide.value('$http', _$http);
        $provide.value('$q', $q);
        $provide.value('offlineService', offlineService);
        $provide.value('offlineDbService', offlineDbService);
    }));

    var configurationservice;

    beforeEach(inject(function (_$rootScope_, _configurationService_) {
        rootScope = _$rootScope_;
        configurationservice = _configurationService_;

    }));

    it('should fetch encounterConfig from love field database', function (done) {
        var encounterConfig = {
            "value": {
                "visitTypes": {
                    "emergency": "d77c4b69-7d55-11e5-acdf-90fba67c4298",
                    "inpatient": "d5d88349-7d55-11e5-acdf-90fba67c4298",
                    "outpatient": "d5f34f04-7d55-11e5-acdf-90fba67c4298"
                }
            }
        };
        offlineService.isAndroidApp.and.returnValue(false);
        offlineService.isOfflineApp.and.returnValue(true);
        offlineDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, encounterConfig));

        configurationservice.getConfigurations(['encounterConfig']).then(function(result){
            expect(result.encounterConfig.visitTypes).toBe(encounterConfig.value.visitTypes);
            done();
        });
    });

    it('should fetch encounterConfig from backend', function () {
        offlineService.isAndroidApp.and.returnValue(false);
        offlineService.isOfflineApp.and.returnValue(false);
        configurationservice.getConfigurations(['encounterConfig']);
        expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.encounterConfigurationUrl);
        expect(_$http.get.calls.mostRecent().args[1].params.callerContext).toEqual("REGISTRATION_CONCEPTS");
    });


    it('should fetch patientAttributesConfig from backend', function (done) {

        var patientAttributesConfig = {
            "value": {
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
        offlineService.isAndroidApp.and.returnValue(false);
        offlineService.isOfflineApp.and.returnValue(true);
        offlineDbService.getReferenceData.and.returnValue(specUtil.respondWithPromise($q, patientAttributesConfig));
        configurationservice.getConfigurations(['patientAttributesConfig']).then(function(result){
            expect(result.patientAttributesConfig.results.length).toBe(2);
            expect(result.patientAttributesConfig.results[0].name).toBe("fatherName");
            done();
        });

    });

    it('should fetch patientAttributesConfig from backend', function () {
        offlineService.isAndroidApp.and.returnValue(false);
        offlineService.isOfflineApp.and.returnValue(false);
        configurationservice.getConfigurations(['patientAttributesConfig']);
        expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.personAttributeTypeUrl);
        expect(_$http.get.calls.mostRecent().args[1].params.v).toEqual("custom:(uuid,name,sortWeight,description,format,concept)");
    });

    it('should fetch patientConfig from backend', function () {
        configurationservice.getConfigurations(['patientConfig'])
        expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.patientConfigurationUrl);
    });


    it('should fetch dosageFrequencyConfig from backend', function () {
        configurationservice.getConfigurations(['dosageFrequencyConfig'])
        expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.conceptSearchByFullNameUrl);
        expect(_$http.get.calls.mostRecent().args[1].params.name).toEqual(Bahmni.Common.Constants.dosageFrequencyConceptName);
        expect(_$http.get.calls.mostRecent().args[1].params.v).toEqual("custom:(uuid,name,answers)");
    });

    it('should fetch dosageInstructionConfig from backend', function () {
        configurationservice.getConfigurations(['dosageInstructionConfig'])
        expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.conceptSearchByFullNameUrl);
        expect(_$http.get.calls.mostRecent().args[1].params.name).toEqual(Bahmni.Common.Constants.dosageInstructionConceptName);
        expect(_$http.get.calls.mostRecent().args[1].params.v).toEqual("custom:(uuid,name,answers)");
    });

    it('should fetch stoppedOrderReasonConfig from backend', function () {
        configurationservice.getConfigurations(['stoppedOrderReasonConfig'])
        expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.conceptSearchByFullNameUrl);
        expect(_$http.get.calls.mostRecent().args[1].params.name).toEqual(Bahmni.Common.Constants.stoppedOrderReasonConceptName);
        expect(_$http.get.calls.mostRecent().args[1].params.v).toEqual("custom:(uuid,name,answers)");
    });

    it('should fetch consultationNoteConfig from backend', function () {
        configurationservice.getConfigurations(['consultationNoteConfig'])
        expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.conceptSearchByFullNameUrl);
        expect(_$http.get.calls.mostRecent().args[1].params.name).toEqual(Bahmni.Common.Constants.consultationNoteConceptName);
        expect(_$http.get.calls.mostRecent().args[1].params.v).toEqual("custom:(uuid,name,answers)");
    });

    it('should fetch radiologyObservationConfig from backend', function () {
        configurationservice.getConfigurations(['radiologyObservationConfig'])
        expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.conceptSearchByFullNameUrl);
        expect(_$http.get.calls.mostRecent().args[1].params.name).toEqual(Bahmni.Common.Constants.radiologyResultConceptName);
        expect(_$http.get.calls.mostRecent().args[1].params.v).toEqual("custom:(uuid,name)");
    });

    it('should fetch labOrderNotesConfig from backend', function () {
        configurationservice.getConfigurations(['labOrderNotesConfig'])
        expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.conceptSearchByFullNameUrl);
        expect(_$http.get.calls.mostRecent().args[1].params.name).toEqual(Bahmni.Common.Constants.labOrderNotesConcept);
        expect(_$http.get.calls.mostRecent().args[1].params.v).toEqual("custom:(uuid,name)");
    });

    it('should fetch radiologyImpressionConfig from backend', function () {
        configurationservice.getConfigurations(['radiologyImpressionConfig'])
        expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.conceptSearchByFullNameUrl);
        expect(_$http.get.calls.mostRecent().args[1].params.name).toEqual(Bahmni.Common.Constants.impressionConcept);
        expect(_$http.get.calls.mostRecent().args[1].params.v).toEqual("custom:(uuid,name)");
    });

    it('should fetch addressLevels from backend', function () {
        configurationservice.getConfigurations(['addressLevels'])
        expect(_$http.get.calls.mostRecent().args[0]).toEqual("/openmrs/module/addresshierarchy/ajax/getOrderedAddressHierarchyLevels.form");
    });

    it('should fetch allTestsAndPanelsConcept from backend', function () {
        configurationservice.getConfigurations(['allTestsAndPanelsConcept'])
        expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.conceptSearchByFullNameUrl);
        expect(_$http.get.calls.mostRecent().args[1].params.name).toEqual(Bahmni.Common.Constants.allTestsAndPanelsConceptName);
        expect(_$http.get.calls.mostRecent().args[1].params.v).toEqual("custom:(uuid,name:(uuid,name),setMembers:(uuid,name:(uuid,name)))");
    });

    it('should fetch identifierSourceConfig from backend', function () {
        configurationservice.getConfigurations(['identifierSourceConfig'])
        expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.idgenConfigurationURL);
    });

    it('should fetch relationshipTypes from backend', function () {
        configurationservice.getConfigurations(['relationshipTypeConfig'])
        expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.relationshipTypesUrl);
        expect(_$http.get.calls.mostRecent().args[1].params.v).toEqual("custom:(aIsToB,bIsToA,uuid)");
    });

    it('should fetch genderMap from backend', function () {
        configurationservice.getConfigurations(['genderMap'])
        expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.globalPropertyUrl);
        expect(_$http.get.calls.mostRecent().args[1].params.property).toEqual("mrs.genders");
    });

    it('should fetch loginLocationToVisitTypeMapping from backend', function () {
        configurationservice.getConfigurations(['loginLocationToVisitTypeMapping'])
        expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.entityMappingUrl);
        expect(_$http.get.calls.mostRecent().args[1].params.mappingType).toEqual("loginlocation_visittype");
        expect(_$http.get.calls.mostRecent().args[1].params.s).toEqual("byEntityAndMappingType");
    });
});