'use strict';

describe('AddressFieldsDirectiveController', function () {
    var addressHierarchyService;
    var success;
    var controller;
    var scope;

    beforeEach(angular.mock.module('bahmni.registration'));
    beforeEach(angular.mock.inject(function () {
        success = jasmine.createSpy('Successful');
        addressHierarchyService = jasmine.createSpyObj('addressHierarchyService', ['search', 'getNextAvailableParentName','getAddressDataResults']);
    }));

    var setupController = function (strictAddressFields) {
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            scope.address = {};
            scope.addressLevels = [
              {"name": "State", "addressField": "stateProvince", "required": false },
              {"name": "District", "addressField": "countyDistrict", "required": false },
              {"name": "Tehsil", "addressField": "address3", "required": false },
              {"name": "Village", "addressField": "cityVillage", "required": true },
              {"name": "House No., Street", "addressField": "address1", "required": false },
            ];
            scope.strictEntryAddressFields = strictAddressFields || [];
            controller = $controller('AddressFieldsDirectiveController', {
                $scope: scope,
                addressHierarchyService: addressHierarchyService
            });
            scope.$digest();
        });
    };

    describe("village selection", function(){
        beforeEach(function(){
            setupController([])
        });

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
            scope.address = {address3: "", countyDistrict: "", stateProvince: ""};

            scope.addressFieldSelected('cityVillage')({addressField : village });

            expect(scope.address.address3).toBe("");
            expect(scope.address.countyDistrict).toBe("");
            expect(scope.address.stateProvince).toBe("");
        });
    });


    describe("Editing any auto complete field", function(){
        it("should clear address and selectedValue of all other auto completed child fields", function(){
            scope.address = {address3: "address", countyDistrict: "district", stateProvince: "state", cityVillage:"village"};
            scope.selectedValue = {address3: "address", countyDistrict: "district", stateProvince: "state", cityVillage:"village"};

            scope.clearFields("countyDistrict");

            expect(scope.address.cityVillage).toBe("");
            expect(scope.address.address3).toBe("");
            expect(scope.selectedValue.cityVillage).toBe("");
            expect(scope.selectedValue.address3).toBe("");

        });

        it("should remove the address field from autocompleted list on edit", function(){
            scope.autocompletedFields= ["cityVillage", "countryDistrict"];

            scope.removeAutoCompleteEntry("cityVillage")();

            expect(scope.autocompletedFields).not.toContain("cityVillage");

        });

    });

    describe("initialise strict entry flag of address levels", function() {
        it("should make strict entry as true only if parent fields are configured as strict entry ", function () {
            setupController(["stateProvince","countyDistrict"]);
            expect(scope.addressLevels[0].isStrictEntry).toBe(true);
            expect(scope.addressLevels[1].isStrictEntry).toBe(true);
        });

        it("should not make strict entry as true if parent fields are not configured as strict entry ", function () {
            setupController(["countyDistrict"]);
            expect(scope.addressLevels[0].isStrictEntry).toBe(true);
            expect(scope.addressLevels[1].isStrictEntry).toBe(true);
        });
    });
});
