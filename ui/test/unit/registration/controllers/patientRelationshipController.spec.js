'use strict';

describe('PatientRelationshipController', function () {

    var patientServiceMock = jasmine.createSpyObj('patientService', ['search']);
    var providerServiceMock = jasmine.createSpyObj('providerService', ['search']);
    var rootScope;
    var scope;

    var patientServiceSearchPromise = specUtil.respondWith({data:{results:[{uuid:"123"}]}});
    patientServiceMock.search.and.returnValue(patientServiceSearchPromise);

    var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
    spinner.forPromise.and.returnValue(patientServiceSearchPromise);

    patientServiceMock.search.and.callFake(function() {
        return specUtil.respondWith({data:{pageOfResults:[{uuid:"123"}]}});
    });

    providerServiceMock.search.and.callFake(function() {
        return specUtil.respondWith({data:{pageOfResults:[{uuid:"123"}]}});
    });

    beforeEach(module('bahmni.registration'));
    beforeEach(
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            rootScope = $rootScope;
            rootScope.relationshipTypes =[{aIsToB: "Doctor",searchType: "provider", uuid: "8d919b58-c2cc-11de-8d13-0010c6dffd0f"},
                {aIsToB: "Sibling", searchType: "patient", uuid: "8d91a01c-c2cc-11de-8d13-0010c6dffd0f"},
                {aIsToB: "Parent",searchType: "patient",uuid: "8d91a210-c2cc-11de-8d13-0010c6dffd0f"},
                {aIsToB: "Aunt/Uncle",searchType: "patient",uuid: "8d91a3dc-c2cc-11de-8d13-0010c6dffd0f"},
                {aIsToB: "Supervisor",searchType: "patient",uuid: "2a5f4ff4-a179-4b8a-aa4c-40f71956ebbc"}];
            $controller('PatientRelationshipController', {
                $scope: scope,
                $rootScope: rootScope,
                spinner: spinner,
                patientService: patientServiceMock,
                providerService: providerServiceMock
            });
        })
    );

    it("should have one dummy relationship by default", function() {
        expect(rootScope.newlyAddedRelationships).toEqual([{voided:false}]);
    });

    it("should not display relationships when rootscope does not have relationshipTypes", function() {
        rootScope.relationshipTypes = undefined;
        expect(scope.displayRelationships()).toBeFalsy();
    });

    it("should display relationships when rootscope has relationshipTypes", function() {
        rootScope.relationshipTypes = [{}];
        expect(scope.displayRelationships()).toBeTruthy();
    });

    it("should add provider relationship to newlyAddedRelationships", function() {
        expect(rootScope.newlyAddedRelationships).toEqual([{voided:false}]);
        scope.addRelationship({providerName:"Doctor",relationshipType : {"uuid":"8d919b58-c2cc-11de-8d13-0010c6dffd0f"}, voided:false, personB : { "uuid":"uuid"}});
        expect(rootScope.newlyAddedRelationships.length).toBe(2);
    });

    it("should add patient relationship to newlyAddedRelationships", function() {
        expect(rootScope.newlyAddedRelationships).toEqual([{voided:false}]);
        scope.addRelationship({patientName:"Patient",relationshipType : {"uuid":"8d91a01c-c2cc-11de-8d13-0010c6dffd0f"}, voided:false, personB : { "uuid":"uuid"}});
        expect(rootScope.newlyAddedRelationships.length).toBe(2);
    });

    it("should remove relationship from newlyAddedRelationships", function() {
        expect(rootScope.newlyAddedRelationships).toEqual([{voided:false}]);
        var relationship = {patientName:"Doctor"};
        scope.addRelationship(relationship);
        scope.removeRelationship(relationship);
        expect(rootScope.newlyAddedRelationships.length).toBe(1);
    });

    it("should have called providerService for Doctor", function(done) {
        var relationship = {patientName:"Patient",relationshipType : {"uuid":"8d91a01c-c2cc-11de-8d13-0010c6dffd0f"},personB : { "uuid":"uuid"}};
        rootScope.newlyAddedRelationships = [relationship];
        scope.searchByPatientName(relationship);
        expect(patientServiceMock.search).toHaveBeenCalled();
        done();
    });

    it("should check duplicate relationship type to be true", function() {
        var relationship = {patientName:"Doctor",relationshipType : {"uuid":"8d919b58-c2cc-11de-8d13-0010c6dffd0f"},personB : { "uuid":"uuid"}};
        rootScope.newlyAddedRelationships = [relationship];
        var duplicateRelationship = {patientName:"Doctor1",relationshipType : {"uuid":"8d919b58-c2cc-11de-8d13-0010c6dffd0f"},personB : { "uuid":"uuid2"}};
        scope.addRelationship(duplicateRelationship);
        expect(scope.checkDuplicateRelationship(duplicateRelationship)).toBeTruthy();
    });

    it("should check non-duplicate relationship type to be false", function() {
        var relationship = {patientName:"Doctor",relationshipType : {"uuid":"8d919b58-c2cc-11de-8d13-0010c6dffd0f"},personB : { "uuid":"uuid"}};
        rootScope.newlyAddedRelationships = [relationship];
        var duplicateRelationship = {patientName:"Doctor1",relationshipType : {"uuid":"another-uuid"},personB : { "uuid":"uuid2"}};
        scope.addRelationship(duplicateRelationship);
        expect(scope.checkDuplicateRelationship(duplicateRelationship)).toBeFalsy();
    });

    it("should give the relationship type as 'patient' for patienttype uuid", function() {
        expect(scope.getRelationshipType("8d91a01c-c2cc-11de-8d13-0010c6dffd0f")).toBe("patient");
    });

    it("should give the relationship type as 'provider' for doctor uuid", function() {
        expect(scope.getRelationshipType("8d919b58-c2cc-11de-8d13-0010c6dffd0f")).toBe("provider");
    });

    it("should check if relationship type is patient", function() {
        var relationship = {patientName:"Patient",relationshipType : {"uuid":"8d91a01c-c2cc-11de-8d13-0010c6dffd0f"},personB : { "uuid":"uuid"}};
        expect(scope.isPatientRelationship(relationship)).toBeTruthy();
    });

    it("should check if relationship type is not patient", function() {
        var relationship = {patientName:"Doctor",relationshipType : {"uuid":"8d919b58-c2cc-11de-8d13-0010c6dffd0f"},personB : { "uuid":"uuid"}};
        expect(scope.isPatientRelationship(relationship)).toBeFalsy();
    });

    it("should check if relationship type is provider", function() {
        var relationship = {patientName:"Doctor",relationshipType : {"uuid":"8d919b58-c2cc-11de-8d13-0010c6dffd0f"},personB : { "uuid":"uuid"}};
        expect(scope.isProviderRelationship(relationship)).toBeTruthy();
    });

    it("should check if relationship type is not patient", function() {
        var relationship = {patientName:"Doctor",relationshipType : {"uuid":"8d91a01c-c2cc-11de-8d13-0010c6dffd0f"},personB : { "uuid":"uuid"}};
        expect(scope.isProviderRelationship(relationship)).toBeFalsy();
    });

    it("should clear the relationship data", function() {
        var patientRelationship = {patientName:"Doctor",relationshipType : {"uuid":"8d91a01c-c2cc-11de-8d13-0010c6dffd0f"},personB : { "uuid":"uuid"}};
        expect(patientRelationship.patientName).toBeDefined();
        scope.clearRelationshipRow(patientRelationship);
        expect(patientRelationship.patientName).toBeUndefined();
        var providerRelationship = {patientName:"Doctor",relationshipType : {"uuid":"8d91a01c-c2cc-11de-8d13-0010c6dffd0f"},personB : { "uuid":"uuid"}};
        expect(providerRelationship.patientName).toBeDefined();
        scope.clearRelationshipRow(providerRelationship);
        expect(providerRelationship.providerName).toBeUndefined();
    });

    it("should have called providerService when get provider list is called", function() {
        var searchAttrs = {'term' : 'search this'};
        (scope.getProviderList())(searchAttrs);
        expect(providerServiceMock.search).toHaveBeenCalled();
    });
});