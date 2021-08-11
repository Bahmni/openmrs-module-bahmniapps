'use strict';

angular.module('bahmni.common.displaycontrol.pacsOrders')
    .directive('pacsOrders', ['orderService', 'orderTypeService', 'spinner', 'messagingService', '$window', '$translate',
        function (orderService, orderTypeService, spinner, messagingService, $window, $translate) {
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
                            $scope.$emit("no-data-present-event");
                        }
                    });
                };

                $scope.getUrl = function (orderNumber) {
                    var pacsImageTemplate = $scope.config.pacsImageUrl || "";
                    return pacsImageTemplate
                        .replace('{{patientID}}', $scope.patient.identifier)
                        .replace('{{orderNumber}}', orderNumber);
                };

                $scope.getLabel = function (bahmniOrder) {
                    return bahmniOrder.concept.shortName || bahmniOrder.concept.name;
                };

                $scope.openImage = function (bahmniOrder) {
                    var url = bahmniOrder.pacsImageUrl;
                    spinner.forAjaxPromise($.ajax({type: 'HEAD', url: url, async: false}).then(
                        function () {
                            $window.open(url, "_blank");
                        }, function () {
                        messagingService.showMessage("info", $translate.instant("NO_IMAGE_AVAILABLE_FOR_ORDER_MESSAGE") + $scope.getLabel(bahmniOrder));
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
