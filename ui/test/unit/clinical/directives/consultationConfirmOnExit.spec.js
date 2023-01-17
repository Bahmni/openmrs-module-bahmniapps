'use strict';

describe("consultationConfirmOnExit", function () {
    var element, scope, compile;
    var state = jasmine.createSpyObj('$state', ['go']);
    var clinicalAppConfigService = jasmine.createSpyObj('clinicalAppConfigService', ['getAllConsultationBoards']);
    var spinner = jasmine.createSpyObj('spinner', ['hide']);
    var messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);

    beforeEach(function () {
        module('bahmni.clinical');
        module(function ($provide) {
            $provide.value('$state', state);
            $provide.value('clinicalAppConfigService', clinicalAppConfigService);
            $provide.value('messagingService', messagingService);
            $provide.value('spinner', spinner);
        });
        inject(function($rootScope, $compile) {
            scope = $rootScope.$new();
            compile = $compile;
        })
    });

    it("should set dirtyConsultationForm to be false if nothing is set", function() {
        element = angular.element('<form consultation-confirm-on-exit name="dummyForm"><input value="text"/></form>');
        element = compile(element)(scope);
        scope.$digest();
        scope.consultation = {
            orders: []
        };
        scope.$emit('$stateChangeStart', {url: '/consultation'}, {patientUuid: 'patientUuid'});

        expect(state.dirtyConsultationForm).toBe(undefined);
    })

    it("should not set dirtyConsultationForm if the form is not dirty", function() {
        element = angular.element('<form consultation-confirm-on-exit name="dummyForm"><input value="text"/></form>');
        element = compile(element)(scope);
        scope.$digest();
        scope.consultation = {
            orders: []
        };
        scope.dummyForm = {
            $dirty: false
        }
        scope.$emit('$stateChangeStart', {url: '/consultation'}, {patientUuid: 'patientUuid'});

        expect(state.dirtyConsultationForm).toBe(undefined);
    });

    it("should set dirtyConsultationForm to be true if the form is dirty", function() {
        element = angular.element('<form consultation-confirm-on-exit name="dummyForm"><input value="text"/></form>');
        element = compile(element)(scope);
        scope.$digest();
        scope.consultation = {
            orders: []
        };
        scope.dummyForm = {
            $dirty: true
        }
        scope.$emit('$stateChangeStart', {url: '/consultation'}, {patientUuid: 'patientUuid'});

        expect(state.dirtyConsultationForm).toBe(true);
    });

    it("should set dirtyConsultationForm to be true if number of medications is more than 1", function() {
        element = angular.element('<form consultation-confirm-on-exit name="dummyForm"><input value="text"/></form>');
        element = compile(element)(scope);
        scope.$digest();
        scope.consultation = {
            orders: [],
            newlyAddedTreatments : {
                meds: {
                    treatments: [{
                        id: 9
                    }]
                }
            }
        };
        scope.tabConfigName = 'meds';
        scope.$emit('$stateChangeStart', {url: '/consultation'}, {patientUuid: 'patientUuid'});

        expect(state.dirtyConsultationForm).toBe(true);
    });

    it("should set dirtyConsultationForm to be true if number of orders is more than 1", function() {
        element = angular.element('<form consultation-confirm-on-exit name="dummyForm"><input value="text"/></form>');
        element = compile(element)(scope);
        scope.$digest();
        scope.consultation = {
            orders: [{
                id: 345
            }]
        };
        scope.$emit('$stateChangeStart', {url: '/consultation'}, {patientUuid: 'patientUuid'});

        expect(state.dirtyConsultationForm).toBe(true);
    });

});
