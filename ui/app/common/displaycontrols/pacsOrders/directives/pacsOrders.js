'use strict';

angular.module('bahmni.common.displaycontrol.pacsOrders')
    .directive('pacsOrders', ['orderService', 'orderTypeService', 'spinner', 'messagingService', '$window',
        function (orderService, orderTypeService, spinner, messagingService, $window) {
            var controller = function ($scope) {
                $scope.orderTypeUuid = orderTypeService.getOrderTypeUuid($scope.orderType);

                var includeAllObs = true;
                var getOrders = function () {
                    var params = {
                        patientUuid: $scope.patient.uuid,
                        orderTypeUuid: $scope.orderTypeUuid,
                        conceptNames: $scope.config.conceptNames,
                        includeObs: includeAllObs,
                        numberOfVisits: $scope.config.numberOfVisits,
                        obsIgnoreList: $scope.config.obsIgnoreList,
                        visitUuid: $scope.visitUuid,
                        orderUuid: $scope.orderUuid
                    };
                    return orderService.getOrders(params).then(function (response) {
                        $scope.bahmniOrders = response.data;
                        _.each($scope.bahmniOrders, function (order) {
                            order.pacsImageUrl = ($scope.config.pacsImageUrl || "").replace('{{patientID}}', $scope.patient.identifier).replace('{{orderNumber}}', order.orderNumber);
                        });
                    });
                };
                var init = function () {
                    return getOrders().then(function () {
                        if (_.isEmpty($scope.bahmniOrders)) {
                            $scope.noOrdersMessage = $scope.orderType;
                        }
                    });
                };

                $scope.getUrl = function (orderNumber) {
                    var pacsImageTemplate = $scope.config.pacsImageUrl || "";
                    return pacsImageTemplate
                        .replace('{{patientID}}', $scope.patient.identifier)
                        .replace('{{orderNumber}}', orderNumber);
                };

                $scope.openImage = function (bahmniOrder) {
                    var url = bahmniOrder.pacsImageUrl;
                    spinner.forAjaxPromise($.ajax({type: 'HEAD', url: url, async: false}).then(
                        function () {
                            $window.open(url, "_blank");
                        }, function () {
                        messagingService.showMessage("info", "No image available yet for order: " + bahmniOrder.conceptName);
                    }));
                };

                $scope.initialization = init();
            };

            var link = function ($scope, element) {
                spinner.forPromise($scope.initialization, element);
            };

            return {
                restrict: 'E',
                controller: controller,
                link: link,
                templateUrl: "../common/displaycontrols/pacsOrders/views/pacsOrders.html",
                scope: {
                    patient: "=",
                    section: "=",
                    orderType: "=",
                    orderUuid: "=",
                    config: "=",
                    visitUuid: "="
                }
            };
        }
    ]);
