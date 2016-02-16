'use strict';

angular.module('bahmni.common.orders')
    .service('orderTypeService', ['$http', function ($http) {

    var self = this;
    self.orderTypes = [];
    self.loadAll = function () {
        return $http.get(Bahmni.Common.Constants.orderTypeUrl).then(function(response) {
            self.orderTypes = response.data.results;
        });
    };

    self.getOrderTypeUuid = function(orderTypeName) {
        return _.result(_.find(self.orderTypes, {display: orderTypeName}), 'uuid');
    }
}]);
