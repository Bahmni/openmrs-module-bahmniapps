'use strict';

describe('AddressFieldsDirectiveController', function () {
    var patientAttributeService;
    var success;
    var controller;
    var scope;

    beforeEach(angular.mock.module('registration.patient.directives'));
    beforeEach(angular.mock.inject(function ($injector) {
        success = jasmine.createSpy('Successful');
        patientAttributeService = jasmine.createSpyObj('patientAttributeService', ['search']);
        patientAttributeService.search.andReturn({success:success});
    }));

    var setupController = function () {
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            scope.address = {};
            scope.addressLevels = [
              {"name": "State", "addressField": "stateProvince", "required": false },
              {"name": "District", "addressField": "countyDistrict", "required": false },
              {"name": "Tehsil", "addressField": "address3", "required": false },
              {"name": "Village", "addressField": "cityVillage", "required": true },
              {"name": "House No., Street", "addressField": "address1", "required": false },
            ]
            controller = $controller('AddressFieldsDirectiveController', {
                $scope: scope,
                patientAttributeService: patientAttributeService
            });
        });
    }

    describe("village selection", function(){
        beforeEach(setupController);

        it("should update tehsil, district and state", function(){
           var village = bahmni.villageMother.build();

           scope.addressFieldSelected('cityVillage')({addressField : village });

           expect(scope.address.address3).toBe(village.parent.name);
           expect(scope.address.countyDistrict).toBe(village.parent.parent.name);
           expect(scope.address.stateProvince).toBe(village.parent.parent.parent.name);
       });

        it("should not update tehsil, district and state when selected village does not have parents", function () {
            var village = bahmni.villageMother.build();
            village.parent = null;
            scope.address = {address3: "", countyDistrict: "", stateProvince: ""}

            scope.addressFieldSelected('cityVillage')({addressField : village });

            expect(scope.address.address3).toBe("");
            expect(scope.address.countyDistrict).toBe("");
            expect(scope.address.stateProvince).toBe("");
        });
    });

    describe("getAddressDataResults", function(){
       it("should map address field to value and label for fields with parent", function(){
           var addresses = [{ name : "someVillage" , parent : { name : "someTehsil"}}];

           var addressDataResults = scope.getAddressDataResults(addresses);

           expect(addressDataResults.length).toBe(1);
           expect(addressDataResults[0].value).toBe("someVillage");
           expect(addressDataResults[0].label).toBe("someVillage, someTehsil");
           expect(addressDataResults[0].addressField).toBe(addresses[0]);
       });

       it("should map address field to value and label for fields without parent", function(){
           var addresses = [{ name : "someVillage"}];

           var addressDataResults = scope.getAddressDataResults(addresses);

           expect(addressDataResults.length).toBe(1);
           expect(addressDataResults[0].value).toBe("someVillage");
           expect(addressDataResults[0].label).toBe("someVillage");
           expect(addressDataResults[0].addressField).toBe(addresses[0]);
       });

       it("should map address field to value and label for fields with blank parent and grand parent", function(){
           var blankTehsil = {name: "", parent: {name: "someDistrict"}}
           var addresses = [{ name : "someVillage", parent: blankTehsil}];

           var addressDataResults = scope.getAddressDataResults(addresses);

           expect(addressDataResults.length).toBe(1);
           expect(addressDataResults[0].value).toBe("someVillage");
           expect(addressDataResults[0].label).toBe("someVillage, someDistrict");
           expect(addressDataResults[0].addressField).toBe(addresses[0]);
       });
    });
});