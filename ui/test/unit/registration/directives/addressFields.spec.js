'use strict';

describe('AddressFieldsDirectiveController', function () {
    var addressHierarchyService;
    var success;
    var controller;
    var scope;
    var appService;

    beforeEach(angular.mock.module('bahmni.registration'));
    beforeEach(angular.mock.inject(function () {
        success = jasmine.createSpy('Successful');
        addressHierarchyService = jasmine.createSpyObj('addressHierarchyService', ['search', 'getNextAvailableParentName','getAddressDataResults']);
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
                appService.getAppDescriptor.and.returnValue({
                    getConfigValue: function () {
                        return true;
                    }
                });
    }));

    var setupController = function (strictAutoCompleteFromLevel) {
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
            scope.strictAutocompleteFromLevel = strictAutoCompleteFromLevel ;
            controller = $controller('AddressFieldsDirectiveController', {
                $scope: scope,
                addressHierarchyService: addressHierarchyService
            });
            scope.$digest();
        });
    };

    describe("village selection", function(){
        beforeEach(function(){
            setupController(undefined)
        });

        it("should update tehsil, district and state", function(){
           var village = Bahmni.Tests.villageMother.build();
            scope.selectedValue={};

           scope.addressFieldSelected('cityVillage')({addressField : village });

           expect(scope.address.address3).toBe(village.parent.name);
           expect(scope.address.countyDistrict).toBe(village.parent.parent.name);
           expect(scope.address.stateProvince).toBe(village.parent.parent.parent.name);
           expect(scope.selectedValue.cityVillage).toBe(village.name);
           expect(scope.selectedValue.address3).toBe(village.parent.name);
           expect(scope.selectedValue.countyDistrict).toBe(village.parent.parent.name);
           expect(scope.selectedValue.stateProvince).toBe(village.parent.parent.parent.name);
       });

        it("should not update tehsil, district and state when selected village does not have parents", function () {
            var village = Bahmni.Tests.villageMother.build();
            village.parent = null;
            scope.address = {address3: "", countyDistrict: "", stateProvince: ""};
            scope.selectedValue={};

            scope.addressFieldSelected('cityVillage')({addressField : village });

            expect(scope.selectedValue.cityVillage).toBe(village.name);
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
            expect(scope.address.cityVillage).toBe(null);
            expect(scope.address.address3).toBe(null);
            expect(scope.selectedValue.cityVillage).toBe(null);
            expect(scope.selectedValue.address3).toBe(null);

        });

        it("should remove the address field from autocompleted list on edit", function(){
            scope.selectedValue['cityVillage'] = 'village';

            scope.removeAutoCompleteEntry("cityVillage")();

            expect(scope.selectedValue["cityVillage"]).toBeNull();

        });

    });

    describe("initialise strict entry flag of address levels", function() {
        it("should make all parent levels as strict autocomplete fields starting from configured address level", function () {
            setupController("countyDistrict");
            expect(scope.addressLevels[0].isStrictEntry).toBe(true);
            expect(scope.addressLevels[1].isStrictEntry).toBe(true);
            expect(scope.addressLevels[2].isStrictEntry).toBe(false);
            expect(scope.addressLevels[3].isStrictEntry).toBe(false);
            expect(scope.addressLevels[4].isStrictEntry).toBe(false);
        });

        it("should make all levels as freetext if 'strictAutoCompleteFromLevel' configuration is not present", function () {
            setupController(undefined);
            expect(scope.addressLevels[0].isStrictEntry).toBeFalsy();
            expect(scope.addressLevels[1].isStrictEntry).toBeFalsy();
            expect(scope.addressLevels[2].isStrictEntry).toBeFalsy();
            expect(scope.addressLevels[3].isStrictEntry).toBeFalsy();
            expect(scope.addressLevels[4].isStrictEntry).toBeFalsy();

        })
    });
});
