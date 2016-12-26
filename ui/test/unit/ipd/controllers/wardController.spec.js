'use strict';

describe('WardController', function() {

    var controller;
    var rootScope;
    var scope;
    var beds = [
        {bedId: 1,
            bedNumber: "I1",
            bedType: {description: "This is the ICU bed type",
                displayName: "ICU Bed",
                id: 102,
                name: "ICU Bed"},
            columnNumber: 1,
            rowNumber: 1,
            status: "OCCUPIED"
        },
        {bedId: 2,
            bedNumber: "I2",
            bedType: {description: "This is another bed type",
                displayName: "ICU Bed",
                id: 103,
                name: "ICU Bed"},
            columnNumber: 2,
            rowNumber: 2,
            status: "AVAILABLE"
        }];

    var room1 = {name: "room1", beds: beds};

    beforeEach(function() {
        module('bahmni.ipd');
    });

    beforeEach(function() {
        inject(function($controller, $rootScope) {
            controller = $controller;
            rootScope = $rootScope;
            scope = $rootScope.$new();
            scope.ward = {rooms: [room1]};
            rootScope.bedDetails = {physicalLocationName: "room1"};
            spyOn(scope, '$emit');
        });
        controller('WardController', {
            $scope: scope,
            $rootScope: rootScope
        });

    });

    it('should initialize room info based the selected room', function() {
        scope.onSelectRoom("room1");
        expect(scope.room).toBe(room1);
        expect(scope.roomSelected).toBeTruthy();
        expect(scope.$emit).toHaveBeenCalledWith("event:roomSelected", "room1");
    });

    it('should initialize room info, if the patient is already admitted having bedDetails on the rootScope', function() {
        rootScope.bedDetails = {physicalLocationName: "room1"};
        expect(scope.room).toBe(room1);
        expect(scope.roomSelected).toBeTruthy();
        expect(scope.$emit).toHaveBeenCalledWith("event:roomSelected", "room1");
    });
});