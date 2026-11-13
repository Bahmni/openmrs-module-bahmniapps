'use strict';

angular.module('bahmni.home')
    .factory('postLoginService', ['$rootScope', '$bahmniCookieStore', '$state', 'loginInitialization', 'auditLogService',
        function ($rootScope, $bahmniCookieStore, $state, loginInitialization, auditLogService) {
            var LOGIN_LOCATIONS = "Login Locations";
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

            var completeLogin = function (session) {
                saveAssignedLoginLocations($rootScope.currentUser);
                onLoggedIn();
                auditLogService.log(undefined, 'USER_LOGIN_SUCCESS', undefined, 'MODULE_LABEL_LOGIN_KEY');
                if (!session.sessionLocation) {
                    $state.go('loginLocation');
                    return;
                }
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
