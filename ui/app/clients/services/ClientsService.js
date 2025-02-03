angular.module('bahmni.clients')
    .factory('ClientsService', ['$http', function ($http) {
        var getAllClients = function () {
            return $http.get('/openmrs/ws/rest/v1/patient');
        };

        var getClientById = function (clientId) {
            return $http.get('/openmrs/ws/re/v1/patient' + clientId);
        };

        var updateClient = function (client) {
            return $http.post('/openmrs/ws/rest/v1/patient' + client.uuid, client);
        };

        return {
            getAllClients: getAllClients,
            getClientById: getClientById,
            updateClient: updateClient
        };
    }]);

