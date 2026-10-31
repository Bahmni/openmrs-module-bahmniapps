'use strict';

describe("userService", function () {
    var userService, $httpBackend, $rootScope;
    var userUrl = Bahmni.Common.Constants.userUrl + "/user-uuid";
    var savedPropertiesUrl = userUrl + "?v=custom:(uuid,userProperties)";

    beforeEach(module('authentication'));

    beforeEach(inject(function (_userService_, _$httpBackend_, _$rootScope_) {
        userService = _userService_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $rootScope.currentUser = new Bahmni.Auth.User({
            uuid: "user-uuid",
            userProperties: {defaultLocale: "en"}
        });
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe("savePreferences", function () {
        it("should keep properties saved by other pages and overwrite the ones this page has", function () {
            $httpBackend.expectGET(savedPropertiesUrl).respond({
                uuid: "user-uuid",
                userProperties: {defaultLocale: "fr", labResultNotifications: '{"cutoff":""}'}
            });
            $httpBackend.expectPOST(userUrl, function (body) {
                var userProperties = JSON.parse(body).userProperties;
                return userProperties.defaultLocale === "en" &&
                    userProperties.labResultNotifications === '{"cutoff":""}' &&
                    userProperties.recentlyViewedPatients === "[]";
            }).respond({userProperties: {defaultLocale: "en"}});

            userService.savePreferences();
            $httpBackend.flush();

            expect($rootScope.currentUser.userProperties).toEqual({defaultLocale: "en"});
        });

        it("should save this page's properties when the saved ones cannot be read", function () {
            $httpBackend.expectGET(savedPropertiesUrl).respond(500);
            $httpBackend.expectPOST(userUrl, function (body) {
                return JSON.parse(body).userProperties.defaultLocale === "en";
            }).respond({userProperties: {defaultLocale: "en"}});

            userService.savePreferences();
            $httpBackend.flush();
        });
    });
});
