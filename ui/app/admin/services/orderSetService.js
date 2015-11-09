'use strict';

angular.module('bahmni.admin')
    .service('orderSetService', ['$http',function ($http) {
        this.getAllOrderSets = function() {
            return $http.get(Bahmni.Common.Constants.orderSetUrl, {
                params: {v:"custom:(uuid,name)"}
            });
        };

        this.getOrderSet = function(uuid) {
            return $http.get(Bahmni.Common.Constants.orderSetUrl + "/" + uuid, {
                params: {v:"full"}
            });
        };

        this.getOrderSetMemberAttributeType = function(name) {
            return $http.get(Bahmni.Common.Constants.orderSetMemberAttributeTypeUrl, {
                params: {name : name}
            });
        };


        this.saveOrderSet = function(orderSet){
            var url = Bahmni.Common.Constants.orderSetUrl;
            return $http.post(url, orderSet, {
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        };

    }]);
