'use strict';

xdescribe('PatientActionController', function () {

    var windowMock = jasmine.createSpyObj('window', ['']);
    var locationMock = jasmine.createSpyObj('location', ['path']);
    var stateMock = jasmine.createSpyObj('state', ['']);
    var spinnerMock = jasmine.createSpyObj('spinner', ['forPromise']);
    var rootScopeMock = jasmine.createSpyObj('rootScope', ['']);
    var encounterServiceMock = jasmine.createSpyObj('encounterService', ['']);
    var sessionServiceMock = jasmine.createSpyObj('sessionService', ['']);
    var visitServiceMock = jasmine.createSpyObj('visitService', ['search']);
    var appDescriptor = jasmine.createSpyObj('appDescriptor', ['getExtensions', 'getConfigValue']);
    var appServiceMock = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    var stateParamsMock = jasmine.createSpyObj('stateParams', ['']);
    var scopeMock = jasmine.createSpyObj('scope',['']);
    var $aRootScope;
    var $aController;

    var createController = function() {
        return $aController('PatientActionController', {
            $window: windowMock,
            $location: locationMock,
            $state: stateMock,
            spinner: spinnerMock,
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            $stateParams: stateParamsMock,
            appService: appServiceMock,
            visitService: visitServiceMock,
            sessionService: sessionServiceMock,
            encounterService: encounterServiceMock
        });
    }

    beforeEach(module('bahmni.registration'));
    beforeEach(function() {
        appServiceMock.getAppDescriptor = function() { return appDescriptor };
        rootScopeMock.regEncounterConfiguration = { getVistTypesAsArray: function() {return []}};
        scopeMock.actions = {}
    });
    beforeEach(
        inject(function ($controller, $rootScope) {
            $aController = $controller;
            $aRootScope = $rootScope;
        })
    );


    describe('should init', function () {
        it('should set the hasActiveVisit to false for new patient', function () {
            stateParamsMock.patientUuid = undefined;
            var controller = createController();
            expect(controller.hasActiveVisit).toBeFalsy();
        });

        var visitServiceMockSearch = function(result) {
            var searchResults = {results: result};
            visitServiceMock.search = function () {
                return {
                    success: function (successFn) {
                        successFn(searchResults);
                    }
                }
            };
        };

        it('should set the hasActiveVisit if there is an active visit for existing patient', function () {
            stateParamsMock.patientUuid = 'patient123';
            visitServiceMockSearch(['abc']);
            var controller = createController();
            expect(controller.hasActiveVisit).toBeTruthy();
        });

        it('should set the hasActiveVisit to false if there is NO active visit for existing patient', function () {
            stateParamsMock.patientUuid = 'patient123';
            visitServiceMockSearch([]);
            var controller = createController();
            expect(controller.hasActiveVisit).toBeFalsy();
        });
    });

    describe('forwardActionKey', function () {

        it("should return the forward action key for starting the visit", function () {
            appDescriptor.getExtensions = function() {return []};
            var controller = createController();
            controller.hasActiveVisit = false;

            expect(scopeMock.forwardActionKey()).toBe("startVisit");
        });

        it("should return the forward action key for navigating to the existing the visit details", function () {
            appDescriptor.getExtensions = function() {return []};
            var controller = createController();
            controller.hasActiveVisit = true;

            expect(scopeMock.forwardActionKey()).toBe("enterVisitDetails");
        });

        it("should return the forward action key for navigating to the consultation page", function () {
            appDescriptor.getExtensions = function() {return ['extn']};
            createController();

            expect(scopeMock.forwardActionKey()).toBe("configAction");
            expect(scopeMock.actionConfig).toBe('extn');
        });

    });

    it('should set the right submit source onStartVisit', function () {
        createController();
        scopeMock.visitControl.onStartVisit();

        expect(scopeMock.actions.submitSource).toBe('startVisit');
    });

    it('should set the submitSource', function() {
        createController();
        scopeMock.setSubmitSource("source1");

        expect(scopeMock.actions.submitSource).toBe('source1');
    });

});