'use strict';

angular.module('bahmni.home')
    .factory('postLoginService', ['$rootScope', '$bahmniCookieStore',
        function ($rootScope, $bahmniCookieStore) {
            var LOGIN_LOCATIONS = "Login Locations";

            // Restricts the location picker to the provider's "Login Locations" attribute, and clears any
            // list left behind by a previous user when the provider has none.
            var saveAssignedLoginLocations = function (currentUser) {
                var attributes = (currentUser && currentUser.provider && currentUser.provider.attributes) || [];
                var userAssignedLocations = attributes
                    .filter(function (attribute) {
                        return attribute.attributeType.display === LOGIN_LOCATIONS;
                    })
                    .map(function (attribute) {
                        return {display: attribute.value.name, uuid: attribute.value.uuid};
                    });

                if (userAssignedLocations.length > 0) {
                    localStorage.setItem("loginLocations", JSON.stringify(userAssignedLocations));
                } else {
                    localStorage.removeItem("loginLocations");
                }
            };

            var onLoggedIn = function () {
                $bahmniCookieStore.remove(Bahmni.Common.Constants.retrospectiveEntryEncounterDateCookieName, {
                    path: '/',
                    expires: 1
                });
                $rootScope.$broadcast('event:auth-loggedin');
            };

            return {
                saveAssignedLoginLocations: saveAssignedLoginLocations,
                onLoggedIn: onLoggedIn
            };
        }
    ]);
