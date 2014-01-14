'use strict'

angular.module('opd.consultation').factory('tilesLayout',
    ['$rootScope', '$route', '$location', function($rootScope, $route, $location) {
        var handleTiles = function() {
            var routes = Object.keys($route.routes).map(function (key) {
                return $route.routes[key];
            });
            var currentRoute = routes.filter(function(route) {
                return $location.path().match(route.regexp) != null;
            })[0];
            if(currentRoute && currentRoute.tiles) {
                $rootScope.tiles = currentRoute.tiles;
            } else {
                $rootScope.tiles = undefined;
            }
        }
        handleTiles();
        $rootScope.$on('$routeChangeStart', handleTiles);
    }]
);