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

        var mockOfflineService = jasmine.createSpyObj('offlineService',['setPlatformCookie', 'getAppPlatform','isOfflineApp']);
        mockOfflineService.getAppPlatform.and.returnValue('chrome');
        mockOfflineService.isOfflineApp.and.returnValue(false);

        $provide.value('$bahmniCookieStore', $bahmniCookieStore);
        $provide.value('userService', userService);
        $provide.value('$q', $q);
        $provide.value('offlineService', mockOfflineService);
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
            var mockOfflineService = jasmine.createSpyObj('offlineService',['setPlatformCookie', 'getAppPlatform','isOfflineApp', 'getItem']);
            mockOfflineService.isOfflineApp.and.returnValue(true);
            var userInfoFromLocalStorage = undefined;
            mockOfflineService.getItem.and.returnValue(userInfoFromLocalStorage);

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
            spyOn($http, 'delete').and.returnValue(fakeHttpPromise);

            sessionService.loginUser("userName", "password", "location");
            expect($bahmniCookieStore.put).toHaveBeenCalled();
            expect($bahmniCookieStore.put.calls.count()).toBe(2);
            expect($bahmniCookieStore.remove).toHaveBeenCalledWith(Bahmni.Common.Constants.locationCookieName);
        }]));

    });

    describe("loginUserWithOTP", function () {
        it("should authenticate the user and show otp page", inject(['sessionService', '$rootScope', '$http',function (sessionService, $rootScope, $http) {
            var mockOfflineService = jasmine.createSpyObj('offlineService',['setPlatformCookie', 'getAppPlatform','isOfflineApp', 'getItem']);
            mockOfflineService.isOfflineApp.and.returnValue(true);
            var userInfoFromLocalStorage = undefined;
            mockOfflineService.getItem.and.returnValue(userInfoFromLocalStorage);

            var deferrable = jasmine.createSpyObj('deferrable', ['reject', 'resolve']);
            deferrable.promise = {
                then: function (callback) {
                    callback({firstFactAuthorization: true})
                }
            };

            $q.defer.and.returnValue(deferrable);

            var fakeHttpPromise = {
                error: function(callback) {
                    callback("Error")
                },
                success: function(callback){
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
            spyOn($http, 'delete').and.returnValue(fakeHttpPromise);

            sessionService.loginUser("userName", "password", "location");
            expect($bahmniCookieStore.put).not.toHaveBeenCalled();
            expect($bahmniCookieStore.put.calls.count()).toBe(0);
            expect($bahmniCookieStore.remove).not.toHaveBeenCalledWith(Bahmni.Common.Constants.locationCookieName);
        }]));


        it("should createSession and authenticate the user with OTP then save currentUser and cookie in the $bahmniCookieStore", inject(['sessionService', '$rootScope', '$http',function (sessionService, $rootScope, $http) {
            var mockOfflineService = jasmine.createSpyObj('offlineService',['setPlatformCookie', 'getAppPlatform','isOfflineApp', 'getItem']);
            mockOfflineService.isOfflineApp.and.returnValue(true);
            var userInfoFromLocalStorage = undefined;
            mockOfflineService.getItem.and.returnValue(userInfoFromLocalStorage);

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
            spyOn($http, 'delete').and.returnValue(fakeHttpPromise);

            sessionService.loginUser("userName", "password", "location", "123456");
            expect($bahmniCookieStore.put).toHaveBeenCalled();
            expect($bahmniCookieStore.put.calls.count()).toBe(2);
            expect($bahmniCookieStore.remove).toHaveBeenCalledWith(Bahmni.Common.Constants.locationCookieName);
        }]));

        it("should show login page if the user is locked out after too may invalid OTP attempts", inject(['sessionService', '$rootScope', '$http',function (sessionService, $rootScope, $http) {
            var mockOfflineService = jasmine.createSpyObj('offlineService',['setPlatformCookie', 'getAppPlatform','isOfflineApp', 'getItem']);
            mockOfflineService.isOfflineApp.and.returnValue(true);
            var userInfoFromLocalStorage = undefined;
            mockOfflineService.getItem.and.returnValue(userInfoFromLocalStorage);

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
    });



    describe("Should loadProviders ", function () {
            var mockOfflineService;

            beforeEach(module(function ($provide) {
                $q = jasmine.createSpyObj('$q', ['defer', 'when']);
                mockOfflineService = jasmine.createSpyObj('offlineService',['setPlatformCookie', 'getAppPlatform','isOfflineApp', 'getItem']);
                mockOfflineService.getAppPlatform.and.returnValue('chrome');
                mockOfflineService.isOfflineApp.and.returnValue(true);

                $provide.value('$q', $q);
                $provide.value('offlineService', mockOfflineService);
            }));
        it("and set the providers to currentProvider in rootScope", inject(['sessionService', '$rootScope', function (sessionService, $rootScope) {
            var provider = {results: [{uuid: "6a5d9c71-bb71-47ad-abed-bda86637f1b7", name: "93779 - Arman Vuiyan", links: []}]};

            mockOfflineService.isOfflineApp.and.returnValue(true);
            mockOfflineService.getItem.and.returnValue(provider);

            sessionService.loadProviders({uuid: "userInfoUuid"});
            expect($rootScope.currentProvider).toEqual({uuid: "6a5d9c71-bb71-47ad-abed-bda86637f1b7", name: "93779 - Arman Vuiyan", links: []});
        }]));
    });

});