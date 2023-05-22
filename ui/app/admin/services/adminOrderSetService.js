'use strict';

angular.module('bahmni.admin').service('adminOrderSetService', ['$http', '$q', function ($http, $q) {
    this.getAllOrderSets = function () {
        return $http.get(Bahmni.Common.Constants.orderSetUrl, {
            params: {v: "full"}
        });
    };

    this.getOrderSet = function (uuid) {
        return $http.get(Bahmni.Common.Constants.orderSetUrl + "/" + uuid, {
            params: {v: "full"}
        });
    };

    this.createOrUpdateOrderSet = function (orderSet) {
        var url;
        _.each(orderSet.orderSetMembers, function (orderSetMember) {
            if (orderSetMember.orderTemplate) {
                orderSetMember.orderTemplate = JSON.stringify(orderSetMember.orderTemplate);
            }
        });
        if (orderSet.uuid) {
            url = Bahmni.Common.Constants.orderSetUrl + "/" + orderSet.uuid;
        } else {
            url = Bahmni.Common.Constants.orderSetUrl;
        }
        return $http.post(url, orderSet, {
            withCredentials: true,
            headers: {"Accept": "application/json", "Content-Type": "application/json"}
        });
    };

    this.removeOrderSet = function (orderSet) {
        var req = {
            url: Bahmni.Common.Constants.orderSetUrl + "/" + orderSet.uuid,
            content: {
                "!purge": "",
                "reason": "User deleted the orderSet."
            },
            headers: {"Content-Type": "application/json"}
        };
        return $http.delete(req.url, req.content, req.headers);
    };

    this.getDrugConfig = function () {
        return $http.get(Bahmni.Common.Constants.drugOrderConfigurationUrl, {
            withCredentials: true
        }).then(function (result) {
            var config = result.data;

            return config;
        });
    };
}]);
