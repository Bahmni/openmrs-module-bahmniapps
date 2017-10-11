'use strict';

describe('addressHierarchyService', function () {
    var resultList = [
        {
            "name": "Semi",
            "parent": {
                "name": "Bilaspur",
                "uuid": "uuid-for-bilaspur",
                "parent": {
                    "name": "Distr",
                    "uuid": "uuid-for-distr",
                    "parent": {
                        "name": "Chattisgarh",
                        "uuid": "uuid-for-chattisgarh",
                        "parent": {
                            "name": "India",
                            "uuid": "uuid-for-India"
                        }
                    }
                }
            }
        },
        {
            "name": "Semi",
            "uuid": "uuid-for-semi",
            "parent": {
                "name": "Semariya",
                "uuid": "uuid-for-semariya",
                "parent": {
                    "name": "Distr",
                    "uuid": "uuid-for-distr",
                    "parent": {
                        "name": "Chattisgarh",
                        "uuid": "uuid-for-chattisgarh",
                        "parent": {
                            "name": "India",
                            "uuid": "uuid-for-india"
                        }
                    }
                }
            }
        }
    ];
    var mockHttp = {defaults:{headers:{common:{'X-Requested-With':'present'}} },
        get:jasmine.createSpy('Http get').and.returnValue(resultList)
    };

    var mockandroidDbService= jasmine.createSpyObj('androidDbService', ['searchAddress']);
    mockandroidDbService.searchAddress.and.returnValue(resultList);


    beforeEach(module('bahmni.registration'));
    beforeEach(module(function ($provide) {
        $provide.value('$http', mockHttp);
    }));

    describe("search", function () {
        it('Should get list of addresses from address hierarchy service', inject(['addressHierarchyService', function (addressHierarchyService) {
            Bahmni.Registration.Constants.openmrsUrl = 'http://blah.com/openmrs';
            var query = "bilas";
            var fieldName = "Village";

            var results = addressHierarchyService.search(fieldName,query);

            expect(mockHttp.get).toHaveBeenCalled();
            expect(mockHttp.get.calls.mostRecent().args[0]).toBe('http://blah.com/openmrs/module/addresshierarchy/ajax/getPossibleAddressHierarchyEntriesWithParents.form');
            expect(mockHttp.get.calls.mostRecent().args[1].params.searchString).toBe(query);
            expect(mockHttp.get.calls.mostRecent().args[1].params.addressField).toBe(fieldName);
            expect(results).toBe(resultList);
        }]));

        it('Should parse the searchString for Chrome app, if searchString contains parenthesis', inject(['addressHierarchyService', function (addressHierarchyService) {
            var query = "Barisal Sadar (kotwali)";
            var parsedQuery = "Barisal Sadar \\(kotwali\\)";
            var params = {parentUuid : undefined, limit : 20 };
            params.searchString = parsedQuery;
            var fieldName = "Village";
            params.addressField = fieldName;

            expect(addressHierarchyService.search(fieldName, query)).toBe(resultList);
        }]));
    });
    describe("getAddressDataResults", function(){
        it("should map address field to value and label for fields with parent", inject([ 'addressHierarchyService', function(addressHierarchyService){
           var addresses ={data: [{ name : "someVillage" , parent : { name : "someTehsil"}}]};

           var addressDataResults = addressHierarchyService.getAddressDataResults(addresses);

           expect(addressDataResults.length).toBe(1);
           expect(addressDataResults[0].value).toBe("someVillage");
           expect(addressDataResults[0].label).toBe("someVillage, someTehsil");
           expect(addressDataResults[0].addressField).toBe(addresses.data[0]);
        }]));

        it("should map address field to value and label for fields without parent", inject([ 'addressHierarchyService', function(addressHierarchyService){
           var addresses = {data:[{ name : "someVillage"}]};

           var addressDataResults = addressHierarchyService.getAddressDataResults(addresses);

           expect(addressDataResults.length).toBe(1);
           expect(addressDataResults[0].value).toBe("someVillage");
           expect(addressDataResults[0].label).toBe("someVillage");
           expect(addressDataResults[0].addressField).toBe(addresses.data[0]);
        }]));

        it ("should map address field to value and label for fields with blank parent and grand parent", inject([ 'addressHierarchyService', function(addressHierarchyService){
           var blankTehsil = {name: "", parent: {name: "someDistrict"}};
           var addresses = {data:[{ name : "someVillage", parent: blankTehsil}]};

           var addressDataResults = addressHierarchyService.getAddressDataResults(addresses);

           expect(addressDataResults.length).toBe(1);
           expect(addressDataResults[0].value).toBe("someVillage");
           expect(addressDataResults[0].label).toBe("someVillage, someDistrict");
           expect(addressDataResults[0].addressField).toBe(addresses.data[0]);
        }]));
    });
});
