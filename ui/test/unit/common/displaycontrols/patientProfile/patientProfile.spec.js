'use strict';

describe("Patient Profile display control", function() {
    var element, scope, $compile;

    beforeEach(module('bahmni.clinical'));
    beforeEach(module('foo'));

    beforeEach(inject(function(_$compile_, $rootScope) {
        scope = $rootScope;
        $compile = _$compile_;
        scope.patient = {
            "name":"Patient name",
            "genderText":"Female",
            "identifier":"Some identifier",
            "ageText":"21 years",
            "address":
            {
                address1: 'Address',
                address2: null,
                cityVillage: 'Some village',
                state: "State",
                zip: ''
            }
        };
    }));


    it("should get patient address with cityVillage when addressField is not specified in config", function () {
        scope.config = {
            "title" : "Patient Information",
            "name" : "patientInformation",
            "patientAttributes" : ["caste", "class", "education", "occupation"]
        };

        element = angular.element('<patient-profile patient="patient" config="config"></patient-profile>');
        $compile(element)(scope);
        scope.$digest();

        var isoScope = element.isolateScope();

        expect(isoScope.getAddress()).toBe("Some village");
    });

    it("should get patient Name, age, gender, identifier and address even though config is empty", function () {
        scope.config = {
        };

        element = angular.element('<patient-profile patient="patient" config="config"></patient-profile>');
        $compile(element)(scope);
        scope.$digest();

        var isoScope = element.isolateScope();

        expect(isoScope.getPatientGenderAndAge()).toBe("Female, 21 years");
    });

});