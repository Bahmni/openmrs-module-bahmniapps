'use strict';

angular.module('opd.consultation.controllers')
    .controller('VisitController', ['$scope', '$rootScope', 'encounterService', '$route', '$location', function ($scope, $rootScope, encounterService, $route, $location) {

    var visitUuid = $route.current.params["visitUuid"];    

     encounterService.search(visitUuid,new Date().toISOString().substring(0,10)).success(function(response){
     	$scope.encounterTransactions = response;
    });
        
}])
