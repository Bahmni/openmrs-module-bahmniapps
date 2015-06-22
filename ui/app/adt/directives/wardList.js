'use strict';

angular.module('bahmni.adt')
    .directive('wardList',['QueryService','spinner','$q','$window','$stateParams','appService', function (queryService, spinner, $q, $window, $stateParams, appService) {
        return {
            restrict: 'E',
            controller: 'WardListController',
            scope: {
               ward:"="
            },
            templateUrl: "../adt/views/wardList.html"
        };
    }]);
