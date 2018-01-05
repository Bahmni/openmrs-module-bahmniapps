'use strict';

describe("Patient Profile display control", function () {
    var element, scope, $compile, mockBackend, $window, $q, openMRSPatientMockData, visitService, translateFilter;

    beforeEach(module('ngHtml2JsPreprocessor'));
    beforeEach(module('bahmni.common.patient'));
    beforeEach(module('bahmni.common.uiHelper'));
    beforeEach(module('bahmni.common.displaycontrol.patientprofile'));
    beforeEach(module(function ($provide) {
        translateFilter = jasmine.createSpy('translateFilter');
        $provide.value('translateFilter', translateFilter);

        $provide.value('$stateParams', {configName: "programs"});

        $window = jasmine.createSpyObj('$window', ['open']);
        $window.open.and.callFake(function (param) {
            return true;
        });
        $provide.value('$window', $window);

        var $translate = jasmine.createSpyObj('$translate', ['']);
        $provide.value('$translate', $translate);

        var configurations = jasmine.createSpyObj('configurations', ['patientConfig']);
        var patientConfigMockData = {};
        configurations.patientConfig.and.returnValue(patientConfigMockData);
        $provide.value('configurations', configurations);

        visitService = jasmine.createSpyObj('visitService', ['getVisit']);
        $provide.value('visitService', visitService);

        var patientService = jasmine.createSpyObj('patientService', ['getRelationships', 'getPatient']);
        patientService.getRelationships.and.callFake(function (param) {
            return specUtil.respondWithPromise($q, {data: {results: []}});
        });
        openMRSPatientMockData = {};
        patientService.getPatient.and.callFake(function () {
            return specUtil.respondWithPromise($q, {data: openMRSPatientMockData});
        });
        $provide.value('patientService', patientService);

        var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        spinner.forPromise.and.callFake(function (param) {
            return specUtil.respondWithPromise($q, {data: {}});
        });
        $provide.value('spinner', spinner);

    }));

    beforeEach(inject(function (_$compile_, $rootScope, _$q_, $httpBackend) {
        scope = $rootScope;
        $compile = _$compile_;
        mockBackend = $httpBackend;
        $q = _$q_;
        mockBackend.expectGET('/openmrs/ws/rest/v1/relationship?v=full').respond([]);
    }));

    /*Mock of constructor Bahmni.PatientMapper*/
    var originalPatientMapper, spyPatientMapperInstance;
    beforeEach(function () {
        spyPatientMapperInstance = jasmine.createSpyObj('PatientMapperInstance', ['map']);
        originalPatientMapper = Bahmni.PatientMapper;
        Bahmni.PatientMapper = function () {
            return spyPatientMapperInstance;
        };
    });
    afterEach(function () {
        Bahmni.PatientMapper = originalPatientMapper;
    });
    /*********/

    var patientMockData;
    beforeEach(function () {
        patientMockData = {
            "name": "Patient name",
            "genderText": "Female",
            "identifier": "Some identifier",
            "ageText": "21 years",
            "address": {
                address1: 'Address',
                address2: null,
                cityVillage: 'Some village',
                state: "State",
                zip: ''
            }
        };
        spyPatientMapperInstance.map.and.returnValue(patientMockData);
    });

    it("should get patient address with cityVillage when addressField is not specified in config", function () {
        var config = {
            "title": "Patient Information",
            "name": "patientInformation",
            "patientAttributes": ["caste", "class", "education", "occupation"]
        };
        var isolatedScope = createIsoScope(config);
        expect(isolatedScope.addressLine).toBe("Some village");
    });

    it("should get patient name, age, gender, identifier and address even though config is empty", function () {
        var isoScope = createIsoScope({});
        var patientAttributeTypes = isoScope.patientAttributeTypes;
        expect(patientAttributeTypes.$$unwrapTrustedValue()).toBe("Female, 21 years");
    });

    it("should open patient dashboard with correct config Name", function () {
        var isoScope = createIsoScope({});
        isoScope.openPatientDashboard('1234');
        expect($window.open).toHaveBeenCalledWith("../clinical/#/programs/patient/1234/dashboard");
    });

    it("should also get patient blood group attribute if it is directly specified", function () {
        patientMockData.bloodGroupText = "AB+";
        var isoScope = createIsoScope({});
        var patientAttributeTypes = isoScope.patientAttributeTypes;
        expect(patientAttributeTypes.$$unwrapTrustedValue()).toBe("Female, 21 years, AB+");
    });

    it("should get patient address in the order of config specified", function () {
        var config = {
            "title": "Patient Information",
            "name": "patientInformation",
            "addressFields": ["address1", "cityVillage", "state", "zip"]
        };
        var isoScope = createIsoScope(config);
        expect(isoScope.addressLine).toBe("Address, Some village, State");
    });

    it("should return false if the relationshipTypeMap.provider object is empty", function () {
        scope.relationshipTypeMap = {};
        var isoScope = createIsoScope({});
        expect(isoScope.isProviderRelationship({relationshipType: {aIsToB: "Parent"}})).toBeFalsy();
    });

    it("should return true if the relationship is provider", function () {
        scope.relationshipTypeMap = {"provider": ["Doctor"]};
        var isoScope = createIsoScope({});
        expect(isoScope.isProviderRelationship({relationshipType: {aIsToB: "Doctor"}})).toBeTruthy();
    });

    it("should return false if the relationship is patient", function () {
        scope.relationshipTypeMap = {"provider": ["Doctor"]};
        var isoScope = createIsoScope({});
        expect(isoScope.isProviderRelationship({relationshipType: {aIsToB: "Patient"}})).toBeFalsy();
    });

    it("should return false if showDOB configured false", function () {
        var config = {
            "title": "Patient Information",
            "name": "patientInformation",
            "showDOB": false
        };
        var isoScope = createIsoScope(config);
        expect(isoScope.showBirthDate).toBeFalsy();
    });

    it("should return true by default if showDOB is undefined", function () {
        var config = {
            "title": "Patient Information",
            "name": "patientInformation"
        };
        patientMockData.birthdate = "20 Jun 15";
        var isoScope = createIsoScope(config);
        expect(isoScope.showBirthDate).toBeTruthy();
    });

    it("should get admission status when visit uuid is given", function () {
        var isoScope = createIsoScope({});
        expect(isoScope.hasBeenAdmitted).toBe(undefined);

        isoScope.visitUuid = "visit-uuid-00001";
        var ADMISSION_STATUS_ATTRIBUTE = "Admission Status";
        var attributes = [
            {value:"Admitted",attributeType:{name:ADMISSION_STATUS_ATTRIBUTE}},
            {attributeType:{name:"IPD"}},
            {attributeType:{name:"OPD"}}
        ];
        visitService.getVisit.and.returnValue(specUtil.respondWithPromise($q, {data: {attributes: attributes}}));
        isoScope.$apply();

        var REP = "custom:(attributes:(value,attributeType:(display,name)))";
        expect(visitService.getVisit).toHaveBeenCalledWith("visit-uuid-00001", REP);
        expect(isoScope.hasBeenAdmitted).toBe(true);
    });

    var createIsoScope = function (config) {
        scope.config = config;
        element = angular.element('<patient-profile patient-uuid="{{::patient.uuid}}" config="config"></patient-profile>');
        $compile(element)(scope);
        scope.$digest();
        return element.isolateScope();
    };

});