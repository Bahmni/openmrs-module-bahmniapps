'use strict';

describe ('loginController', function () {

    var localeService, $aController, rootScopeMock, window, $q, state, _spinner, initialData, scopeMock, sessionService, $bahmniCookieStore, currentUser;

    beforeEach(module('bahmni.home'));

    beforeEach(function () {
        localeService = jasmine.createSpyObj('localeService', ['getLoginText', 'allowedLocalesList', 'serverDateTime', 'getLocalesLangs']);
        sessionService = jasmine.createSpyObj('sessionService', ['loginUser', 'loadCredentials']);
        currentUser = jasmine.createSpyObj('currentUser', ['addDefaultLocale', 'toContract']);
        _spinner = jasmine.createSpyObj('spinner', ['forPromise']);

        sessionService.loginUser();
        sessionService.loginUser.and.returnValue(specUtil.simplePromise());
        sessionService.loadCredentials.and.returnValue(specUtil.simplePromise());
        currentUser.addDefaultLocale.and.returnValue(specUtil.simplePromise({data: ""}));
        currentUser.toContract.and.returnValue(specUtil.simplePromise({data: ""}));
        localeService.allowedLocalesList.and.returnValue(specUtil.simplePromise({data: ""}));
        localeService.serverDateTime.and.returnValue(specUtil.simplePromise({data:{ date: "today" }}));
        localeService.getLoginText.and.returnValue(specUtil.simplePromise({data:{homePage:{logo:"bahmni logo"}, loginPage:{showHeaderText:"bahmni emr", logo:"bahmni logo"}, helpLink:{url:"192.168.33.10/homepage"}}}));
        localeService.getLocalesLangs.and.returnValue(specUtil.createFakePromise(
            {locales: [{code: "en" , nativeName: "English"},{code: "es", nativeName: "Español"}]
        }));
        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['get','remove','put']);
        $bahmniCookieStore.get.and.callFake(function() { return  {}; });
        initialData = {location:" "};
        _spinner.forPromise.and.returnValue(specUtil.simplePromise({}));
    });

    beforeEach(
        inject(function ($controller, $rootScope, $window, $state, _$q_) {
            $aController = $controller;
            rootScopeMock = $rootScope;
            window = $window;
            $q = _$q_;
            state = $state;
            scopeMock = rootScopeMock.$new();
            rootScopeMock.currentUser = currentUser;
        })
    );

    var loginController = function () {
        return $aController('LoginController', {
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            initialData: initialData,
            $window: window,
            $state: state,
            $q: $q,
            spinner: _spinner,
            localeService: localeService,
            sessionService: sessionService,
            $bahmniCookieStore: $bahmniCookieStore
        });
    };

    describe("login", function () {
        beforeEach(function () {
            loginController();
        });

        it('should localServer exist', function () {
            expect(localeService.allowedLocalesList).toBeDefined();
            expect(localeService.serverDateTime).toHaveBeenCalled();
            expect(localeService.getLoginText.calls.count()).toBe(1);
        });

        it('should loginUser methode called', function () {
            expect(sessionService.loginUser).toBeDefined();
            expect(sessionService.loginUser).toHaveBeenCalled();
            expect(sessionService.loginUser.calls.count()).toBe(1);
        });

        it("should show error message if time zone is different", function () {
            expect(scopeMock.warning).toBe("Warning");
            expect(scopeMock.warningMessage).toBe("WARNING_SERVER_TIME_ZONE_MISMATCH");
        });

        it("getLoginText should give proper value", function () {
            expect(scopeMock.logo).toBe("bahmni logo");
            expect(scopeMock.headerText).toBe("bahmni emr");
            expect(scopeMock.helpLink).toBe("192.168.33.10/homepage")
        });

        it('login', function () {
            scopeMock.login();
            expect(sessionService.loginUser.calls.count()).toBe(2);
            expect(sessionService.loadCredentials.calls.count()).toBe(1);
            expect(scopeMock.errorMessageTranslateKey).toBe(null);
            expect($bahmniCookieStore.remove.calls.count()).toBe(2);
            expect($bahmniCookieStore.remove).toHaveBeenCalledWith(Bahmni.Common.Constants.JSESSIONID, {
                path: '/',
                expires: 1
            });
        });
    });

    it('should map only allowed locales ', function () {
        localeService.allowedLocalesList.and.returnValue(specUtil.simplePromise({data: "en"}));
        loginController();
        expect(scopeMock.locales).toEqual([{code: 'en', nativeName: 'English'}]);
    });

    it('should assign code when nativeName not found ', function () {
        localeService.allowedLocalesList.and.returnValue(specUtil.simplePromise({data: "it"}));
        loginController();
        expect(scopeMock.locales).toEqual([{code: 'it', nativeName: 'it'}]);
    });
});