'use strict';

describe('PatientRelationshipController', function () {

    var patientServiceMock = jasmine.createSpyObj('patientService', ['searchByIdentifier']);
    var providerServiceMock = jasmine.createSpyObj('providerService', ['search']);
    var rootScope;
    var scope;

    var patientServiceSearchPromise = specUtil.respondWith({data: {results: [{uuid: "123"}]}});
    patientServiceMock.searchByIdentifier.and.returnValue(patientServiceSearchPromise);

    var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
    spinner.forPromise.and.returnValue(patientServiceSearchPromise);

    patientServiceMock.searchByIdentifier.and.callFake(function () {
        return specUtil.respondWith({data: {pageOfResults: [{uuid: "123"}]}});
    });

    providerServiceMock.search.and.callFake(function () {
        return specUtil.respondWith({data: {pageOfResults: [{uuid: "123"}]}});
    });

    beforeEach(module('bahmni.registration'));
    beforeEach(
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            scope.patient = {newlyAddedRelationships: [], relationships: [], deletedRelationships: []};
            rootScope = $rootScope;
            rootScope.relationshipTypes = [
                {
                    aIsToB: "Doctor",
                    searchType: "provider",
                    uuid: "8d919b58-c2cc-11de-8d13-0010c6dffd0f"
                },
                {aIsToB: "Sibling", bIsToA: "Sibling", searchType: "patient", uuid: "8d91a01c-c2cc-11de-8d13-0010c6dffd0f"},
                {aIsToB: "Parent", bIsToA: "Child", searchType: "patient", uuid: "8d91a210-c2cc-11de-8d13-0010c6dffd0f"},
                {aIsToB: "Aunt/Uncle",bIsToA: "Niece/nephew", searchType: "patient", uuid: "8d91a3dc-c2cc-11de-8d13-0010c6dffd0f"},
                {aIsToB: "Doctor", bIsToA: "Patient",searchType: "patient", uuid: "2a5f4ff4-a179-4b8a-aa4c-40f71956ebbc"}
            ];
            $controller('PatientRelationshipController', {
                $scope: scope,
                $rootScope: rootScope,
                spinner: spinner,
                patientService: patientServiceMock,
                providerService: providerServiceMock
            });
        })
    );

    describe("Remove relationship", function () {
        it("should remove newly added relationship", function () {
            expect(scope.patient.newlyAddedRelationships).toEqual([]);
            var relationship = {patientIdentifier: "Doctor"};
            scope.patient.newlyAddedRelationships.push(relationship);
            scope.patient.newlyAddedRelationships.push({});

            scope.removeRelationship(relationship);
            expect(scope.patient.newlyAddedRelationships.length).toBe(1);
        });

        it("should void the existing relationship", function () {
            var relationship = {
                patientIdentifier: "Doctor",
                relationshipType: {"uuid": "8d919b58-c2cc-11de-8d13-0010c6dffd0f"},
                personB: {"uuid": "uuid"},
                "uuid": "relation-uuid"
            };
            scope.patient.relationships = [relationship];
            scope.removeRelationship(relationship);
            expect(scope.patient.relationships.length).toBe(1);
            expect(scope.patient.relationships[0].voided).toBeTruthy();
            expect(scope.patient.deletedRelationships.length).toBe(1);
        });
    });

    describe("Search by patient identifier", function(){
        it("should have called providerService for Doctor", function (done) {
            var relationship = {
                patientIdentifier: "GAN200012",
                relationshipType: {"uuid": "8d91a01c-c2cc-11de-8d13-0010c6dffd0f"},
                personB: {"uuid": "uuid"}
            };
            scope.patient.relationships = [relationship];
            scope.searchByPatientIdentifier(relationship);
            expect(patientServiceMock.searchByIdentifier).toHaveBeenCalled();
            done();
        });
    });


    describe("isPatientRelationship", function(){
        it("should return true if the relationship type is patient", function () {
            var relationship = {
                patientIdentifier: "Patient",
                relationshipType: {"uuid": "8d91a01c-c2cc-11de-8d13-0010c6dffd0f"},
                personB: {"uuid": "uuid"}
            };
            expect(scope.isPatientRelationship(relationship)).toBeTruthy();
        });

        it("should return false if the relationship type is not patient", function () {
            var relationship = {
                patientIdentifier: "Patient",
                relationshipType: {"uuid": "some-other"},
                personB: {"uuid": "uuid"}
            };
            expect(scope.isPatientRelationship(relationship)).toBeFalsy();
        });
    });

    describe("isProviderRelationship", function(){
        it("should return true if the relationship type is provider", function () {
            var relationship = {
                patientIdentifier: "Doctor",
                relationshipType: {"uuid": "8d919b58-c2cc-11de-8d13-0010c6dffd0f"},
                personB: {"uuid": "uuid"}
            };
            expect(scope.isProviderRelationship(relationship)).toBeTruthy();
        });

        it("should return false if the relationship type is not provider", function () {
            var relationship = {
                patientIdentifier: "Doctor",
                relationshipType: {"uuid": "some-other"},
                personB: {"uuid": "uuid"}
            };
            expect(scope.isProviderRelationship(relationship)).toBeFalsy();
        });
    });

    describe('getChosenRelationshipType',function(){
       it('should return provider when provider relationship is chosen', function(){
           var relationship = {
               patientIdentifier: "Doctor",
               relationshipType: {"uuid": "8d919b58-c2cc-11de-8d13-0010c6dffd0f"},
               personB: {"uuid": "uuid"}
           };
           expect(scope.getChosenRelationshipType(relationship)).toBe("provider");
       })
       it('should return patient when patient relationship is chosen', function(){
           var relationship = {
               patientIdentifier: "Patient",
               relationshipType: {"uuid": "8d91a01c-c2cc-11de-8d13-0010c6dffd0f"},
               personB: {"uuid": "uuid"}
           };
           expect(scope.getChosenRelationshipType(relationship)).toBe("patient");
       })
       it('should return undefined when no relationship is chosen', function(){
           var relationship = {
               patientIdentifier: "Doctor",
               relationshipType: {"uuid": undefined},
               personB: null
           };

           expect(scope.getChosenRelationshipType(relationship)).toBeUndefined();
       })
    });
    describe("clearRelationshipRow", function(){
        it("should clear the relationship data", function () {
            var patientRelationship = {
                patientIdentifier: "Doctor",
                relationshipType: {"uuid": "8d91a01c-c2cc-11de-8d13-0010c6dffd0f"},
                personB: {"uuid": "uuid"},
                endDate: "2015-07-12"
            };
            expect(patientRelationship.patientIdentifier).toBeDefined();
            scope.clearRelationshipRow(patientRelationship);
            expect(patientRelationship.patientIdentifier).toBeUndefined();
            expect(patientRelationship.content).toBeUndefined();
            expect(patientRelationship.endDate).toBeUndefined();
            expect(patientRelationship.personB).toBeUndefined();

            var providerRelationship = {
                providerName: "Doctor",
                relationshipType: {"uuid": "8d91a01c-c2cc-11de-8d13-0010c6dffd0f"},
                personB: {"uuid": "uuid"}
            };
            expect(providerRelationship.providerName).toBeDefined();
            scope.clearRelationshipRow(providerRelationship);
            expect(providerRelationship.providerName).toBeUndefined();
        });

        it("should have called providerService when get provider list is called", function () {
            var searchAttrs = {'term': 'search this'};
            (scope.getProviderList())(searchAttrs);
            expect(providerServiceMock.search).toHaveBeenCalled();
        });

        it("should remove placeholder relationship rows when the current row is cleared", function(){
            var patientRelationship = {
                patientIdentifier: "Doctor",
                relationshipType: {"uuid": undefined},
                personB: {"uuid": "uuid"},
                endDate: "2015-07-12"
            };
            var placeHolderRelationship = {};
            scope.patient.newlyAddedRelationships = [patientRelationship, placeHolderRelationship];

            scope.clearRelationshipRow(patientRelationship, 0);

            expect(scope.patient.newlyAddedRelationships.length).toBe(1);
        });

        it("should add placeholder relationship rows when the current empty row is populated", function(){
            var patientRelationship = {
                patientIdentifier: "Doctor",
                relationshipType: {"uuid": "uuid1"},
                personB: {"uuid": "uuid"},
                endDate: "2015-07-12"
            };
            var currentEmptyRelationshipRow = {
                relationshipType: {"uuid": "uuid2"}
            };
            scope.patient.newlyAddedRelationships = [patientRelationship, currentEmptyRelationshipRow];

            scope.clearRelationshipRow(patientRelationship, 1);

            expect(scope.patient.newlyAddedRelationships.length).toBe(3);
            expect(scope.isEmpty(scope.patient.newlyAddedRelationships[0])).toBeFalsy();
            expect(scope.isEmpty(scope.patient.newlyAddedRelationships[1])).toBeFalsy();
            expect(scope.isEmpty(scope.patient.newlyAddedRelationships[2])).toBeTruthy();
        })
    });

    describe('isEmpty', function(){
       it("should return true if relationship type is not selected", function(){
           var patientRelationship = {
               patientIdentifier: "Doctor",
               relationshipType: {"uuid": undefined},
               personB: null
           };

           expect(scope.isEmpty(patientRelationship)).toBeTruthy();
       })
    });

    describe('onEditProviderName', function(){
       it("should delete personB on editing provider autocomplete", function(){
           var patientRelationship = {
               relationshipType: {"uuid": undefined},
               personB: {uuid: 'personB-uuid'}
           };

           scope.onEditProviderName(patientRelationship);

           expect(patientRelationship.personB).toBeFalsy();
       })
    });

    describe('showPersonNotFound', function(){
       it("should show 'person not found' message when user enters invalid patient identifier", function(){
           var patientRelationship = {
               relationshipType: {"uuid": undefined},
               patientIdentifier: "SIV115438",
               personB: null
           };

           expect(scope.showPersonNotFound(patientRelationship)).toBeTruthy();
       })

       it("should show not show 'person not found' message when the user has not searched for any patient", function(){
           var patientRelationship = {
               relationshipType: {"uuid": undefined},
               patientIdentifier: "",
               personB: null
           };

           expect(scope.showPersonNotFound(patientRelationship)).toBeFalsy();
       })
    });

    describe('getProviderDataResults', function(){
       it("should filter only the providers who are linked to person ", function(){
           var providers = [
               {
                   person: {uuid: 'personB-uuid'},
                   identifier: "provider1"

               },
               {
                   person: null,
                   identifier: "provider1"

               }
           ];

           var data = {data: {results: providers}};

           var providerDataResults = scope.getProviderDataResults(data);
           expect(providerDataResults.length).toBe(1);
       })
    });

    describe("getRelationshipTypeForDisplay", function(){
        it("should return B is to A relationship name if the patient is Person B", function(){
            var patientRelationship = {
                relationshipType: {"uuid": "8d91a210-c2cc-11de-8d13-0010c6dffd0f"},
                patientIdentifier: "SIV115438",
                personB: {"uuid": "personb-uuid"},
                personA: {"uuid": "persona-uuid"}
            };
            scope.patient.uuid ="personb-uuid";

            expect(scope.getRelationshipTypeForDisplay(patientRelationship)).toBe("Child");
        });

        it("should return A is to B relationship name if the patient is Person A", function(){
            var patientRelationship = {
                relationshipType: {"uuid": "8d91a210-c2cc-11de-8d13-0010c6dffd0f"},
                patientIdentifier: "SIV115438",
                personB: {"uuid": "personb-uuid"},
                personA: {"uuid": "persona-uuid"}
            };
            scope.patient.uuid ="persona-uuid";

            expect(scope.getRelationshipTypeForDisplay(patientRelationship)).toBe("Parent");
        });
    });

    describe("getRelatedToPersonForDisplay", function(){
       it("should get the name of the person whom the patient is related to", function(){
           var patientRelationship = {
               relationshipType: {"uuid": "8d91a210-c2cc-11de-8d13-0010c6dffd0f"},
               patientIdentifier: "SIV115438",
               personB: {"uuid": "personb-uuid", display: "Son"},
               personA: {"uuid": "persona-uuid", display: "Dad"}
           };
           scope.patient.uuid ="persona-uuid";

           expect(scope.getRelatedToPersonForDisplay(patientRelationship)).toBe("Son");
       });

    });

});