'use strict';

describe('TopDownAddressFieldsDirectiveController', function () {
    var success;
    var controller;
    var scope;
    var addressHierarchyService;

    beforeEach(angular.mock.module('bahmni.registration'));
    beforeEach(angular.mock.inject(function () {
        success = jasmine.createSpy('Successful');
        addressHierarchyService = jasmine.createSpyObj('addressHierarchyService', ['search', 'getNextAvailableParentName','getAddressDataResults']);
    }));

    var setupController = function () {
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            scope.address = {};
            scope.$parent.patient = {};
            scope.addressLevels = [
                {"name": "State", "addressField": "stateProvince", "required": false},
                {"name": "District", "addressField": "countyDistrict", "required": false},
                {"name": "Tehsil", "addressField": "address3", "required": false},
                {"name": "Village", "addressField": "cityVillage", "required": true},
                {"name": "House No., Street", "addressField": "address1", "required": false},
                {"name": "Address Line", "addressField": "addressLine", "required": true}
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

    describe("Editing any auto complete field", function () {
        beforeEach(setupController);
        it("should clear all other auto completed fields", function () {
            scope.address = {
                address3: "address",
                countyDistrict: "district",
                stateProvince: "state",
                cityVillage: "village"
            };

            scope.clearFields("countyDistrict");

            expect(scope.address.cityVillage).toBe(null);
            expect(scope.address.address3).toBe(null)
        });

        it("should update value of field on clear", function () {
            scope.address = {
                address3: "address",
                countyDistrict: "district",
                stateProvince: "state",
                cityVillage: "village"
            };
            scope.address.countyDistrict = "";

            scope.clearFields("countyDistrict");

            expect(scope.address.countyDistrict).toBe(null);
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

    describe("It should set location id", function(){
        beforeEach(setupController);

        it("when any of the address fields are selected", function(){

            scope.addressFieldSelected("countyDistrict")({
                addressField: {
                    "name": "Bagerhat",
                    "uuid": "e12e5566-73b7-476e-8bc1-d6bce6df7fb5",
                    "userGeneratedId" : "1234"
                }
            });

            expect(scope.$parent.patient.addressCode).toBe("1234");
        });

        it("to parent location id when child location is cleared", function(){

            expect(scope.$parent.patient.addressCode).toBe(undefined);

            scope.addressFieldSelected("stateProvince")({
                addressField: {
                    "name": "Barisal",
                    "uuid": "17d5d37b-7b74-4053-82ba-d041691f0585",
                    "userGeneratedId": "10"
                }
            });

            expect(scope.$parent.patient.addressCode).toBe("10");

            scope.addressFieldSelected("countyDistrict")({
                addressField: {
                    "name": "Barguna",
                    "uuid": "035880e8-8a3a-4efa-93a6-bcd9684935ac",
                    "userGeneratedId": "1004"
                }
            });

            expect(scope.$parent.patient.addressCode).toBe("1004");

            scope.addressFieldSelected("address3")({
                addressField: {
                    "name": "Patharghata",
                    "uuid": "035880e8-8a3a-4efa-93a6-bcd9684935ac",
                    "userGeneratedId": "100485"
                }
            });

            scope.clearFields("countyDistrict");

            expect(scope.$parent.patient.addressCode).toBe("10");
        })
    });

    describe('populateSelectedAddressUuids',function(){
        it("should not throw an error when response is not present",function(done){
            setupController();

            scope.address.stateProvince="state";
            addressHierarchyService.search.and.returnValue(specUtil.createFakePromise(undefined));
            scope.$digest();
            expect(addressHierarchyService.search).toHaveBeenCalledWith("stateProvince", "state", undefined);
            expect(scope.$parent.patient.addressCode).toBe(undefined);
            done();
        });

        it("should recusive call for populateSelectedAddressUuids",function(done){
            setupController();

            scope.address.stateProvince="Dhaka";
            scope.address.countyDistrict="Gazipur";
            scope.address.address3="Gazipur Sadar";
            scope.address.cityVillage="Baria";
            scope.address.address1="Ward No-02";
            addressHierarchyService.search.and.callFake(function (fileName, fieldValue, parentUuid) {
                if(parentUuid == undefined)
                    return specUtil.createFakePromise([{uuid: "DhakaUuid"}]);
                else if(parentUuid == "DhakaUuid")
                    return specUtil.createFakePromise([{uuid: "GazipurUuid"}]);
                else if(parentUuid == "GazipurUuid")
                    return specUtil.createFakePromise([{uuid: "SadarUuid"}]);
                else if(parentUuid == "SadarUuid")
                    return specUtil.createFakePromise([{uuid: "BariaUuid"}]);
                else if(parentUuid == "BariaUuid")
                    return specUtil.createFakePromise([{uuid: "Ward02Uuid"}]);
            });
            scope.$digest();

            expect(addressHierarchyService.search.calls.count()).toBe(5);
            expect(addressHierarchyService.search).toHaveBeenCalledWith("stateProvince", "Dhaka", undefined);
            expect(addressHierarchyService.search).toHaveBeenCalledWith('countyDistrict', 'Gazipur', 'DhakaUuid');
            expect(addressHierarchyService.search).toHaveBeenCalledWith('address3', 'Gazipur Sadar', 'GazipurUuid');
            expect(addressHierarchyService.search).toHaveBeenCalledWith('cityVillage', 'Baria', 'SadarUuid');
            expect(addressHierarchyService.search).toHaveBeenCalledWith('address1', 'Ward No-02', 'BariaUuid');
            done();
        });
    });
});
