'use strict';

angular.module('bahmni.common.orders')
    .service('orderTypeService', ['androidDbService',
        function (androidDbService) {
            var self = this;
            self.orderTypes = [];
            self.loadAll = function () {
                return androidDbService.getReferenceData('OrderType').then(function (orderType) {
                    self.orderTypes = orderType.data;
                    return orderType;
                });
            };

            self.getOrderTypeUuid = function (orderTypeName) {
                return _.result(_.find(self.orderTypes, {display: orderTypeName}), 'uuid');
            };
        }]);
