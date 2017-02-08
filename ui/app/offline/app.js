'use strict';

angular.module('bahmni.offline', ['ui.router', 'httpErrorInterceptor', 'bahmni.common.uiHelper', 'bahmni.common.util', 'bahmni.common.i18n', 'bahmni.common.logging', 'bahmni.common.offline', 'bahmni.common.models', 'bahmni.common.appFramework', 'ngCookies'])
    .config(['$urlRouterProvider', '$stateProvider', '$bahmniTranslateProvider',
        function ($urlRouterProvider, $stateProvider, $bahmniTranslateProvider) {
            $urlRouterProvider.otherwise('/initScheduler');
        // @endif
            $stateProvider
            .state('initScheduler',
                {
                    url: '/initScheduler',
                    resolve: {
                        offlineDb: function (offlineDbInitialization) {
                            return offlineDbInitialization();
                        },
                        offlineConfigInitialization: function (offlineConfigInitialization, offlineDb, offlineService, offlineDbService, androidDbService, $q) {
                            var checkConfig = function () {
                                var allowMultipleLoginLocation = offlineService.getItem("allowMultipleLoginLocation");
                                return allowMultipleLoginLocation !== null && !allowMultipleLoginLocation;
                            };
                            if (offlineService.isAndroidApp()) {
                                offlineDbService = androidDbService;
                            }
                            return offlineDbService.getConfig("dbNameCondition").then(function (result) {
                                if (result || checkConfig()) {
                                    return $q.when();
                                }
                                else return offlineConfigInitialization();
                            });
                        },
                        offlineReferenceDataInitialization: function (offlineReferenceDataInitialization, offlineDbService, offlineService, androidDbService, $state, offlineConfigInitialization) {
                            if (offlineService.isAndroidApp()) {
                                offlineDbService = androidDbService;
                            }
                            return offlineDbService.getReferenceData("LoginLocations").then(function (result) {
                                if (result) {
                                    $state.go('login');
                                }
                                return offlineReferenceDataInitialization(false).then(function (response) {
                                    if (response.data) {
                                        offlineService.setItem("networkError", response.data);
                                    }
                                    $state.go('login');
                                });
                            });
                        }
                    }
                }).state('scheduler',
                {
                    url: '/scheduler',
                    resolve: {
                        offlineDb: function (offlineDbInitialization) {
                            return offlineDbInitialization();
                        },
                        testConfig: function (offlineDb, offlineService, offlineDbService, androidDbService, $state) {
                            if (offlineService.isAndroidApp()) {
                                offlineDbService = androidDbService;
                            }
                            return offlineDbService.getConfig("home").then(function (result) {
                                if (result && offlineService.getItem('eventLogCategories')) {
                                    $state.go('initSync');
                                }
                            });
                        },
                        offlineReferenceDataInitialization: function (offlineReferenceDataInitialization, offlineDb, testConfig) {
                            return offlineReferenceDataInitialization(true, offlineDb, testConfig);
                        },
                        offlineLocationInitialization: function (offlineLocationInitialization, offlineReferenceDataInitialization) {
                            return offlineLocationInitialization(offlineReferenceDataInitialization);
                        },
                        offlineConfigInitialization: function (offlineConfigInitialization, offlineLocationInitialization) {
                            return offlineConfigInitialization(offlineLocationInitialization);
                        },
                        state: function ($state, offlineConfigInitialization) {
                            $state.go('initSync');
                        }
                    }
                }).state('initSync', {
                    templateUrl: 'views/initSync.html',
                    controller: 'InitSyncController',
                    url: '/initSync',
                    resolve: {
                        offlineDb: function (offlineDbInitialization) {
                            return offlineDbInitialization();
                        }
                    }
                }).state('device',
                {
                    url: "/device/:deviceType",
                    controller: function ($stateParams, $rootScope, $state, offlineService, $http) {
                        if ($stateParams.deviceType === 'chrome-app' || $stateParams.deviceType === 'android') {
                            offlineService.setAppPlatform($stateParams.deviceType);
                            var syncStatus = offlineService.getItem("initialSyncStatus");
                            if (!(syncStatus instanceof Object)) {
                                var url = Bahmni.Common.Constants.globalPropertyUrl + "?property=allowMultipleLoginLocation";
                                $http.get(url).then(function (res) {
                                    offlineService.setItem("allowMultipleLoginLocation", res.data);
                                });
                            }
                            $state.go('initScheduler');
                        }
                    }
                }).state('login',
                {
                    controller: function () {
                        window.location.href = "../home/index.html#/login";
                    }
                }).state('dashboard',
                {
                    controller: function () {
                        window.location.href = "../home/index.html#/dashboard";
                    }
                });
            $bahmniTranslateProvider.init({app: 'offline', shouldMerge: true});
        }]).run(['$rootScope', '$templateCache', function ($rootScope, $templateCache) {
    // Disable caching view template partials
            $rootScope.$on('$viewContentLoaded', function () {
                $templateCache.removeAll();
            });
        }]);
