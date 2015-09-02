'use strict';

describe("Observation data display control", function () {
    var element, scope, $compile, mockBackend;

    var observation = {
        display: "History and Examination: test1, notes nw",
        concept: {display: "History and Examination"},
        groupMembers: [{
            "display": "Non-Coded Chief Complaint: test1",
            concept: {display: "Non-Coded Chief Complaint"},
            groupMembers: null
        }]
    };

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function (_$compile_, $rootScope, $httpBackend) {
        scope = $rootScope;
        $compile = _$compile_;
        mockBackend = $httpBackend;
    }));


    it("getDisplayValue should return display in value if value is object", function () {
        var obs = observation;
        obs.value = {display: "test1"};
        var isoScope = createIsoScope(obs);
        expect(isoScope.getDisplayValue()).toBe("test1");
    });

    it("getDisplayValue should return value directly if value is not an object", function () {
        var obs = observation;
        obs.value = {display: "test1"};
        var isoScope = createIsoScope(obs);
        expect(isoScope.getDisplayValue()).toBe("test1");
    });

    it("hasGroupMembers should return true if group members are present", function () {
        var obs = observation;
        var isoScope = createIsoScope(obs);
        expect(isoScope.hasGroupMembers).toBeTruthy();
    });


    it("hasGroupMembers should return false and not throw an error if group members are null", function () {
        var obs = observation;
        obs.groupMembers = null;
        var isoScope = createIsoScope(obs);
        expect(isoScope.hasGroupMembers()).toBeFalsy();
    });

    var createIsoScope = function(obs)  {
        scope.obs = obs;
        mockBackend.expectGET('../clinical/displaycontrols/observationData/views/observationData.html').respond("<div>dummy</div>");
        element = angular.element('<observation-data observation="obs"></observation-data>');
        $compile(element)(scope);
        scope.$digest();
        mockBackend.flush();
        return element.isolateScope();
    };

});