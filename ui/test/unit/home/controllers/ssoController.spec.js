'use strict';

describe('SsoController', function () {
    var $controller, $rootScope, $q, $httpBackend, scope, state, sessionService, spinner;

    beforeEach(module('bahmni.home'));

    beforeEach(inject(function (_$controller_, _$rootScope_, _$q_, _$httpBackend_) {
        $controller = _$controller_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        $httpBackend = _$httpBackend_;
        $httpBackend.whenGET('../i18n/home/locale_en.json').respond({});
        $httpBackend.whenGET('../i18n/common/locale_en.json').respond({});
        $httpBackend.whenGET('/bahmni_config/openmrs/i18n/home/locale_en.json').respond({});
        $httpBackend.whenGET('/bahmni_config/openmrs/i18n/common/locale_en.json').respond({});
        scope = $rootScope.$new();
        state = jasmine.createSpyObj('$state', ['go']);
        sessionService = jasmine.createSpyObj('sessionService', ['loadSsoSession', 'loadCredentials']);
        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
    }));

    var createController = function () {
        $controller('SsoController', {
            $scope: scope,
            $state: state,
            sessionService: sessionService,
            spinner: spinner
        });
        $rootScope.$digest();
    };

    it('should go to login when there is no authenticated session', function () {
        sessionService.loadSsoSession.and.returnValue($q.when(null));

        createController();

        expect(state.go).toHaveBeenCalledWith('login');
        expect(sessionService.loadCredentials).not.toHaveBeenCalled();
    });

    it('should go to login when the session cannot be loaded', function () {
        sessionService.loadSsoSession.and.returnValue($q.reject('error'));

        createController();

        expect(state.go).toHaveBeenCalledWith('login');
        expect(sessionService.loadCredentials).not.toHaveBeenCalled();
    });

    it('should go to loginLocation when the session has no location', function () {
        sessionService.loadSsoSession.and.returnValue($q.when({user: {username: 'superman'}}));

        createController();

        expect(state.go).toHaveBeenCalledWith('loginLocation');
        expect(sessionService.loadCredentials).not.toHaveBeenCalled();
    });

    it('should load credentials and go to dashboard when the session has a location', function () {
        sessionService.loadSsoSession.and.returnValue($q.when({sessionLocation: {uuid: 'location-uuid'}}));
        sessionService.loadCredentials.and.returnValue($q.when());

        createController();

        expect(sessionService.loadCredentials).toHaveBeenCalled();
        expect(state.go).toHaveBeenCalledWith('dashboard');
        expect(scope.errorMessageTranslateKey).toBeUndefined();
    });

    it('should set the error message and stay on the page when loading credentials fails', function () {
        sessionService.loadSsoSession.and.returnValue($q.when({sessionLocation: {uuid: 'location-uuid'}}));
        sessionService.loadCredentials.and.returnValue($q.reject('YOU_HAVE_NOT_BEEN_SETUP_PROVIDER'));

        createController();

        expect(scope.errorMessageTranslateKey).toBe('YOU_HAVE_NOT_BEEN_SETUP_PROVIDER');
        expect(state.go).not.toHaveBeenCalled();
    });

    it('should show the spinner while the session is being loaded', function () {
        var promise = $q.when(null);
        sessionService.loadSsoSession.and.returnValue(promise);

        createController();

        expect(spinner.forPromise).toHaveBeenCalled();
    });
});
