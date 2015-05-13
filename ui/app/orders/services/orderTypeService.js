'use strict';

angular.module('bahmni.orders')
    .service('orderTypeService', ['$http', function ($http) {

    var self = this;
    self.orderTypes = [];
    self.loadAll = function () {
        return $http.get("/openmrs/ws/rest/v1/ordertype").then(function(response) {
            self.orderTypes = response.data.results;
        });
    }

    self.getOrderTypeUuid = function(orderTypeName) {
        return _.result(_.find(self.orderTypes, {display: orderTypeName}), 'uuid');
    }
}]);
