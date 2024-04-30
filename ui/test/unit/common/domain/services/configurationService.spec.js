'use strict';

describe('configurationService', function () {


    var _$http;
    var rootScope;
    beforeEach(module('bahmni.common.domain'));

    beforeEach(module(function ($provide) {
        _$http = jasmine.createSpyObj('$http', ['get']);
        _$http.get.and.callFake(function (url) {
            return specUtil.respondWith({data: "success"});
        });

        $provide.value('$http', _$http);
        $provide.value('$q', Q);
    }));

    var configurationservice;

    beforeEach(inject(function (_$rootScope_, _configurationService_) {
        rootScope = _$rootScope_;
        configurationservice = _configurationService_;
    }));

    it('should fetch encounterConfig from backend', function () {
        configurationservice.getConfigurations(['encounterConfig'])
        expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.encounterConfigurationUrl);
        expect(_$http.get.calls.mostRecent().args[1].params.callerContext).toEqual("REGISTRATION_CONCEPTS");
    });

    it('should fetch patientConfig from backend', function () {
        configurationservice.getConfigurations(['patientConfig'])
        expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.patientConfigurationUrl);
    });

    it('should fetch patientAttributesConfig from backend', function () {
        configurationservice.getConfigurations(['patientAttributesConfig'])
        expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.personAttributeTypeUrl);
        expect(_$http.get.calls.mostRecent().args[1].params.v).toEqual("custom:(uuid,name,sortWeight,description,format,concept)");
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

    it('should fetch identifierTypesConfig from backend', function () {
        configurationservice.getConfigurations(['identifierTypesConfig'])
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

    it('should fetch quickLogoutComboKey from backend', function () {
        configurationservice.getConfigurations(['quickLogoutComboKey']);
        expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.globalPropertyUrl);
        expect(_$http.get.calls.mostRecent().args[1].params.property).toEqual("bahmni.quickLogoutComboKey");
    });

    it('should fetch contextCookieExpirationTimeInMinutes from backend', function () {
        configurationservice.getConfigurations(['contextCookieExpirationTimeInMinutes']);
        expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.globalPropertyUrl);
        expect(_$http.get.calls.mostRecent().args[1].params.property).toEqual("bahmni.contextCookieExpirationTimeInMinutes");
    });

    it('should fetch loginLocationToVisitTypeMapping from backend', function () {
        configurationservice.getConfigurations(['loginLocationToVisitTypeMapping'])
        expect(_$http.get.calls.mostRecent().args[0]).toEqual(Bahmni.Common.Constants.entityMappingUrl);
        expect(_$http.get.calls.mostRecent().args[1].params.mappingType).toEqual("loginlocation_visittype");
        expect(_$http.get.calls.mostRecent().args[1].params.s).toEqual("byEntityAndMappingType");
    });
});
