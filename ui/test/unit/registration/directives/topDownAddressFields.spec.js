'use strict';

describe('TopDownAddressFieldsDirectiveController', function () {
    var success;
    var controller;
    var scope;
    var addressHierarchyService;

    beforeEach(angular.mock.module('bahmni.registration'));
    beforeEach(angular.mock.inject(function () {
        success = jasmine.createSpy('Successful');
        addressHierarchyService = jasmine.createSpyObj('addressHierarchyService', ['search', 'asd']);
    }));

    var setupController = function () {
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            scope.address = {};
            scope.addressLevels = [
                {"name": "State", "addressField": "stateProvince", "required": false},
                {"name": "District", "addressField": "countyDistrict", "required": false},
                {"name": "Tehsil", "addressField": "address3", "required": false},
                {"name": "Village", "addressField": "cityVillage", "required": true},
                {"name": "House No., Street", "addressField": "address1", "required": false},
            ];
            controller = $controller('TopDownAddressFieldsDirectiveController', {
                $scope: scope,
                addressHierarchyService: addressHierarchyService
            });
        });
    };

    describe("village selection", function () {
        beforeEach(setupController);

        it("should update tehsil, district and state", function () {
            var village = Bahmni.Tests.villageMother.build();

            scope.addressFieldSelected('cityVillage')({addressField: village});

            expect(scope.address.address3).toBe(village.parent.name);
            expect(scope.address.countyDistrict).toBe(village.parent.parent.name);
            expect(scope.address.stateProvince).toBe(village.parent.parent.parent.name);
        });

        it("should not update tehsil, district and state when selected village does not have parents", function () {
            var village = Bahmni.Tests.villageMother.build();
            village.parent = null;
            scope.address = {address3: "", countyDistrict: "", stateProvince: ""}

            scope.addressFieldSelected('cityVillage')({addressField: village});

            expect(scope.address.address3).toBe("");
            expect(scope.address.countyDistrict).toBe("");
            expect(scope.address.stateProvince).toBe("");
        });
    });

    describe("getAddressDataResults", function () {
        it("should map address field to value and label for fields with parent", function () {
            var addresses = {data: [{name: "someVillage", parent: {name: "someTehsil"}}]};

            var addressDataResults = scope.getAddressDataResults(addresses);

            expect(addressDataResults.length).toBe(1);
            expect(addressDataResults[0].value).toBe("someVillage");
            expect(addressDataResults[0].label).toBe("someVillage, someTehsil");
            expect(addressDataResults[0].addressField).toBe(addresses.data[0]);
        });

        it("should map address field to value and label for fields without parent", function () {
            var addresses = {data: [{name: "someVillage"}]};

            var addressDataResults = scope.getAddressDataResults(addresses);

            expect(addressDataResults.length).toBe(1);
            expect(addressDataResults[0].value).toBe("someVillage");
            expect(addressDataResults[0].label).toBe("someVillage");
            expect(addressDataResults[0].addressField).toBe(addresses.data[0]);
        });

        it("should map address field to value and label for fields with blank parent and grand parent", function () {
            var blankTehsil = {name: "", parent: {name: "someDistrict"}};
            var addresses = {data: [{name: "someVillage", parent: blankTehsil}]};

            var addressDataResults = scope.getAddressDataResults(addresses);

            expect(addressDataResults.length).toBe(1);
            expect(addressDataResults[0].value).toBe("someVillage");
            expect(addressDataResults[0].label).toBe("someVillage, someDistrict");
            expect(addressDataResults[0].addressField).toBe(addresses.data[0]);
        });
    });

    describe("Editing any auto complete field", function () {
        it("should clear all other auto completed fields", function () {
            scope.address = {
                address3: "address",
                countyDistrict: "district",
                stateProvince: "state",
                cityVillage: "village"
            };

            scope.clearFields("countyDistrict");

            expect(scope.address.cityVillage).toBe("")
            expect(scope.address.address3).toBe("")

        });
    });

    describe("isFreeTextAddressField", function () {
        it("should return true if the address field is in freeTextAddressFields", function () {
            scope.freeTextAddressFields = ['address1', 'address2'];
            expect(scope.isFreeTextAddressField('address1')).toBeTruthy();
        });

        it("should return false if the address field is not in freeTextAddressFields", function () {
            scope.freeTextAddressFields = ['address1', 'address2'];
            expect(scope.isFreeTextAddressField('address3')).toBeFalsy();
        });
    });

    describe("getAddressEntryList", function() {
        beforeEach(setupController);

        it("should retrieve addresses based on parent uuid when parent has been specified", function(done) {
            addressHierarchyService.search.and.returnValue(specUtil.respondWith([
                {
                    "name": "Bagerhat",
                    "uuid": "e12e5566-73b7-476e-8bc1-d6bce6df7fb5",
                    "parent": {
                        "name": "Khulna",
                        "uuid": "76bc03a4-5e7f-486a-b67f-3f36b48b0387",
                    }
                }
            ]));

            scope.addressFieldSelected("stateProvince")({
                addressField: {
                    "name": "Bagerhat",
                    "uuid": "e12e5566-73b7-476e-8bc1-d6bce6df7fb5"
                }
            });

            scope.getAddressEntryList("countyDistrict")({term: "khul"}).then(function () {
                expect(addressHierarchyService.search).toHaveBeenCalledWith("countyDistrict", "khul", "e12e5566-73b7-476e-8bc1-d6bce6df7fb5");
                done();
            });
        });

        it("should work with parent uuid when fields are cleared in between", function(done) {
            addressHierarchyService.search.and.returnValue(specUtil.respondWith([
                {
                    "name": "Patharghata",
                    "uuid": "4b24",
                    "userGeneratedId": "100485",
                    "parent": {
                        "name": "Barguna",
                        "uuid": "035880e8-8a3a-4efa-93a6-bcd9684935ac",
                        "userGeneratedId": "1004",
                        "parent": {
                            "name": "Barisal",
                            "uuid": "17d5d37b-7b74-4053-82ba-d041691f0585",
                            "userGeneratedId": "10"
                        }
                    }
                }
            ]));

            scope.addressFieldSelected("stateProvince")({
                addressField: {
                    "name": "Barisal",
                    "uuid": "17d5d37b-7b74-4053-82ba-d041691f0585"
                }
            });

            scope.addressFieldSelected("countyDistrict")({
                addressField: {
                    "name": "Barguna",
                    "uuid": "035880e8-8a3a-4efa-93a6-bcd9684935ac"
                }
            });

            scope.addressFieldSelected("address3")({
                addressField: {
                    "name": "Patharghata",
                    "uuid": "035880e8-8a3a-4efa-93a6-bcd9684935ac"
                }
            });

            scope.clearFields("countyDistrict");

            scope.getAddressEntryList("countyDistrict")({term: "khul"}).then(function () {
                expect(addressHierarchyService.search).toHaveBeenCalledWith("countyDistrict", "khul", "17d5d37b-7b74-4053-82ba-d041691f0585");
                done();
            });
        });

    });
});
