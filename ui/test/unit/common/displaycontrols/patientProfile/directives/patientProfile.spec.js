'use strict';

describe("Patient Profile display control", function () {
    var element, scope, $compile, mockBackend;

    beforeEach(module('ngHtml2JsPreprocessor'));
    beforeEach(module('bahmni.common.patient'));
    beforeEach(module('bahmni.common.uiHelper'));
    beforeEach(module('bahmni.common.displaycontrol.patientprofile'), function ($provide) {
        var patientService = jasmine.createSpyObj('patientService', ['getRelationships']);
        patientService.getRelationships.and.callFake(function (param) {
            return specUtil.respondWith({
                results: []
            });
        });

        var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        spinner.forPromise.and.callFake(function (param) {
            var deferred = q.defer();
            deferred.resolve({data: {}});
            return deferred.promise;
        });
        spinner.then.and.callThrough({data: {}});
        $provide.value('spinner', spinner);
        $provide.value('patientService', patientService);
    });

    beforeEach(inject(function (_$compile_, $rootScope, $httpBackend) {
        scope = $rootScope;
        $compile = _$compile_;
        scope.patient = {
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
        mockBackend = $httpBackend;
        mockBackend.expectGET('/openmrs/ws/rest/v1/relationship?v=full').respond([]);
    }));


    it("should get patient address with cityVillage when addressField is not specified in config", function () {
         var config = {
            "title": "Patient Information",
            "name": "patientInformation",
            "patientAttributes": ["caste", "class", "education", "occupation"]
        };
        var isoScope = createIsoScope(config);
        expect(isoScope.getAddress()).toBe("Some village");
    });

    it("should get patient name, age, gender, identifier and address even though config is empty", function () {
        var isoScope = createIsoScope({});
        var patientAttributeTypes = isoScope.getPatientAttributeTypes();
        expect(patientAttributeTypes.$$unwrapTrustedValue()).toBe("Female, 21 years");
    });

    it("should also get patient blood group attribute if it is directly specified", function () {
        scope.patient = {
            "name": "Patient name",
            "genderText": "Female",
            "identifier": "Some identifier",
            "ageText": "21 years",
            "bloodGroupText": "AB+",
            "address": {
                address1: 'Address',
                address2: null,
                cityVillage: 'Some village',
                state: "State",
                zip: ''
            }
        };
        var isoScope = createIsoScope({});
        var patientAttributeTypes = isoScope.getPatientAttributeTypes();
        expect(patientAttributeTypes.$$unwrapTrustedValue()).toBe("Female, 21 years, AB+");
    });

    it("should get patient address in the order of config specified", function () {
        var config = {
            "title": "Patient Information",
            "name": "patientInformation",
            "addressFields": ["address1", "cityVillage", "state", "zip"]
        };
        var isoScope = createIsoScope(config);
        expect(isoScope.getAddress()).toBe("Address, Some village, State");
    });

    it("should return false if the relationshipTypeMap.provider object is empty", function () {
        scope.relationshipTypeMap = {};
        var isoScope = createIsoScope({});
        expect(isoScope.isProviderRelationship({relationshipType : {aIsToB : "Parent"}})).toBeFalsy();
    });

    it("should return true if the relationship is provider", function () {
        scope.relationshipTypeMap = { "provider" : ["Doctor"]};
        var isoScope = createIsoScope({});
        expect(isoScope.isProviderRelationship({relationshipType : {aIsToB : "Doctor"}})).toBeTruthy();
    });

    it("should return false if the relationship is patient", function () {
        scope.relationshipTypeMap = { "provider" : ["Doctor"]};
        var isoScope = createIsoScope({});
        expect(isoScope.isProviderRelationship({relationshipType : {aIsToB : "Patient"}})).toBeFalsy();
    });

    var createIsoScope = function(config)  {
        scope.config = config;
        element = angular.element('<patient-profile patient="patient" config="config"></patient-profile>');
        $compile(element)(scope);
        scope.$digest();
        return element.isolateScope();
    };

});