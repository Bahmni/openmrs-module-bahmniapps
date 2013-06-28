'use strict';

describe('PatientCommonController', function () {

    var patientAttributeService;
    var success;
    var controller;
    var scope;

    beforeEach(angular.mock.module('registration.patient.controllers'));
    beforeEach(angular.mock.module('registration.patient.models'));
    beforeEach(angular.mock.inject(function ($injector) {
        success = jasmine.createSpy('Successful');
        patientAttributeService = jasmine.createSpyObj('patientAttributeService', ['search']);
        patientAttributeService.search.andReturn({success:success});
    }));

    var setupController = function () {
        inject(function ($controller, $rootScope, patient) {
            scope = $rootScope.$new();
            scope.patient = patient.create();
            controller = $controller('PatientCommonController', {
                $scope:scope,
                patientAttributeService:patientAttributeService
            });
        });
    }


    describe("getLastNameList", function () {
        it('should use the patientAttributeService to get laste name list', function () {
            setupController();
            var param = "ram";

            scope.getLastNameList(param);

            expect(patientAttributeService.search).toHaveBeenCalled();
            expect(patientAttributeService.search.mostRecentCall.args[0]).toBe("familyName");
            expect(patientAttributeService.search.mostRecentCall.args[1]).toBe(param);
        });
    });

    describe("getCasteList", function () {
        it('should use the patientAttributeService to get caste list', function () {
            setupController();
            var param = "hin";

            scope.getCasteList(param);

            expect(patientAttributeService.search).toHaveBeenCalled();
            expect(patientAttributeService.search.mostRecentCall.args[0]).toBe("caste");
            expect(patientAttributeService.search.mostRecentCall.args[1]).toBe(param);
        });
    });

    describe("tehsil selection", function(){
       it("should update district and state", function(){
           setupController();
           var tehsil = bahmni.tehsilMother.build();

           scope.tehsilSelected({addressField : tehsil });

           expect(scope.patient.address.countyDistrict).toBe(tehsil.parent.name);
           expect(scope.patient.address.stateProvince).toBe(tehsil.parent.parent.name);
       });
    });

    describe("village selection", function(){
        beforeEach(setupController);

        it("should update tehsil, district and state", function(){
           var village = bahmni.villageMother.build();

           scope.villageSelected({addressField : village });

           expect(scope.patient.address.address3).toBe(village.parent.name);
           expect(scope.patient.address.countyDistrict).toBe(village.parent.parent.name);
           expect(scope.patient.address.stateProvince).toBe(village.parent.parent.parent.name);
       });

        it("should not update tehsil, district and state when selected village does not have parents", function () {
            var village = bahmni.villageMother.build();
            village.parent = null;
            scope.patient.address = {address3: "", countyDistrict: "", stateProvince: ""}

            scope.villageSelected({addressField : village });

            expect(scope.patient.address.address3).toBe("");
            expect(scope.patient.address.countyDistrict).toBe("");
            expect(scope.patient.address.stateProvince).toBe("");
        });
    });

    describe("getAddressDataResults", function(){
       it("should map address field to value and label for fields with parent", function(){
           var addresses = [{ name : "village" , parent : { name : "tehsil"}}];

           var addressDataResults = scope.getAddressDataResults(addresses);

           expect(addressDataResults.length).toBe(1);
           expect(addressDataResults[0].value).toBe("village");
           expect(addressDataResults[0].label).toBe("village, tehsil");
           expect(addressDataResults[0].addressField).toBe(addresses[0]);
       });

       it("should map address field to value and label for fields without parent", function(){
           var addresses = [{ name : "village"}];

           var addressDataResults = scope.getAddressDataResults(addresses);

           expect(addressDataResults.length).toBe(1);
           expect(addressDataResults[0].value).toBe("village");
           expect(addressDataResults[0].label).toBe("village");
           expect(addressDataResults[0].addressField).toBe(addresses[0]);
       });
    });

});