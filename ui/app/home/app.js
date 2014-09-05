'use strict';


angular.module('bahmni.home', ['ui.router', 'httpErrorInterceptor', 'bahmni.common.domain', 'bahmni.common.uiHelper', 'bahmni.common.util', 'bahmni.common.appFramework', 'ngCookies'])
.provider('$cookieStore', [function(){
    var self = this;
    self.defaultOptions = {};

    self.setDefaultOptions = function(options){
        self.defaultOptions = options;
    };

    self.$get = function(){
        return {
            get: function(name){
                var jsonCookie = $.cookie(name);
                if(jsonCookie){
                    return angular.fromJson(jsonCookie);
                }
            },
            put: function(name, value, options){
                options = $.extend({}, self.defaultOptions, options);
                $.cookie(name, angular.toJson(value), options);
            },
            remove: function(name, options){
                options = $.extend({}, self.defaultOptions, options);
                $.removeCookie(name, options);
            }
        };
    };
}]).config(['$urlRouterProvider', '$stateProvider','$httpProvider', function ($urlRouterProvider, $stateProvider, $httpProvider) {
    $urlRouterProvider.otherwise('/dashboard');
    $stateProvider
    .state('dashboard',
    {   url: '/dashboard',
        templateUrl: '../common/ui-helper/views/dashboard.html',
        controller: 'DashboardController',
        data: {extensionPointId: 'org.bahmni.home.dashboard'},
        resolve: {
            initialize: function(dashboardInitialization) {
                return dashboardInitialization();
            }
        }
    }).state('login',
    {   url: '/login',
        templateUrl: 'views/login.html',
        controller: 'LoginController',
        resolve: {
            initialData: 'loginInitialization'
        }
    });
    $httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = true;
}]).run(function ($rootScope, $templateCache) {
        //Disable caching view template partials
        $rootScope.$on('$viewContentLoaded', function () {
            $templateCache.removeAll();
        }
        )
    });
