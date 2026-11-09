/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at https://www.bahmni.org/license/mplv2hd.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */

'use strict';

describe("Authentication", function () {
    var sessionService, userService, $bahmniCookieStore, $q, scope;

    beforeEach(module('authentication'));
    beforeEach(module(function ($provide) {
        var currentUserCookie = {};
        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['get', 'put', 'remove']);
        $q = jasmine.createSpyObj('$q', ['defer', 'when']);
        $bahmniCookieStore.get.and.callFake(function (cookieName) {
            if (cookieName == Bahmni.Common.Constants.currentUser) {
                return currentUserCookie;
            }
        });
        userService = jasmine.createSpyObj('userService', ['getUser', 'getProviderForUser']);

        var userResponse = {results: [{uuid: "36b6ea1f-3f5a-11e5-b380-0050568236ae"}]};
        var providers = {};

        var getUserPromise = specUtil.createServicePromise('getUser');
        getUserPromise.then = function (successFn) {
            successFn(userResponse);
            return getUserPromise;
        };

        var getProviderForUserPromise = specUtil.createServicePromise('getProviderForUser');
        getProviderForUserPromise.then = function (successFn) {
           successFn(providers);
           return getProviderForUserPromise;
        };

        userService.getUser.and.returnValue(getUserPromise);
        userService.getProviderForUser.and.returnValue(getProviderForUserPromise);

        $provide.value('$bahmniCookieStore', $bahmniCookieStore);
        $provide.value('userService', userService);
        $provide.value('$q', $q);
    }));


    describe("Should show error message ", function () {
        it("to the user when user doesn't select the location for the first time login", inject(['sessionService', '$rootScope', function (sessionService, $rootScope) {
            var deferrable = jasmine.createSpyObj('deferrable', ['reject']);
            $q.defer.and.returnValue(deferrable);
            spyOn(sessionService, 'destroy');

            sessionService.loadCredentials();

            expect(deferrable.reject).toHaveBeenCalledWith("YOU_HAVE_NOT_BEEN_SETUP_PROVIDER");
        }]));
    });


    describe("loginUser", function () {
        it("should createSession and authenticate the user then save currentUser and cookie in the $bahmniCookieStore", inject(['sessionService', '$rootScope', '$http', function (sessionService, $rootScope, $http) {
            var deferrable = jasmine.createSpyObj('deferrable', ['reject', 'resolve']);
            deferrable.promise = {
                then: function (callback) {
                    callback({authenticated: true})
                }
            };

            $q.defer.and.returnValue(deferrable);

            var fakeHttpGetPromise = {
                then: function(success, failure) {
                    success({"status" : 204});
                }
            };
            spyOn($http, 'get').and.returnValue(fakeHttpGetPromise);

            sessionService.loginUser("userName", "password", "location");
            expect($bahmniCookieStore.put).toHaveBeenCalled();
            expect($bahmniCookieStore.put.calls.count()).toBe(2);
            expect($bahmniCookieStore.remove).toHaveBeenCalledWith(Bahmni.Common.Constants.locationCookieName);
        }]));

        it("should clear a stale sso flag and logout url on password login", inject(['sessionService', '$http', function (sessionService, $http) {
            localStorage.setItem(Bahmni.Common.Constants.ssoLoginFlag, 'true');
            localStorage.setItem(Bahmni.Common.Constants.ssoLogoutUrlKey, '/custom/logout');
            var deferrable = jasmine.createSpyObj('deferrable', ['reject', 'resolve']);
            deferrable.promise = {
                then: function (callback) {
                    callback({authenticated: true})
                }
            };
            $q.defer.and.returnValue(deferrable);
            spyOn($http, 'get').and.returnValue({
                then: function (success) {
                    success({"status": 204});
                }
            });

            sessionService.loginUser("userName", "password", "location");

            expect(localStorage.getItem(Bahmni.Common.Constants.ssoLoginFlag)).toBeNull();
            expect(localStorage.getItem(Bahmni.Common.Constants.ssoLogoutUrlKey)).toBeNull();
        }]));

    });

    describe("loginUserWithOTP", function () {
        it("should authenticate the user and show otp page", inject(['sessionService', '$rootScope', '$http',function (sessionService, $rootScope, $http) {
            var deferrable = jasmine.createSpyObj('deferrable', ['reject', 'resolve']);
            deferrable.promise = {
                then: function (callback) {
                    callback({firstFactAuthorization: true})
                }
            };

            $q.defer.and.returnValue(deferrable);

            var fakeHttpGetPromise = {
                then: function(success, failure) {
                    success({"status" : 204});
                }
            };
            spyOn($http, 'get').and.returnValue(fakeHttpGetPromise);

            sessionService.loginUser("userName", "password", "location");
            expect($bahmniCookieStore.put).not.toHaveBeenCalled();
            expect($bahmniCookieStore.put.calls.count()).toBe(0);
            expect($bahmniCookieStore.remove).not.toHaveBeenCalledWith(Bahmni.Common.Constants.locationCookieName);
        }]));


        it("should createSession and authenticate the user with OTP then save currentUser and cookie in the $bahmniCookieStore", inject(['sessionService', '$rootScope', '$http',function (sessionService, $rootScope, $http) {
            var deferrable = jasmine.createSpyObj('deferrable', ['reject', 'resolve']);
            deferrable.promise = {
                then: function (callback) {
                    callback({authenticated: true})
                }
            };

            $q.defer.and.returnValue(deferrable);
            var fakeHttpGetPromise = {
                then: function(success, failure) {
                    success({"status" : 204});
                }
            };
            spyOn($http, 'get').and.returnValue(fakeHttpGetPromise);

            sessionService.loginUser("userName", "password", "location", "123456");
            expect($bahmniCookieStore.put).toHaveBeenCalled();
            expect($bahmniCookieStore.put.calls.count()).toBe(2);
            expect($bahmniCookieStore.remove).toHaveBeenCalledWith(Bahmni.Common.Constants.locationCookieName);
        }]));

        it("should show login page if the user is locked out after too may invalid OTP attempts", inject(['sessionService', '$rootScope', '$http',function (sessionService, $rootScope, $http) {
            var deferrable = jasmine.createSpyObj('deferrable', ['reject', 'resolve']);
            deferrable.promise = {
                then: function (callback) {
                    callback({authenticated: true})
                }
            };

            $q.defer.and.returnValue(deferrable);

            var fakeHttpPromise = {
                error: function(callback) {
                    callback("Error")
                },
                success: function(callback){
                    callback();
                    return {
                        error: function(callback) {
                            callback("Error")
                        },
                        success: function(callback){
                            callback("Sucess")
                        }
                    };
                }
            };

            var fakeHttpGetPromise = {
                then: function(success, failure) {
                    failure({"status" : 429});
                }
            };
            spyOn($http, 'delete').and.returnValue(fakeHttpPromise);
            spyOn($http, 'get').and.returnValue(fakeHttpGetPromise);

            sessionService.loginUser("userName", "password", "location", "123456");
            expect(deferrable.reject).toHaveBeenCalledWith("LOGIN_LABEL_MAX_FAILED_ATTEMPTS");
        }]));

        it("should send the resend otp request", inject(['$http', 'sessionService', function ($http, sessionService) {
            spyOn($http, 'get');

            sessionService.resendOTP("userName", "password");

            expect($http.get).toHaveBeenCalledWith('/openmrs/ws/rest/v1/session?v=custom:(uuid)&resendOTP=true', {
                headers: {Authorization: 'Basic dXNlck5hbWU6cGFzc3dvcmQ='},
                cache: false
            })
        }]));
        it("should set bahmniCookie on destroySessionFromServer", inject(['sessionService', '$rootScope', '$window','$http', function (sessionService, $rootScope, $window, $http) {
            var deferrable = jasmine.createSpyObj('deferrable', ['reject', 'resolve']);
            
            deferrable.promise = {
                 function (callback) {
                    callback({authenticated: true})
                }
            };
            $q.defer.and.returnValue(deferrable);

            var _window = $window

            var fakeHttpPromise = {
                then: function(success, failure) {
                    success({"status" : 204});
                }
            };
            _window.location.hash = "#/ipd";
            $rootScope.cookieExpiryTime = 30;
            var currentDate = new Date();
            currentDate.setMinutes(currentDate.getMinutes() + $rootScope.cookieExpiryTime);
            $rootScope.currentProvider= {uuid:"123"}
            spyOn($http, 'delete').and.returnValue(fakeHttpPromise);
            sessionService.destroy();
            expect($bahmniCookieStore.put).toHaveBeenCalled();
            expect($bahmniCookieStore.put.calls.count()).toBe(1);
        }]));
    });

});

describe("logoutService", function () {
    var logoutService, $rootScope, $log, sessionService, auditLogService, formDraftService, ngDialog, $window, $timeout, $q;

    beforeEach(module('authentication'));
    beforeEach(module(function ($provide) {
        auditLogService = jasmine.createSpyObj('auditLogService', ['log']);
        formDraftService = jasmine.createSpyObj('formDraftService', ['hasDraftsForProvider']);
        ngDialog = jasmine.createSpyObj('ngDialog', ['open', 'close']);
        sessionService = jasmine.createSpyObj('sessionService', ['destroy']);

        $provide.value('auditLogService', auditLogService);
        $provide.value('formDraftService', formDraftService);
        $provide.value('ngDialog', ngDialog);
        $provide.value('sessionService', sessionService);
    }));

    beforeEach(inject(function (_logoutService_, _$rootScope_, _$log_, _$window_, _$timeout_, _$q_) {
        logoutService = _logoutService_;
        $rootScope = _$rootScope_;
        $log = _$log_;
        $window = _$window_;
        $timeout = _$timeout_;
        $q = _$q_;

        auditLogService.log.and.returnValue($q.when({}));
        sessionService.destroy.and.returnValue($q.when({}));
    }));

    describe("closePatientControlPanel", function () {

        it("should add ng-hide class to visit-history element", function () {
            var mockControlPanel = {
                classList: { add: jasmine.createSpy('add') }
            };
            spyOn(document, 'querySelector').and.returnValue(mockControlPanel);

            logoutService.attemptLogout($rootScope);

            expect(mockControlPanel.classList.add).toHaveBeenCalledWith('ng-hide');
        });

        it("should handle errors gracefully", function () {
            spyOn(document, 'querySelector').and.throwError('DOM Error');
            spyOn($log, 'debug');

            expect(function () {
                logoutService.attemptLogout($rootScope);
            }).not.toThrow();
        });

    });

});

describe("sessionService SSO session", function () {
    var sessionService, $httpBackend, $bahmniCookieStore;
    var sessionUrl = Bahmni.Common.Constants.RESTWS_V1 + '/session';

    beforeEach(module('authentication'));
    beforeEach(module(function ($provide) {
        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['get', 'put', 'remove']);
        $provide.value('$bahmniCookieStore', $bahmniCookieStore);
        $provide.value('userService', jasmine.createSpyObj('userService', ['getUser', 'getProviderForUser']));
    }));

    beforeEach(inject(function (_sessionService_, _$httpBackend_) {
        sessionService = _sessionService_;
        $httpBackend = _$httpBackend_;
        localStorage.removeItem(Bahmni.Common.Constants.ssoLoginFlag);
        localStorage.removeItem(Bahmni.Common.Constants.ssoLogoutUrlKey);
    }));

    afterEach(function () {
        localStorage.removeItem(Bahmni.Common.Constants.ssoLoginFlag);
        localStorage.removeItem(Bahmni.Common.Constants.ssoLogoutUrlKey);
    });

    var loadSession = function (responseData, logoutUrl) {
        var result = 'not resolved';
        $httpBackend.expectGET(sessionUrl).respond(responseData);
        sessionService.loadSsoSession(logoutUrl).then(function (session) {
            result = session;
        });
        $httpBackend.flush();
        return result;
    };

    it("should resolve null when the session is not authenticated", function () {
        expect(loadSession({authenticated: false})).toBeNull();
        expect($bahmniCookieStore.put).not.toHaveBeenCalled();
        expect(localStorage.getItem(Bahmni.Common.Constants.ssoLoginFlag)).toBeNull();
    });

    it("should resolve null when the authenticated session has no user", function () {
        expect(loadSession({authenticated: true})).toBeNull();
        expect($bahmniCookieStore.put).not.toHaveBeenCalled();
    });

    it("should store the user and location cookies and set the sso flag for a valid session", function () {
        var session = {
            authenticated: true,
            user: {username: 'superman'},
            sessionLocation: {display: 'OPD', uuid: 'location-uuid'}
        };

        var result = loadSession(session);

        expect(result.user.username).toBe('superman');
        expect($bahmniCookieStore.put).toHaveBeenCalledWith(Bahmni.Common.Constants.currentUser, 'superman', {path: '/', expires: 7});
        expect($bahmniCookieStore.remove).toHaveBeenCalledWith(Bahmni.Common.Constants.locationCookieName);
        expect($bahmniCookieStore.put).toHaveBeenCalledWith(Bahmni.Common.Constants.locationCookieName, {name: 'OPD', uuid: 'location-uuid'}, {path: '/', expires: 7});
        expect(localStorage.getItem(Bahmni.Common.Constants.ssoLoginFlag)).toBe('true');
    });

    it("should store the given logout url, or the default when none is given", function () {
        loadSession({authenticated: true, user: {username: 'superman'}}, '/custom/logout');
        expect(localStorage.getItem(Bahmni.Common.Constants.ssoLogoutUrlKey)).toBe('/custom/logout');

        loadSession({authenticated: true, user: {username: 'superman'}});
        expect(localStorage.getItem(Bahmni.Common.Constants.ssoLogoutUrlKey)).toBe(Bahmni.Common.Constants.ssoLogoutUrl);
    });

    it("should not touch the location cookie when the session has no location", function () {
        loadSession({authenticated: true, user: {username: 'superman'}});

        expect($bahmniCookieStore.remove).not.toHaveBeenCalled();
        expect($bahmniCookieStore.put.calls.count()).toBe(1);
        expect(localStorage.getItem(Bahmni.Common.Constants.ssoLoginFlag)).toBe('true');
    });
});

describe("logoutService SSO logout", function () {
    var logoutService, $rootScope, $q, sessionService, auditLogService, mockWindow;

    beforeEach(module('authentication'));
    beforeEach(module(function ($provide) {
        mockWindow = {location: '', document: window.document, navigator: window.navigator, history: window.history, localStorage: window.localStorage};
        auditLogService = jasmine.createSpyObj('auditLogService', ['log']);
        sessionService = jasmine.createSpyObj('sessionService', ['destroy']);

        $provide.value('$window', mockWindow);
        $provide.value('auditLogService', auditLogService);
        $provide.value('formDraftService', jasmine.createSpyObj('formDraftService', ['hasDraftsForProvider']));
        $provide.value('ngDialog', jasmine.createSpyObj('ngDialog', ['open', 'close']));
        $provide.value('sessionService', sessionService);
    }));

    beforeEach(inject(function (_logoutService_, _$rootScope_, _$q_) {
        logoutService = _logoutService_;
        $rootScope = _$rootScope_;
        $q = _$q_;
        auditLogService.log.and.returnValue($q.when({}));
        sessionService.destroy.and.returnValue($q.when({}));
        $rootScope.formDraftFeatureEnabled = false;
        localStorage.removeItem(Bahmni.Common.Constants.ssoLoginFlag);
        localStorage.removeItem(Bahmni.Common.Constants.ssoLogoutUrlKey);
    }));

    afterEach(function () {
        localStorage.removeItem(Bahmni.Common.Constants.ssoLoginFlag);
        localStorage.removeItem(Bahmni.Common.Constants.ssoLogoutUrlKey);
    });

    it("should use the stored logout url and clear it when the user logged in through SSO", function () {
        localStorage.setItem(Bahmni.Common.Constants.ssoLoginFlag, 'true');
        localStorage.setItem(Bahmni.Common.Constants.ssoLogoutUrlKey, '/custom/logout');

        logoutService.attemptLogout($rootScope);
        $rootScope.$digest();

        expect(mockWindow.location).toBe('/custom/logout');
        expect(localStorage.getItem(Bahmni.Common.Constants.ssoLogoutUrlKey)).toBeNull();
    });

    it("should end the Keycloak session and clear the flag when the user logged in through SSO", function () {
        localStorage.setItem(Bahmni.Common.Constants.ssoLoginFlag, 'true');

        logoutService.attemptLogout($rootScope);
        $rootScope.$digest();

        expect(sessionService.destroy).toHaveBeenCalled();
        expect(mockWindow.location).toBe(Bahmni.Common.Constants.ssoLogoutUrl);
        expect(localStorage.getItem(Bahmni.Common.Constants.ssoLoginFlag)).toBeNull();
    });

    it("should go to the login page when the user did not log in through SSO", function () {
        logoutService.attemptLogout($rootScope);
        $rootScope.$digest();

        expect(sessionService.destroy).toHaveBeenCalled();
        expect(mockWindow.location).toBe('../home/index.html#/login');
    });
});
