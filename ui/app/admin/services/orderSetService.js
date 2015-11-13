'use strict';

angular.module('bahmni.common.domain')
    .service('orderSetService', ['$http',function ($http) {
        this.getAllOrderSets = function() {
            return $http.get(Bahmni.Common.Constants.orderSetUrl, {
                params: {v:"custom:(name,uuid)"}
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

        this.getOrderSetWithAttributeNameAndValue = function(conceptUuid, attributeName, attributeValue) {
            var url = Bahmni.Common.Constants.orderSetUrl;
            return $http.get(url, {
                params:{drugConceptUuid: conceptUuid, attributeType: attributeName,attributeValue: attributeValue, v:"custom:(name,uuid,orderSetMembers)"},
                withCredentials: true,
                headers: {"Accept": "application/json", "Content-Type": "application/json"}
            });
        }

    }]);
