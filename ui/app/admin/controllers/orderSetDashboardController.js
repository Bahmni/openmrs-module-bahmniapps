'use strict';

angular.module('bahmni.common.domain')
    .controller('OrderSetDashboardController', ['$scope', '$state', 'spinner', 'appService', '$http', 'adminOrderSetService', '$location', function ($scope, $state, spinner, appService, $http, adminOrderSetService, $location) {
        $scope.appExtensions = appService.getAppDescriptor().getExtensions("bahmni.admin.orderSet", "link") || [];

        $scope.createOrEditOrderSet = function (uuid) {
            if (!uuid) {
                uuid = "new";
            }
            var url = "/orderset/" + uuid;
            $location.url(url);
        };

        $scope.removeOrderSet = function (orderSet) {
            var orderSetObj = Bahmni.Common.OrderSet.create(orderSet);
            orderSetObj.retired = true;
            spinner.forPromise(adminOrderSetService.removeOrderSet(orderSetObj)).then(function (response) {
                init();
            });
        };

        var init = function () {
            spinner.forPromise(adminOrderSetService.getAllOrderSets()).then(function (response) {
                $scope.orderSets = response.data.results;
            });
        };

        init();
    }]);
