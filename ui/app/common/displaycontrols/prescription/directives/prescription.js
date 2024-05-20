'use strict';

angular.module('bahmni.common.displaycontrol.prescription')
    .directive('prescription', ['treatmentService', 'treatmentConfig', '$q',
        function (treatmentService, treatmentConfig, $q) {
            var controller = function ($scope) {
                $q.all([treatmentConfig(), treatmentService.getPrescribedAndActiveDrugOrders($scope.patient.uuid, 1, false, [$scope.visitUuid], "", "", "")]).then(function (results) {
                    var treatmentConfig = results[0];
                    var drugOrderResponse = results[1].data;
                    var createDrugOrderViewModel = function (drugOrder) {
                        return Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder, treatmentConfig);
                    };
                    for (var key in drugOrderResponse) {
                        drugOrderResponse[key] = drugOrderResponse[key].map(createDrugOrderViewModel);
                    }
                    var drugUtil = Bahmni.Clinical.DrugOrder.Util;
                    var orderGroupOrders = _.groupBy(drugOrderResponse.visitDrugOrders, function (drugOrder) {
                        if (drugOrder.orderGroupUuid) {
                            return 'orderGroupOrders';
                        }
                        return 'drugOrders';
                    });
                    var drugOrdersSorted = drugUtil.sortDrugOrders(orderGroupOrders.drugOrders);
                    $scope.drugOrders = _(orderGroupOrders.orderGroupOrders)
                        .concat(drugOrdersSorted)
                        .uniqBy('uuid')
                        .value();
                    if ($scope.printParams) {
                        $scope.encounterDrugOrderMap = _($scope.drugOrders)
                            .groupBy('encounterUuid')
                            .map(function (items, encounterUuid) {
                                return {
                                    encounterUuid: encounterUuid,
                                    drugOrders: _.map(items)
                                };
                            }).value();
                    }
                });
            };
            return {
                restrict: 'EA',
                controller: controller,
                templateUrl: function (element, attrs) {
                    if (attrs.templateUrl) {
                        return attrs.templateUrl;
                    } else {
                        return "../common/displaycontrols/prescription/views/prescription.html";
                    }
                },
                scope: {
                    patient: "=",
                    visitDate: "=",
                    visitUuid: "=",
                    printParams: "="
                }
            };
        }]);
