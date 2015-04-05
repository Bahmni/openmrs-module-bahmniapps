'use strict';

describe("Patient Profile display control", function() {
    var element, scope, $compile, httpBackend, state, provide;

    beforeEach(module('bahmni.clinical'));
    beforeEach(module(function($provide){
        provide = $provide;
        provide.value('$state', {});
    }));

    beforeEach(inject(function(_$compile_, $rootScope, $httpBackend) {
        scope = $rootScope;
        $compile = _$compile_;
        httpBackend = $httpBackend;
        scope.patient = {
            "uuid": "abc",
            "name":"Patient name"
        };
        scope.currentUser = {
            recentlyViewedPatients: [{"uuid": "patient1"},{"uuid": "abc"}, {"uuid": "def"}]
        };
    }));


    it("should check whether user has visited any patient previously", function () {
        element = angular.element('<recent-patients></recent-patients>');
        httpBackend.expectGET('dashboard/views/recentPatients.html').respond('<div>recent</div>')

        $compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        expect(scope.hasPrevious()).toBe(true);
    });

    it("should check whether user has visited any patient after the current patient", function () {
        element = angular.element('<recent-patients></recent-patients>');
        httpBackend.expectGET('dashboard/views/recentPatients.html').respond('<div>recent</div>')

        $compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        expect(scope.hasNext()).toBe(true);
    });

    it("should not have any previous or next patient if he/she is the first patient", function () {
        scope.currentUser = {
            recentlyViewedPatients: [{"uuid": "abc"}]
        };
        element = angular.element('<recent-patients></recent-patients>');
        httpBackend.expectGET('dashboard/views/recentPatients.html').respond('<div>recent</div>')

        $compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        expect(scope.hasNext()).toBe(false);
        expect(scope.hasPrevious()).toBe(false);
    });

    it("should go to previous patient in the list", function () {
        var state = jasmine.createSpyObj('$state',['go']);
        provide.value('$state', state);
        scope.currentUser = {
            recentlyViewedPatients: [{"uuid": "abc"}, {"uuid": "def"}]
        };

        element = angular.element('<recent-patients></recent-patients>');
        httpBackend.expectGET('dashboard/views/recentPatients.html').respond('<div>recent</div>')

        $compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        scope.previous();
        expect(state.go).toHaveBeenCalledWith('patient.dashboard', { patientUuid : 'def' });
    });

    it("should go to next patient in the list", function () {
        var state = jasmine.createSpyObj('$state',['go']);
        provide.value('$state', state);
        scope.currentUser = {
            recentlyViewedPatients: [{"uuid": "patient1"}, {"uuid": "abc"}, {"uuid": "def"}]
        };

        element = angular.element('<recent-patients></recent-patients>');
        httpBackend.expectGET('dashboard/views/recentPatients.html').respond('<div>recent</div>')

        $compile(element)(scope);
        scope.$digest();
        httpBackend.flush();

        scope.next();
        expect(state.go).toHaveBeenCalledWith('patient.dashboard', { patientUuid : 'patient1' });
    });

});