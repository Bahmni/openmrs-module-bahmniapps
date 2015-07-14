'use strict';

describe('PatientRelationshipController', function () {

    var patientServiceMock = jasmine.createSpyObj('patientService', ['search']);
    var providerServiceMock = jasmine.createSpyObj('providerService', ['search']);
    var rootScope;
    var scope;

    var patientServiceSearchPromise = specUtil.respondWith({data: {results: [{uuid: "123"}]}});
    patientServiceMock.search.and.returnValue(patientServiceSearchPromise);

    var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
    spinner.forPromise.and.returnValue(patientServiceSearchPromise);

    patientServiceMock.search.and.callFake(function () {
        return specUtil.respondWith({data: {pageOfResults: [{uuid: "123"}]}});
    });

    providerServiceMock.search.and.callFake(function () {
        return specUtil.respondWith({data: {pageOfResults: [{uuid: "123"}]}});
    });

    beforeEach(module('bahmni.registration'));
    beforeEach(
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            scope.patient = {};
            rootScope = $rootScope;
            rootScope.relationshipTypes = [{
                aIsToB: "Doctor",
                searchType: "provider",
                uuid: "8d919b58-c2cc-11de-8d13-0010c6dffd0f"
            },
                {aIsToB: "Sibling", searchType: "patient", uuid: "8d91a01c-c2cc-11de-8d13-0010c6dffd0f"},
                {aIsToB: "Parent", searchType: "patient", uuid: "8d91a210-c2cc-11de-8d13-0010c6dffd0f"},
                {aIsToB: "Aunt/Uncle", searchType: "patient", uuid: "8d91a3dc-c2cc-11de-8d13-0010c6dffd0f"},
                {aIsToB: "Supervisor", searchType: "patient", uuid: "2a5f4ff4-a179-4b8a-aa4c-40f71956ebbc"}];
            $controller('PatientRelationshipController', {
                $scope: scope,
                $rootScope: rootScope,
                spinner: spinner,
                patientService: patientServiceMock,
                providerService: providerServiceMock
            });
        })
    );

    describe("Add relationship", function () {
        it("should add provider relationship", function () {
            expect(scope.patient.relationships).toEqual([]);
            scope.addRelationship({
                providerName: "Doctor",
                relationshipType: {"uuid": "8d919b58-c2cc-11de-8d13-0010c6dffd0f"},
                voided: false,
                personB: {"uuid": "uuid"}
            });
            expect(scope.patient.relationships.length).toBe(1);
        });

        it("should add patient relationship", function () {
            expect(scope.patient.relationships).toEqual([]);
            scope.addRelationship({
                patientIdentifier: "Patient",
                relationshipType: {"uuid": "8d91a01c-c2cc-11de-8d13-0010c6dffd0f"},
                voided: false,
                personB: {"uuid": "uuid"}
            });
            expect(scope.patient.relationships.length).toBe(1);
        });
    });

    describe("Remove relationship", function () {
        it("should remove newly added relationship", function () {
            expect(scope.patient.relationships).toEqual([]);
            var relationship = {patientIdentifier: "Doctor"};
            scope.addRelationship(relationship);
            scope.removeRelationship(relationship);
            expect(scope.patient.relationships.length).toBe(0);
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
            expect(scope.patient.relationships[0].voided).toBeTruthy()
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
            expect(patientServiceMock.search).toHaveBeenCalled();
            done();
        });
    });

    describe("Check duplicate relationship", function(){
        it("should return true if the relationship is already exists", function () {
            scope.patient.relationships = [{
                patientIdentifier: "Doctor",
                relationshipType: {"uuid": "8d919b58-c2cc-11de-8d13-0010c6dffd0f"},
                personB: {"uuid": "uuid"}
            }];
            var duplicateRelationship = {
                patientIdentifier: "Doctor1",
                relationshipType: {"uuid": "8d919b58-c2cc-11de-8d13-0010c6dffd0f"},
                personB: {"uuid": "uuid2"}
            };
            expect(scope.checkDuplicateRelationship(duplicateRelationship)).toBeTruthy();
        });

        it("should return false if the relationship is not exists", function () {
            scope.patient.relationships = [{
                patientIdentifier: "Doctor",
                relationshipType: {"uuid": "8d919b58-c2cc-11de-8d13-0010c6dffd0f"},
                personB: {"uuid": "uuid"}
            }];
            var duplicateRelationship = {
                patientIdentifier: "Doctor1",
                relationshipType: {"uuid": "5d919b58-c2cc-11de-8d13-0010c6dffd0f"},
                personB: {"uuid": "uuid2"}
            };
            expect(scope.checkDuplicateRelationship(duplicateRelationship)).toBeFalsy();
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

    describe("clearRelationshipRow", function(){
        it("should clear the relationship data", function () {
            var patientRelationship = {
                patientIdentifier: "Doctor",
                relationshipType: {"uuid": "8d91a01c-c2cc-11de-8d13-0010c6dffd0f"},
                personB: {"uuid": "uuid"}
            };
            expect(patientRelationship.patientIdentifier).toBeDefined();
            scope.clearRelationshipRow(patientRelationship);
            expect(patientRelationship.patientIdentifier).toBeUndefined();
            var providerRelationship = {
                patientIdentifier: "Doctor",
                relationshipType: {"uuid": "8d91a01c-c2cc-11de-8d13-0010c6dffd0f"},
                personB: {"uuid": "uuid"}
            };
            expect(providerRelationship.patientIdentifier).toBeDefined();
            scope.clearRelationshipRow(providerRelationship);
            expect(providerRelationship.providerName).toBeUndefined();
        });
    });

    describe("clearRelationshipRow", function(){
        it("should have called providerService when get provider list is called", function () {
            var searchAttrs = {'term': 'search this'};
            (scope.getProviderList())(searchAttrs);
            expect(providerServiceMock.search).toHaveBeenCalled();
        });
    });

});