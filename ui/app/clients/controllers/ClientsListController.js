'use strict';

angular.module('bahmni.clients')
    .controller('ClientListController', ['$scope', 'ClientsService', function($scope, ClientsService) {
        ClientsService.getAllClients()
            .then(function(response){
                $scope.clients = response.data.results;
            });
    }]);