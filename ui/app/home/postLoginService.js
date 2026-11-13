'use strict';

angular.module('bahmni.home')
    .factory('postLoginService', ['$rootScope', '$bahmniCookieStore', '$state', 'loginInitialization', 'auditLogService',
        function ($rootScope, $bahmniCookieStore, $state, loginInitialization, auditLogService) {
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

            // What the password flow does after authentication, for logins completed outside the login form (SSO).
            var completeLogin = function (session) {
                saveAssignedLoginLocations($rootScope.currentUser);
                onLoggedIn();
                auditLogService.log(undefined, 'USER_LOGIN_SUCCESS', undefined, 'MODULE_LABEL_LOGIN_KEY');
                if (!session.sessionLocation) {
                    $state.go('loginLocation');
                    return;
                }
                // The loginLocation state runs loginInitialization itself; going straight to the
                // dashboard would otherwise skip writing homeUrl / enableCommandPalette.
                return loginInitialization.loadHomeConfig().then(function () {
                    $state.go('dashboard');
                });
            };

            return {
                saveAssignedLoginLocations: saveAssignedLoginLocations,
                onLoggedIn: onLoggedIn,
                completeLogin: completeLogin
            };
        }
    ]);
