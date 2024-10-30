angular.module('bahmni.clients')
    .config(['$stateProvider'], function($stateProvider){
        $stateProvider
            .state('clientsList', {
                url: '/clients',
                templateUrl: 'clients/views/clientList.html',
                controller: 'ClientListController'
            })
            .state('editClient', {
                url: '/clients/edit/:clientId',
                templateUrl: 'clients/views/editClient.html',
                controller: 'EditClientController'
            })
    })