'use strict';

angular.module('bahmni.common.routeErrorHandler', ['ui.router'])
    .run(function ($rootScope) {
        $rootScope.$on('$stateChangeError', function (event) {
            event.preventDefault();
        });
    });
