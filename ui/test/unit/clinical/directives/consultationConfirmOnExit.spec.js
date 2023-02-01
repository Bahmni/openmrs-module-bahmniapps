'use strict';

describe("consultationConfirmOnExit", function () {
    var element, scope, compile;
    var state = jasmine.createSpyObj('$state', ['go']);
    state.params = {
        patientUuid: 'patientUuid'
    }
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
        clinicalAppConfigService.getAllConsultationBoards.and.returnValue([{url: 'consultation'}, {url: 'observations'}]);
    });

    it("should set dirtyConsultationForm to be false if nothing is set", function() {
        element = angular.element('<form consultation-confirm-on-exit name="dummyForm"><input value="text"/></form>');
        element = compile(element)(scope);
        scope.$digest();
        scope.consultation = {
            orders: [],
            investigations: []
        };
        scope.$emit('$stateChangeStart', {url: '/consultation'}, {patientUuid: 'patientUuid'});

        expect(state.dirtyConsultationForm).toBe(undefined);
        expect(messagingService.showMessage).not.toHaveBeenCalled();
        expect(spinner.hide).not.toHaveBeenCalled();
    })

    it("should not set dirtyConsultationForm if the form is not dirty", function() {
        element = angular.element('<form consultation-confirm-on-exit name="dummyForm"><input value="text"/></form>');
        element = compile(element)(scope);
        scope.$digest();
        scope.consultation = {
            orders: [],
            investigations: []
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
            orders: [],
            investigations: []
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
            investigations: [],
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

    it("should set dirtyConsultationForm to be true if number of orders is not same as number of investigations", function() {
        element = angular.element('<form consultation-confirm-on-exit name="dummyForm"><input value="text"/></form>');
        element = compile(element)(scope);
        scope.$digest();
        scope.consultation = {
            orders: [{
                id: 345
            }],
            investigations: [
                {
                    uuid:14
                },
                {
                    uuid: 345
                }
            ]
        };
        scope.$emit('$stateChangeStart', {url: '/consultation'}, {patientUuid: 'patientUuid'});

        expect(state.dirtyConsultationForm).toBe(true);
    });

    it('should not show error message if there are no dirty changes and navigating out of patient dashboard', function () {
        scope.$emit('$stateChangeStart', {url: '/dashboard/uuid'}, {patientUuid: 'patientUuid'});

        expect(messagingService.showMessage).not.toHaveBeenCalled();
        expect(spinner.hide).not.toHaveBeenCalled();
    });

    it('should not show error message if there are dirty changes but navigating inside patient dashboard', function () {
        element = angular.element('<form consultation-confirm-on-exit name="dummyForm"><input value="text"/></form>');
        element = compile(element)(scope);
        scope.$digest();

        scope.$emit('$stateChangeStart', {url: '/dashboard/patientUuid'}, {patientUuid: 'patientUuid'});

        expect(messagingService.showMessage).not.toHaveBeenCalled();
        expect(spinner.hide).not.toHaveBeenCalled();
    });

    it('should not show error message if there are dirty changes but navigating inside observation tabs', function () {
        element = angular.element('<form consultation-confirm-on-exit name="dummyForm"><input value="text"/></form>');
        element = compile(element)(scope);
        scope.$digest();

        scope.$emit('$stateChangeStart', {url: '/consultation'}, {patientUuid: 'patientUuid'});

        expect(messagingService.showMessage).not.toHaveBeenCalled();
        expect(spinner.hide).not.toHaveBeenCalled();
    });

    it('should show error message if there are dirty changes and navigating out of patient dashboard', function () {
        element = angular.element('<form consultation-confirm-on-exit name="dummyForm"><input value="text"/></form>');
        element = compile(element)(scope);
        scope.$digest();

        scope.$emit('$stateChangeStart', {url: '/dashboard/patientUuid'}, {patientUuid: 'uuid'});

        expect(messagingService.showMessage).toHaveBeenCalled();
        expect(spinner.hide).toHaveBeenCalled();
    });


});
