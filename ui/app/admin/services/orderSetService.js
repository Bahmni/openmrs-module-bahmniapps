'use strict';

angular.module('bahmni.admin')
    .service('orderSetService', ['$http',function ($http) {
        this.getAllOrderSets = function() {
            return $http.get(Bahmni.Common.Constants.orderSet, {
                params: {v:"custom:(uuid,name)"}
            });
        };

        this.getOrderSet = function(uuid) {
            return $http.get(Bahmni.Common.Constants.getOrderSet + uuid, {
                params: {v:"full"}
            });
        };

        this.saveOrderSet = function(orderSet){
            var url = Bahmni.Common.Constants.orderSet;
            return $http.post(url, orderSet, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

    }]);