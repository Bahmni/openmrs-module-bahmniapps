'use strict';

angular.module('bahmni.clinical').controller('ClinicalController',
    ['$scope', 'retrospectiveEntryService', '$rootScope', 'appService',
        function ($scope, retrospectiveEntryService, $rootScope, appService) {
            $scope.retrospectiveClass = function () {
                return !_.isEmpty(retrospectiveEntryService.getRetrospectiveEntry());
            };

            $rootScope.toggleControlPanel = function () {
                $rootScope.showControlPanel = !$rootScope.showControlPanel;
            };

            $rootScope.collapseControlPanel = function () {
                $rootScope.showControlPanel = false;
            };

            $rootScope.getLocaleCSS = function () {
                var localeCSS = "offline-language-english";
                var networkConnectivity;
                if (appService.getAppDescriptor()) {
                    networkConnectivity = appService.getAppDescriptor().getConfigValue("networkConnectivity");
                }
                var locales = networkConnectivity != undefined ? networkConnectivity.locales : null;
                var currentUser = $rootScope.currentUser;
                if (currentUser && currentUser.userProperties && locales) {
                    _.each(locales, function (localeObj) {
                        if (localeObj.locale == currentUser.userProperties.defaultLocale) {
                            localeCSS = localeObj.css;
                        }
                    });
                }
                return localeCSS;
            };
        }]);
