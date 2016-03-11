'use strict';

angular.module('bahmni.common.orders')
    .service('orderTypeService', ['$http','offlineService', 'offlineDbService', 'androidDbService',
     function ($http, offlineService, offlineDbService, androidDbService) {

    var self = this;
    self.orderTypes = [];
    self.loadAll = function () {
     if(offlineService.isOfflineApp()) {
                    if(offlineService.isAndroidApp()) {
                        offlineDbService = androidDbService;
                    }
                    return offlineDbService.getReferenceData('OrderType').then(function(orderType){
                        return {"data": orderType.value};
                    });
                }
        return $http.get(Bahmni.Common.Constants.orderTypeUrl).then(function(response) {
            self.orderTypes = response.data.results;
        });
    };

    self.getOrderTypeUuid = function(orderTypeName) {
        return _.result(_.find(self.orderTypes, {display: orderTypeName}), 'uuid');
    }
}]);
