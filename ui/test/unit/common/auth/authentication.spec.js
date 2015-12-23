'use strict';

describe("Authentication", function () {
    var sessionService, userService, $bahmniCookieStore, $q, scope;

    beforeEach(module('authentication'));
    beforeEach(module(function ($provide) {
        var currentUserCookie = {};
        $bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['get']);
        $q = jasmine.createSpyObj('$q', ['defer']);
        $bahmniCookieStore.get.and.callFake(function (cookieName) {
            if (cookieName == Bahmni.Common.Constants.currentUser) {
                return currentUserCookie;
            }
        });
        userService = jasmine.createSpyObj('userService', ['getUser', 'getProviderForUser']);

        var userResponse = {results: [{uuid: "36b6ea1f-3f5a-11e5-b380-0050568236ae"}]};
        var providers = {};

        var getUserPromise = specUtil.createServicePromise('getUser');
        getUserPromise.success = function (successFn) {
            successFn(userResponse);
            return getUserPromise;
        };

        var getProviderForUserPromise = specUtil.createServicePromise('getProviderForUser');
        getProviderForUserPromise.success = function (successFn) {
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

            expect(deferrable.reject).toHaveBeenCalledWith('You have not been setup as a Provider, please contact administrator.');
        }]));

    });

});