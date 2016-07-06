'use strict';

angular.module('bahmni.offline', ['ui.router',  'bahmni.common.uiHelper', 'bahmni.common.util', 'bahmni.common.logging' ,'bahmni.common.offline', 'bahmni.common.models', 'ngDialog', 'authentication'])
    .config(['$urlRouterProvider', '$stateProvider',
        function ($urlRouterProvider, $stateProvider) {
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
                        offlineReferenceDataInitialization: function(offlineReferenceDataInitialization, offlineDb, offlineDbService, offlineService, androidDbService, $state){
                            if (offlineService.isAndroidApp()){
                                offlineDbService = androidDbService;
                            }
                            return offlineDbService.getReferenceData("LoginLocations").then(function(result){
                                if(result){
                                    $state.go('login');
                                }
                                return offlineReferenceDataInitialization(false).then(function(response){
                                    if(response.data) {
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
                        test : function(offlineDb, offlineService, offlineDbService, androidDbService, $state){
                           if(offlineService.isAndroidApp()){
                                offlineDbService = androidDbService;
                            }
                            return offlineDbService.getConfig("home").then(function (result) {
                                if (result && offlineService.getItem('catchmentNumber')) {
                                    $state.go('initSync');
                                }
                            });
                        },
                        offlineReferenceDataInitialization: function(offlineReferenceDataInitialization, offlineDb, test){
                            return offlineReferenceDataInitialization(true, offlineDb, test);
                        },
                        offlineLocationInitialization: function(offlineLocationInitialization, offlineReferenceDataInitialization){
                            return offlineLocationInitialization(offlineReferenceDataInitialization);
                        },
                        offlineConfigInitialization: function(offlineConfigInitialization, offlineLocationInitialization){
                            return offlineConfigInitialization(offlineLocationInitialization);
                        },
                        state: function($state, offlineConfigInitialization){
                            $state.go('initSync');
                        }
                    }
                }).state('initSync', {
                    controller: 'InitSyncController',
                    url: '/initSync'


            }).state('device',
            {
                url: "/device/:deviceType",
                controller: function ($stateParams, $rootScope, $state, offlineService) {
                    if ($stateParams.deviceType === 'chrome-app' || $stateParams.deviceType === 'android') {
                        offlineService.setAppPlatform($stateParams.deviceType);
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

    }]).run(function ($rootScope, $templateCache) {
    //Disable caching view template partials
    $rootScope.$on('$viewContentLoaded', function () {
        $templateCache.removeAll();
    });
});
