'use strict';

angular.module('bahmni.offline', ['ui.router',  'bahmni.common.uiHelper', 'bahmni.common.util', 'bahmni.common.offline'])
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
                        offlineReferenceDataInitialization: function(offlineReferenceDataInitialization, offlineDb, offlineDbService, referenceDataDbService, offlineService, androidDbService, $state){
                            if (offlineService.isAndroidApp()){
                                offlineDbService = androidDbService;
                            }
                            offlineDbService.init(offlineDb);
                            referenceDataDbService.init(offlineDb);
                            return offlineDbService.getReferenceData("LoginLocations").then(function(result){
                                if(result){
                                    $state.go('login');
                                }
                                return offlineReferenceDataInitialization(offlineDb, false).then(function(){
                                    $state.go('login');
                                });
                            });
                        }
                    }
                }).state('device',
            {
                url: "/device/:deviceType",
                controller: function ($stateParams, $rootScope, $state, offlineService) {
                    if ($stateParams.deviceType === 'chrome-app' || $stateParams.deviceType === 'android') {
                        offlineService.setAppPlatform($stateParams.deviceType);
                    }
                    $state.go('initScheduler');
                }
            }).state('login',
            {
                controller: function () {
                    window.location.href = "../home/index.html#/login";
                }
            });

    }]).run(function ($rootScope, $templateCache) {
    //Disable caching view template partials
    $rootScope.$on('$viewContentLoaded', function () {
        $templateCache.removeAll();
    });
});
