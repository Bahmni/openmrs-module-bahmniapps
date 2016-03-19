'use strict';

angular.module('bahmni.yay', ['ui.router',  'bahmni.common.uiHelper', 'bahmni.common.util', 'bahmni.common.offline'])
    .config(['$urlRouterProvider', '$stateProvider',
        function ($urlRouterProvider, $stateProvider) {
        $urlRouterProvider.otherwise('/initScheduler');
        // @endif
        $stateProvider
            .state('initScheduler',
                {
                    url: '/initScheduler',
                    templateUrl: 'redirect.html',
                    resolve: {
                        offlineDb: function (offlineDbInitialization) {
                            return offlineDbInitialization();
                        },
                        offlineReferenceDataInitialization: function(offlineReferenceDataInitialization, offlineDb){
                            return offlineReferenceDataInitialization(offlineDb, false);
                        }
                    }
                })

    }]).run(function ($rootScope, $templateCache) {
    //Disable caching view template partials
    $rootScope.$on('$viewContentLoaded', function () {
        $templateCache.removeAll();
    });
});
