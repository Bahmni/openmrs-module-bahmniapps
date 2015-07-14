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

        scope.config = {
            "title": "Patient Information",
            "name": "patientInformation",
            "patientAttributes": ["caste", "class", "education", "occupation"]
        };

        element = angular.element('<patient-profile patient="patient" config="config"></patient-profile>');
        $compile(element)(scope);
        scope.$digest();

        var isoScope = element.isolateScope();

        expect(isoScope.getAddress()).toBe("Some village");
    });

    it("should get patient Name, age, gender, identifier and address even though config is empty", function () {
        scope.config = {};

        element = angular.element('<patient-profile patient="patient" config="config"></patient-profile>');
        $compile(element)(scope);
        scope.$digest();

        var isoScope = element.isolateScope();

        expect(isoScope.getPatientGenderAndAge()).toBe("Female, 21 years");
    });

    it("should get patient address in the order of config specified", function () {
        scope.config = {
            "title": "Patient Information",
            "name": "patientInformation",
            "addressFields": ["address1", "cityVillage", "state", "zip"]
        };
        element = angular.element('<patient-profile patient="patient" config="config"></patient-profile>');
        $compile(element)(scope);
        scope.$digest();

        var isoScope = element.isolateScope();

        expect(isoScope.getAddress()).toBe("Address, Some village, State");
    });

});