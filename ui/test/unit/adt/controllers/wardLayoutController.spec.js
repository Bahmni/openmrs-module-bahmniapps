'use strict';

describe('WardLayoutController', function () {

    var bedService = jasmine.createSpyObj('bedService', ['assignBed', 'setBedDetailsForPatientOnRootScope']);
    var wardService = jasmine.createSpyObj('WardService', ['bedsForWard']);
    var messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
    var controller;
    var rootScope;
    var scope;
    var element;

    beforeEach(function () {
        module('bahmni.adt');

        element = {
            find: function() { return this; },
            hide: function() { return this; }
        };
    });

    beforeEach(function () {
        inject(function($controller, $rootScope) {
            controller = $controller;
            rootScope = $rootScope;
            scope = $rootScope.$new();
        });
    });

    function createController() {
        return controller('WardLayoutController', {
            $scope: scope,
            WardService: wardService,
            bedManagementService: {},
            bedService: bedService,
            messagingService: messagingService,
            $element: element
        });
    }

    describe('assignBed', function () {

        it("should assign bed to the patient", function () {
            var bedData = {bed: {bedId: 'bed1', 'bedNumber': '1'}};
            var assignBedPromise = specUtil.createServicePromise('assignBed');
            assignBedPromise.success = function(successFn) {
                successFn();
                return assignBedPromise;
            };
            bedService.assignBed.and.returnValue(assignBedPromise);
            wardService.bedsForWard.and.returnValue(specUtil.createServicePromise('bedsForWard'));
            scope.ward = {ward: {name: 'ward1'}};
            scope.patientUuid = 'patient1';
            spyOn(element, 'hide');

            createController();
            scope.assignBed(bedData);

            expect(rootScope.bed).toEqual(bedData.bed);
            expect(bedService.setBedDetailsForPatientOnRootScope).toHaveBeenCalledWith('patient1');
            expect(messagingService.showMessage).toHaveBeenCalledWith('info', "Bed 1 is assigned successfully");
            expect(element.hide).toHaveBeenCalled();
        });

    });

    describe('bedDetails watch', function() {
        beforeEach(function() {
            scope.ward = {ward: {name: 'ward1', uuid: 'warduuid1'}};
            wardService = jasmine.createSpyObj('WardService', ['bedsForWard']); //To reset the calls count
            wardService.bedsForWard.and.returnValue(specUtil.createServicePromise('bedsForWard'));
        });

        it("should reload if the assigned bed IS present in this ward layout", function() {
            rootScope.bedDetails = {wardUuid: 'something'};

            createController();
            scope.$digest();
            rootScope.bedDetails = {wardUuid: 'warduuid1'};
            scope.$digest();

            expect(wardService.bedsForWard.calls.count()).toBe(2);
        });

        it("should reload if the assigned bed WAS present in this ward layout", function() {
            rootScope.bedDetails = {wardUuid: 'warduuid1'};

            createController();
            scope.$digest();
            rootScope.bedDetails = {wardUuid: 'something'};
            scope.$digest();

            expect(wardService.bedsForWard.calls.count()).toBe(2);
        });

        it("should not reload otherwise", function() {

        });
    });

    describe('highlightCurrentPatient', function() {
        var cell;
        beforeEach(function() {
            cell = {bed: {bedId: 123}};
            rootScope.bedDetails = {bedId: 123};
            scope.ward = {ward: {name: 'ward1'}};
        });

        it('should highlight for assignable view', function() {
            scope.readOnly = false;

            createController();
            expect(scope.highlightCurrentPatient(cell)).toBe(true);
        });

        it('should not highlight for readonly view', function() {
            scope.readOnly = true;

            createController();
            expect(scope.highlightCurrentPatient(cell)).toBe(false);
        });

        it('should not highlight for any other bed', function() {
            scope.readOnly = false;
            rootScope.bedDetails = {bedId: 234};

            createController();
            expect(scope.highlightCurrentPatient(cell)).toBe(false);
        })
    });

});