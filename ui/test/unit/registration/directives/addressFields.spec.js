'use strict';

describe('AddressFieldsDirectiveController', function () {
    var patientAttributeService;
    var success;
    var controller;
    var scope;

    beforeEach(angular.mock.module('bahmni.registration'));
    beforeEach(angular.mock.inject(function ($injector) {
        success = jasmine.createSpy('Successful');
        patientAttributeService = jasmine.createSpyObj('patientAttributeService', ['search']);
        patientAttributeService.search.and.returnValue({success:success});
    }));

    var setupController = function () {
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            scope.address = {};
            var autocompletedFields = ["cityVillage", "address3", "countyDistrict", "stateProvince"];
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
           var village = Bahmni.Tests.villageMother.build();

           scope.addressFieldSelected('cityVillage')({addressField : village });

           expect(scope.address.address3).toBe(village.parent.name);
           expect(scope.address.countyDistrict).toBe(village.parent.parent.name);
           expect(scope.address.stateProvince).toBe(village.parent.parent.parent.name);
       });

        it("should not update tehsil, district and state when selected village does not have parents", function () {
            var village = Bahmni.Tests.villageMother.build();
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
           var addresses ={data: [{ name : "someVillage" , parent : { name : "someTehsil"}}]};

           var addressDataResults = scope.getAddressDataResults(addresses);

           expect(addressDataResults.length).toBe(1);
           expect(addressDataResults[0].value).toBe("someVillage");
           expect(addressDataResults[0].label).toBe("someVillage, someTehsil");
           expect(addressDataResults[0].addressField).toBe(addresses.data[0]);
       });

       it("should map address field to value and label for fields without parent", function(){
           var addresses = {data:[{ name : "someVillage"}]};

           var addressDataResults = scope.getAddressDataResults(addresses);

           expect(addressDataResults.length).toBe(1);
           expect(addressDataResults[0].value).toBe("someVillage");
           expect(addressDataResults[0].label).toBe("someVillage");
           expect(addressDataResults[0].addressField).toBe(addresses.data[0]);
       });

       it("should map address field to value and label for fields with blank parent and grand parent", function(){
           var blankTehsil = {name: "", parent: {name: "someDistrict"}}
           var addresses = {data:[{ name : "someVillage", parent: blankTehsil}]};

           var addressDataResults = scope.getAddressDataResults(addresses);

           expect(addressDataResults.length).toBe(1);
           expect(addressDataResults[0].value).toBe("someVillage");
           expect(addressDataResults[0].label).toBe("someVillage, someDistrict");
           expect(addressDataResults[0].addressField).toBe(addresses.data[0]);
       });
    });

    describe("Editing any auto complete field", function(){
        it("should clear all other auto completed fields", function(){
            scope.address = {address3: "address", countyDistrict: "district", stateProvince: "state", cityVillage:"village"};

            scope.clearFields("countyDistrict");

            expect(scope.address.cityVillage).toBe("")
            expect(scope.address.address3).toBe("")

        });
    });
});