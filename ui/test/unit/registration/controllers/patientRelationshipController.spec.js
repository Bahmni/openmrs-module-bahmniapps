'use strict';

describe('PatientRelationshipController', function () {

    var patientServiceMock = jasmine.createSpyObj('patientService', ['search']);
    var providerServiceMock = jasmine.createSpyObj('providerService', ['search']);
    var rootScope;
    var scope;

    var patientServiceSearchPromise = specUtil.respondWith({data:{results:[{uuid:"123"}]}});
    providerServiceMock.search.and.returnValue(patientServiceSearchPromise);

    var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
    spinner.forPromise.and.returnValue(patientServiceSearchPromise);


    //providerServiceMock.search.and.callFake(function() {
    //   return specUtil.respondWith({data:{results:[{uuid:"123"}]}});
    //});

    patientServiceMock.search.and.callFake(function() {
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

    it("should add relationship to newlyAddedRelationships", function() {
        expect(rootScope.newlyAddedRelationships).toEqual([{voided:false}]);
        scope.addRelationship({personName:"Doctor",relationshipType : {"uuid":"8d919b58-c2cc-11de-8d13-0010c6dffd0f"}, voided:false, personB : { "uuid":"uuid"}});
        expect(rootScope.newlyAddedRelationships.length).toBe(2);
    });

    it("should remove relationship from newlyAddedRelationships", function() {
        expect(rootScope.newlyAddedRelationships).toEqual([{voided:false}]);
        var relationship = {personName:"Doctor"};
        scope.addRelationship(relationship);
        scope.removeRelationship(relationship);
        expect(rootScope.newlyAddedRelationships.length).toBe(1);
    });

    it("should have called providerService for Doctor", function(done) {
        var relationship = {personName:"Doctor",relationshipType : {"uuid":"8d919b58-c2cc-11de-8d13-0010c6dffd0f"},personB : { "uuid":"uuid"}};
        rootScope.newlyAddedRelationships = [relationship];
        scope.searchByType(relationship);
        expect(providerServiceMock.search).toHaveBeenCalled();
        //expect(rootScope.newlyAddedRelationships[0].personUuid).toBe("123");
        done();
    });

    it("should check duplicate relationship type to be true", function() {
        var relationship = {personName:"Doctor",relationshipType : {"uuid":"8d919b58-c2cc-11de-8d13-0010c6dffd0f"},personB : { "uuid":"uuid"}};
        rootScope.newlyAddedRelationships = [relationship];
        var duplicateRelationship = {personName:"Doctor1",relationshipType : {"uuid":"8d919b58-c2cc-11de-8d13-0010c6dffd0f"},personB : { "uuid":"uuid2"}};
        scope.addRelationship(duplicateRelationship);
        expect(scope.checkDuplicateRelationship(duplicateRelationship)).toBeTruthy();
    });

    it("should check non-duplicate relationship type to be false", function() {
        var relationship = {personName:"Doctor",relationshipType : {"uuid":"8d919b58-c2cc-11de-8d13-0010c6dffd0f"},personB : { "uuid":"uuid"}};
        rootScope.newlyAddedRelationships = [relationship];
        var duplicateRelationship = {personName:"Doctor1",relationshipType : {"uuid":"another-uuid"},personB : { "uuid":"uuid2"}};
        scope.addRelationship(duplicateRelationship);
        expect(scope.checkDuplicateRelationship(duplicateRelationship)).toBeFalsy();
    });
});