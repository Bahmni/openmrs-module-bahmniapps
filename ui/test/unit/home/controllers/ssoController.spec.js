'use strict';

describe('SsoController', function () {
    var $controller, $rootScope, $q, $httpBackend, scope, state, mockWindow, sessionService, spinner, ssoConfig,
        loginInitialization, postLoginService, auditLogService;

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
        mockWindow = {location: ''};
        sessionService = jasmine.createSpyObj('sessionService', ['loadSsoSession', 'loadCredentials']);
        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        ssoConfig = jasmine.createSpyObj('ssoConfig', ['get']);
        ssoConfig.get.and.returnValue($q.when({enabled: true, logoutUrl: '/custom/logout'}));
        loginInitialization = {loadHomeConfig: jasmine.createSpy('loadHomeConfig').and.returnValue($q.when())};
        postLoginService = jasmine.createSpyObj('postLoginService', ['saveAssignedLoginLocations', 'onLoggedIn']);
        auditLogService = jasmine.createSpyObj('auditLogService', ['log']);
        localStorage.setItem(Bahmni.Common.Constants.ssoLoginFlag, 'true');
        localStorage.setItem(Bahmni.Common.Constants.ssoLogoutUrlKey, '/custom/logout');
    }));

    afterEach(function () {
        localStorage.removeItem(Bahmni.Common.Constants.ssoLoginFlag);
        localStorage.removeItem(Bahmni.Common.Constants.ssoLogoutUrlKey);
    });

    var createController = function () {
        $controller('SsoController', {
            $scope: scope,
            $state: state,
            $window: mockWindow,
            sessionService: sessionService,
            spinner: spinner,
            ssoConfig: ssoConfig,
            loginInitialization: loginInitialization,
            postLoginService: postLoginService,
            auditLogService: auditLogService
        });
        $rootScope.$digest();
    };

    describe('when the login cannot be completed', function () {
        it('should go to login with an error message when there is no authenticated session', function () {
            sessionService.loadSsoSession.and.returnValue($q.when(null));

            createController();

            expect(state.go).toHaveBeenCalledWith('login', {showLoginMessage: true});
            expect(sessionService.loadCredentials).not.toHaveBeenCalled();
        });

        it('should go to login with an error message when the session cannot be loaded', function () {
            sessionService.loadSsoSession.and.returnValue($q.reject('error'));

            createController();

            expect(state.go).toHaveBeenCalledWith('login', {showLoginMessage: true});
            expect(sessionService.loadCredentials).not.toHaveBeenCalled();
        });

        it('should show the error and not complete the login when loading credentials fails', function () {
            sessionService.loadSsoSession.and.returnValue($q.when({sessionLocation: {uuid: 'location-uuid'}}));
            sessionService.loadCredentials.and.returnValue($q.reject('YOU_HAVE_NOT_BEEN_SETUP_PROVIDER'));

            createController();

            expect(scope.errorMessageTranslateKey).toBe('YOU_HAVE_NOT_BEEN_SETUP_PROVIDER');
            expect(state.go).not.toHaveBeenCalled();
            expect(postLoginService.saveAssignedLoginLocations).not.toHaveBeenCalled();
            expect(auditLogService.log).not.toHaveBeenCalled();
        });

        it('should end the Keycloak session and clear the sso keys when the user leaves the error page', function () {
            sessionService.loadSsoSession.and.returnValue($q.when({sessionLocation: {uuid: 'location-uuid'}}));
            sessionService.loadCredentials.and.returnValue($q.reject('YOU_HAVE_NOT_BEEN_SETUP_PROVIDER'));
            createController();

            scope.endSsoSession();

            expect(mockWindow.location).toBe('/custom/logout');
            expect(localStorage.getItem(Bahmni.Common.Constants.ssoLoginFlag)).toBeNull();
            expect(localStorage.getItem(Bahmni.Common.Constants.ssoLogoutUrlKey)).toBeNull();
        });
    });

    describe('when the user is authenticated', function () {
        beforeEach(function () {
            sessionService.loadCredentials.and.returnValue($q.when());
            $rootScope.currentUser = {provider: {attributes: []}};
        });

        afterEach(function () {
            $rootScope.currentUser = undefined;
        });

        it('should pass the configured logout url when loading the sso session', function () {
            sessionService.loadSsoSession.and.returnValue($q.when(null));

            createController();

            expect(sessionService.loadSsoSession).toHaveBeenCalledWith('/custom/logout');
        });

        it('should run the post-login steps of the password flow', function () {
            sessionService.loadSsoSession.and.returnValue($q.when({sessionLocation: {uuid: 'location-uuid'}}));

            createController();

            expect(postLoginService.saveAssignedLoginLocations).toHaveBeenCalledWith($rootScope.currentUser);
            expect(postLoginService.onLoggedIn).toHaveBeenCalled();
            expect(auditLogService.log).toHaveBeenCalledWith(undefined, 'USER_LOGIN_SUCCESS', undefined, 'MODULE_LABEL_LOGIN_KEY');
        });

        it('should load the home config and go to dashboard when the session has a location', function () {
            sessionService.loadSsoSession.and.returnValue($q.when({sessionLocation: {uuid: 'location-uuid'}}));

            createController();

            expect(loginInitialization.loadHomeConfig).toHaveBeenCalled();
            expect(state.go).toHaveBeenCalledWith('dashboard');
            expect(scope.errorMessageTranslateKey).toBeUndefined();
        });

        it('should save the login locations before going to loginLocation when the session has no location', function () {
            sessionService.loadSsoSession.and.returnValue($q.when({user: {username: 'superman'}}));

            createController();

            expect(sessionService.loadCredentials).toHaveBeenCalled();
            expect(postLoginService.saveAssignedLoginLocations).toHaveBeenCalled();
            expect(auditLogService.log).toHaveBeenCalled();
            expect(loginInitialization.loadHomeConfig).not.toHaveBeenCalled();
            expect(state.go).toHaveBeenCalledWith('loginLocation');
        });

        it('should show the spinner while the session is being loaded', function () {
            sessionService.loadSsoSession.and.returnValue($q.when(null));

            createController();

            expect(spinner.forPromise).toHaveBeenCalled();
        });
    });
});
