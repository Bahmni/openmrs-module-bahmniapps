'use strict';

describe("userService ", function () {
    var userService, mockOfflineService, _$http, $q, rootScope;

    beforeEach(module('authentication'));
    beforeEach(module(function ($provide) {
        $q = jasmine.createSpyObj('$q', ['defer']);

        mockOfflineService = jasmine.createSpyObj('offlineService', ['getItem', 'setItem', 'isOfflineApp']);
        mockOfflineService.isOfflineApp.and.returnValue(true);

        _$http = jasmine.createSpyObj('$http', ['get', 'post']);
        
        $provide.value('$http', _$http);
        $provide.value('$q', $q);
        $provide.value('offlineService', mockOfflineService);
    }));

    beforeEach(inject(['userService', '$rootScope', function (userServiceInjected, $rootScopeInjected) {
        userService = userServiceInjected;
        rootScope = $rootScopeInjected;
    }]));

    describe("getUser ", function () {
        it("should get the userData from the localStorage for offlineApp", function () {
            var deferrable = jasmine.createSpyObj('deferrable', ['reject', 'resolve']);
            $q.defer.and.returnValue(deferrable);
            var userDataFromLocalStorage = {results: [{username: 'armanvuiyan', uuid: 'userUuid'}]};
            mockOfflineService.getItem.and.returnValue(userDataFromLocalStorage);

            userService.getUser("armanvuiyan");

            expect(deferrable.resolve).toHaveBeenCalledWith(userDataFromLocalStorage);
            expect(mockOfflineService.getItem).toHaveBeenCalledWith('userData');
            expect(mockOfflineService.getItem.calls.count()).toBe(1);
        });

        it("should get the userData from the server, if it's not cached in the localStorage for offlineApp", function () {
            var deferrable = jasmine.createSpyObj('deferrable', ['reject', 'resolve']);
            $q.defer.and.returnValue(deferrable);

            mockOfflineService.getItem.and.returnValue(undefined);
            var userDataFromServer = {results: [{username: 'armanvuiyan', uuid: 'userUuid'}]};
            var getUserFromServerFakeHttpPromise = {
                success: function(callback){
                    callback(userDataFromServer);
                    return {
                        error: function(callback) {
                            callback("Error")
                        }
                    };
                }
            };
            _$http.get.and.returnValue(getUserFromServerFakeHttpPromise);

            userService.getUser("armanvuiyan");

            expect(deferrable.resolve).toHaveBeenCalledWith(userDataFromServer);
            expect(mockOfflineService.getItem).toHaveBeenCalledWith('userData');
            expect(mockOfflineService.getItem.calls.count()).toBe(1);
            expect(mockOfflineService.setItem).toHaveBeenCalledWith('userData', userDataFromServer);
            expect(mockOfflineService.setItem).toHaveBeenCalledWith('providerData', null);
            expect(mockOfflineService.setItem.calls.count()).toBe(2);
        });

        it("should get the userData from the server, if the userData in the localStorage is of different User and device is online for offlineApp", function () {
            var deferrable = jasmine.createSpyObj('deferrable', ['reject', 'resolve']);
            $q.defer.and.returnValue(deferrable);
            var userDataFromLocalStorage = {results: [{username: 'superman', uuid: 'userUuid'}]};
            mockOfflineService.getItem.and.returnValue(userDataFromLocalStorage);
            var userDataFromServer = {results: [{username: 'armanvuiyan', uuid: 'userUuid'}]};
            var getUserFromServerFakeHttpPromise = {
                success: function(callback){
                    callback(userDataFromServer);
                    return {
                        error: function(callback) {
                            callback("Error")
                        }
                    };
                }
            };
            _$http.get.and.returnValue(getUserFromServerFakeHttpPromise);

            userService.getUser("armanvuiyan");

            expect(deferrable.resolve).toHaveBeenCalledWith(userDataFromServer);
            expect(mockOfflineService.getItem).toHaveBeenCalledWith('userData');
            expect(mockOfflineService.getItem.calls.count()).toBe(1);
            expect(mockOfflineService.setItem).toHaveBeenCalledWith('userData', userDataFromServer);
            expect(mockOfflineService.setItem).toHaveBeenCalledWith('providerData', null);
            expect(mockOfflineService.setItem.calls.count()).toBe(2);
        });
    });

    describe("getProviderForUser ", function () {
        it("should get the getProviderForUser from the localStorage for offlineApp", function () {
            var deferrable = jasmine.createSpyObj('deferrable', ['reject', 'resolve']);
            $q.defer.and.returnValue(deferrable);
            var providerData = {"results":[{"uuid":"6a5d9c71-bb71-47ad-abed-bda86637f1b7","display":"93779 - Arman Vuiyan", "name":"Arman Vuiyan"}]};
            mockOfflineService.getItem.and.returnValue(providerData);

            var userUuid = "d21d7385-7427-4cdc-95ee-e877154ad6fe";
            userService.getProviderForUser(userUuid);

            expect(deferrable.resolve).toHaveBeenCalledWith(providerData);
            expect(mockOfflineService.getItem).toHaveBeenCalledWith('providerData');
            expect(mockOfflineService.getItem.calls.count()).toBe(1);
        });

        it("should get the getProviderForUser from the server, if it's not cached in the localStorage for offlineApp", function () {
            var deferrable = jasmine.createSpyObj('deferrable', ['reject', 'resolve']);
            $q.defer.and.returnValue(deferrable);
            mockOfflineService.getItem.and.returnValue(undefined);
            var providerDataFromServer = {"results":[{"uuid":"6a5d9c71-bb71-47ad-abed-bda86637f1b7","display":"93779 - Arman Vuiyan"}]};
            var getUserFromServerFakeHttpPromise = {
                success: function(callback){
                    callback(providerDataFromServer);
                    return {
                        error: function(callback) {
                            callback("Error")
                        }
                    };
                }
            };
            _$http.get.and.returnValue(getUserFromServerFakeHttpPromise);

            var userUuid = "d21d7385-7427-4cdc-95ee-e877154ad6fe";
            userService.getProviderForUser(userUuid);

            var providerDataNameFieldAdded = {"results":[{"uuid":"6a5d9c71-bb71-47ad-abed-bda86637f1b7","display":"93779 - Arman Vuiyan", "name":"Arman Vuiyan"}]};
            expect(deferrable.resolve).toHaveBeenCalledWith(providerDataNameFieldAdded);
            expect(mockOfflineService.getItem).toHaveBeenCalledWith('providerData');
            expect(mockOfflineService.getItem.calls.count()).toBe(1);
            expect(mockOfflineService.setItem).toHaveBeenCalledWith('providerData', providerDataNameFieldAdded);
            expect(mockOfflineService.setItem.calls.count()).toBe(1);
        });
    });

    describe("savePreferences ", function () {
        it("should get the userProperties from the localStorage for offlineApp", function () {
            rootScope.currentUser = new Bahmni.Auth.User({});
            var deferrable = jasmine.createSpyObj('deferrable', ['reject', 'resolve']);
            $q.defer.and.returnValue(deferrable);
            var userProperties = {defaultLocale:"en", favouriteWards:"", recentlyViewedPatients: [{uuid:"c2217a6b-1162-465c-fd94-8998f513a604",name:"Android Sync",identifier:"BDH201903"}], favouriteObsTemplates:"ANC visit information", loginAttempts:"0"};
            mockOfflineService.getItem.and.returnValue(userProperties);

            userService.savePreferences();

            expect(deferrable.resolve).toHaveBeenCalled();
            expect(mockOfflineService.getItem).toHaveBeenCalledWith('userProperties');
            expect(mockOfflineService.getItem.calls.count()).toBe(1);
            expect(rootScope.currentUser.userProperties).toBe(userProperties);
        });

        it("should get the userProperties from the server, if it's not cached in the localStorage for offlineApp", function () {
            rootScope.currentUser = new Bahmni.Auth.User({});
            rootScope.some = "something";
            var deferrable = jasmine.createSpyObj('deferrable', ['reject', 'resolve']);
            $q.defer.and.returnValue(deferrable);
            mockOfflineService.getItem.and.returnValue(undefined);
            var userProperties = {defaultLocale:"en", favouriteWards:"", recentlyViewedPatients: [{uuid:"c2217a6b-1162-465c-fd94-8998f513a604",name:"Android Sync",identifier:"BDH201903"}], favouriteObsTemplates:"ANC visit information", loginAttempts:"0"};
            var userPropertiesFromTheServer = {data: {userProperties: userProperties}};
            _$http.post.and.returnValue(specUtil.simplePromise(userPropertiesFromTheServer));

            userService.savePreferences();

            expect(deferrable.resolve).toHaveBeenCalled();
            expect(mockOfflineService.getItem).toHaveBeenCalledWith('userProperties');
            expect(mockOfflineService.getItem.calls.count()).toBe(1);
            expect(mockOfflineService.setItem).toHaveBeenCalledWith('userProperties', userProperties);
            expect(mockOfflineService.setItem.calls.count()).toBe(1);
            expect(rootScope.currentUser.userProperties).toBe(userProperties);
        });
    });

});