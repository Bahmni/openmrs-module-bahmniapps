'use strict';

angular.module('bahmni.common.orders')
    .service('orderTypeService', ['offlineDbService',
        function (offlineDbService) {

            var self = this;
            self.orderTypes = [];
            self.loadAll = function () {
                return offlineDbService.getReferenceData('OrderType').then(function (orderType) {
                    return {"data": orderType.value};
                });
            };

            self.getOrderTypeUuid = function (orderTypeName) {
                return _.result(_.find(self.orderTypes, {display: orderTypeName}), 'uuid');
            }
        }]);
